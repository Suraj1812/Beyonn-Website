/** Native names make the language picker usable before a visitor understands English. */
export const languages = [
  { code: "en", name: "English", english: "English" },
  { code: "hi", name: "हिन्दी", english: "Hindi" },
  { code: "bn", name: "বাংলা", english: "Bengali" },
  { code: "mr", name: "मराठी", english: "Marathi" },
  { code: "ta", name: "தமிழ்", english: "Tamil" },
  { code: "ml", name: "മലയാളം", english: "Malayalam" },
  { code: "ur", name: "اردو", english: "Urdu", rtl: true },
  { code: "ar", name: "العربية", english: "Arabic", rtl: true },
  { code: "es", name: "Español", english: "Spanish" },
  { code: "fr", name: "Français", english: "French" },
  { code: "de", name: "Deutsch", english: "German" },
  { code: "pt", name: "Português", english: "Portuguese" },
  { code: "ru", name: "Русский", english: "Russian" },
  { code: "zh", name: "简体中文", english: "Chinese (Simplified)" },
  { code: "ja", name: "日本語", english: "Japanese" },
  { code: "ko", name: "한국어", english: "Korean" },
  { code: "id", name: "Bahasa Indonesia", english: "Indonesian" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese" },
  { code: "tr", name: "Türkçe", english: "Turkish" },
  { code: "it", name: "Italiano", english: "Italian" },
  { code: "nl", name: "Nederlands", english: "Dutch" },
  { code: "pl", name: "Polski", english: "Polish" },
] as const;

export type Language = (typeof languages)[number]["code"];
export type Catalog = Record<string, string>;
export const LANGUAGE_STORAGE_KEY = "beyonn:language";
export const supportedLanguage = (value: string | null): Language | undefined =>
  languages.find(({ code }) => code === value)?.code;

/** Respect the browser's ordered preferences, including regional tags such as hi-IN. */
export function detectLanguage(preferences: readonly string[]): Language {
  for (const preference of preferences) {
    const code = supportedLanguage(preference.toLowerCase().replace(/_/g, "-").split("-")[0]);
    if (code) return code;
  }
  return "en";
}

export function direction(language: Language): "ltr" | "rtl" {
  return languages.some((item) => item.code === language && "rtl" in item && item.rtl) ? "rtl" : "ltr";
}

/** Only message keys belong to a catalog; Object prototype names are ordinary text. */
const lookup = (catalog: Catalog, key: string): string | undefined =>
  Object.prototype.hasOwnProperty.call(catalog, key) && typeof catalog[key] === "string" ? catalog[key] : undefined;

const templates = new WeakMap<Catalog, { expression: RegExp; value: string; names: string[] }[]>();

export function translateText(text: string, catalog: Catalog): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  let translated = lookup(catalog, normalized);
  if (!translated) {
    let patterns = templates.get(catalog);
    if (!patterns) {
      patterns = Object.entries(catalog).filter(([key]) => /\{\w+\}/.test(key)).map(([key, value]) => {
        const names: string[] = [];
        const parts = key.split(/(\{\w+\})/).map((part) => {
          if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1, -1)); return "(.+?)"; }
          return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        });
        return { expression: new RegExp(`^${parts.join("")}$`), value, names };
      });
      templates.set(catalog, patterns);
    }
    for (const { expression, value, names } of patterns) {
      const match = normalized.match(expression);
      if (!match) continue;
      translated = value.replace(/\{(\w+)\}/g, (original, name: string) => {
        const index = names.indexOf(name);
        return index < 0 ? original : lookup(catalog, match[index + 1]) ?? lookup(catalog, match[index + 1].charAt(0).toUpperCase() + match[index + 1].slice(1)) ?? match[index + 1];
      });
      break;
    }
  }
  if (!translated && normalized.includes(" · ")) {
    const parts = normalized.split(" · ");
    const result = parts.map((part) => translateText(part, catalog)).join(" · ");
    if (result !== normalized) translated = result;
  }
  if (!translated) return text;
  return text.replace(/\S[\s\S]*\S|\S/, () => translated);
}
