import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync('src/lib/i18n/messages.json', 'utf8'));
const overrides = JSON.parse(fs.readFileSync('scripts/i18n-ui-overrides.json', 'utf8'));
const languages = Object.keys(overrides);
const errors = [];
const clinical = JSON.parse(fs.readFileSync('scripts/i18n-clinical-checks.json', 'utf8'));
const normalizeDigits = (text) => {
  const sets = ['٠١٢٣٤٥٦٧٨٩', '۰۱۲۳۴۵۶۷۸۹', '०१२३४५६७८९', '০১২৩৪৫৬৭৮৯', '௦௧௨௩௪௫௬௭௮௯', '൦൧൨൩൪൫൬൭൮൯'];
  return text.normalize('NFKC').replace(/\p{Decimal_Number}/gu, (digit) => {
    const set = sets.find((digits) => digits.includes(digit));
    return set ? String(set.indexOf(digit)) : digit;
  });
};
const configured = [...fs.readFileSync('src/lib/i18n/languages.ts', 'utf8').matchAll(/code: "([a-z]+)"/g)].map((match) => match[1]).filter((code) => code !== 'en').sort();
if (JSON.stringify(configured) !== JSON.stringify([...languages].sort())) errors.push('Advertised languages and catalog configuration differ.');
for (const language of languages) {
  const path = `public/locales/${language}.json`;
  if (!fs.existsSync(path)) { errors.push(`${language}: missing catalog`); continue; }
  const catalog = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const key of source) {
    const value = catalog[key];
    if (typeof value !== 'string' || !value.trim()) { errors.push(`${language}: missing ${key}`); continue; }
    const variables = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    if (variables(key) !== variables(value)) errors.push(`${language}: mismatched placeholders: ${key}`);
  }
  const question = catalog[clinical.breathingQuestion.source] ?? '';
  const concepts = clinical.breathingQuestion.concepts[language];
  if (!concepts) errors.push(`${language}: no clinical concept checks configured`);
  else for (const [concept, term] of Object.entries(concepts)) {
    if (!question.includes(term)) errors.push(`${language}: screening question lost ${concept}`);
  }
  const measurement = normalizeDigits(catalog[clinical.neckMeasurement.source] ?? '');
  for (const number of clinical.neckMeasurement.requiredNumbers) {
    if (!new RegExp(`(?<!\\d)${number}(?!\\d)`).test(measurement)) errors.push(`${language}: neck measurement lost ${number}`);
  }
  for (const [key, rules] of Object.entries(clinical.strictThresholds)) {
    const rule = rules[language];
    if (rule && (!catalog[key]?.includes(rule.required) || rule.forbidden.some((term) => catalog[key].includes(term)))) errors.push(`${language}: strict clinical threshold changed: ${key}`);
  }
  const personTerm = clinical.nightGuardForbiddenPersonTerms[language];
  for (const [key, value] of Object.entries(catalog)) {
    if (/\bTMD\b/.test(key)) for (const term of clinical.medicalAcronymForbiddenTerms[language] ?? []) {
      if (value.includes(term)) errors.push(`${language}: unrelated expansion of a medical acronym: ${key}`);
    }
    if (/night guards?/i.test(key) && personTerm && new RegExp(personTerm, 'iu').test(value)) errors.push(`${language}: dental splint translated as a person: ${key}`);
    if (/\bC[DS]?T\b/.test(key)) for (const term of clinical.timezoneForbiddenTerms[language] ?? []) {
      if (value.includes(term)) errors.push(`${language}: US workshop timezone was changed: ${key}`);
    }
  }
  for (const [key, value] of Object.entries(overrides[language])) {
    if (catalog[key] !== value) errors.push(`${language}: reviewed translation was overwritten: ${key}`);
  }
}
if (errors.length) {
  console.error(errors.slice(0, 30).join('\n'));
  console.error(`${errors.length} translation errors`);
  process.exitCode = 1;
} else console.log(`Complete catalogs: English + ${languages.length} languages, ${source.length} messages each.`);
