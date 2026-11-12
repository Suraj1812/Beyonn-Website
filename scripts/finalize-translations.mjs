import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync('src/lib/i18n/messages.json', 'utf8'));
const overrides = JSON.parse(fs.readFileSync('scripts/i18n-ui-overrides.json', 'utf8'));
for (const [language, reviewed] of Object.entries(overrides)) {
  if (process.argv.length > 2 && !process.argv.slice(2).includes(language)) continue;
  const path = `public/locales/${language}.json`;
  if (!fs.existsSync(path)) continue;
  const entries = { ...JSON.parse(fs.readFileSync(path, 'utf8')), ...reviewed };
  const result = Object.fromEntries(source.filter((key) => entries[key]).map((key) => [key, entries[key]]));
  fs.writeFileSync(path, JSON.stringify(result, null, 2) + '\n');
}
