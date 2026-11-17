import { pages } from "@/content/pages";
import * as siteContent from "@/content/site";
import * as faqs from "@/content/faqs";
import { articles } from "@/content/articles";
import { team } from "@/content/team";
import { academyTiers } from "@/content/academy";
import { protocolSteps } from "@/content/protocol";
import { endorsements } from "@/content/endorsements";
import { workshopContent } from "@/content/workshop";
import homeBlocks from "./home-blocks.json";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
export type MediaAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  alt: string;
  description: string;
  createdAt: string;
};
export type HomeBlock = {
  id: string;
  label: string;
  enabled: boolean;
  section?: Json;
};
export type Theme = {
  gradient?: { enabled: boolean; from: string; to: string; angle: number };
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  heading: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  fontSize: number;
  radius: number;
  buttonRadius: number;
  spacing: number;
  buttonPadding: number;
  shadow: boolean;
  headerBackground: string;
  footerBackground: string;
};
export type CmsDocument = {
  version: 1;
  data: Record<string, Json>;
  overrides: Record<string, string>;
  theme: Theme;
  media: MediaAsset[];
  home: HomeBlock[];
  seo: Record<string, { title: string; description: string }>;
  components: Record<string, boolean>;
};
export type Revision = {
  id: string;
  at: string;
  label: string;
  document: CmsDocument;
};
export const defaultTheme: Theme = {
  primary: "#3177bf",
  secondary: "#1c395e",
  accent: "#72cfb7",
  background: "#ffffff",
  surface: "#f2f7fd",
  text: "#111827",
  heading: "#1c395e",
  muted: "#71717a",
  headingFont: "Montserrat",
  bodyFont: "Inter",
  fontSize: 16,
  radius: 16,
  buttonRadius: 999,
  spacing: 80,
  buttonPadding: 20,
  shadow: true,
  headerBackground: "#ffffff",
  footerBackground: "#13253e",
};
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Json;
export function createDefaultDocument(): CmsDocument {
  return {
    version: 1,
    data: {
      pages: json(pages),
      site: json(siteContent.site),
      primaryNav: json(siteContent.primaryNav),
      signInNav: json(siteContent.signInNav),
      footerNav: json(siteContent.footerNav),
      legalNav: json(siteContent.legalNav),
      articles: json(articles),
      team: json(team),
      academyTiers: json(academyTiers),
      protocolSteps: json(protocolSteps),
      endorsements: json(endorsements),
      workshopContent: json(workshopContent),
      ...Object.fromEntries(Object.entries(faqs).map(([k, v]) => [k, json(v)])),
    },
    overrides: {},
    theme: { ...defaultTheme },
    media: [],
    home: homeBlocks,
    seo: {},
    components: {
      header: true,
      footer: true,
      guide: true,
      particles: true,
      pointer: true,
      announcement: true,
    },
  };
}
export const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
export function safeUrl(value: string, media = false): boolean {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("cms-media:"))
    return media && /^cms-media:[a-zA-Z0-9-]+$/.test(value);
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return true;
  if (!media && (value.startsWith("#") || /^(mailto:|tel:)[^<>]+$/.test(value)))
    return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);
/** Check editable JSON against the existing content shapes, including optional fields and arrays. */
function checkShape(samples: Json[], value: Json, path: string) {
  const kind = (v: Json) =>
    v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  const matches = samples.filter((sample) => kind(sample) === kind(value));
  if (!matches.length) throw new Error(`Invalid content type at ${path}.`);
  if (Array.isArray(value)) {
    const items = matches.flatMap((sample) => sample as Json[]);
    if (items.length)
      value.forEach((item, index) =>
        checkShape(items, item, `${path}[${index + 1}]`),
      );
  } else if (value && typeof value === "object") {
    const objects = matches as Record<string, Json>[];
    const keys = new Set(objects.flatMap((object) => Object.keys(object)));
    for (const key of keys) {
      const children = objects
        .filter((object) => key in object)
        .map((object) => object[key]);
      if (!(key in value)) {
        if (children.length === objects.length)
          throw new Error(`Missing field ${path}.${key}.`);
      } else checkShape(children, value[key], `${path}.${key}`);
    }
  }
}
export function validateDocument(value: unknown): asserts value is CmsDocument {
  if (!value || typeof value !== "object")
    throw new Error("Invalid CMS document.");
  const d = value as CmsDocument;
  if (
    d.version !== 1 ||
    !d.data ||
    !d.theme ||
    !Array.isArray(d.home) ||
    !Array.isArray(d.media) ||
    !d.overrides ||
    !d.seo ||
    !d.components
  )
    throw new Error("Unsupported CMS document.");
  const walk = (v: unknown, key = "", depth = 0) => {
    if (depth > 35) throw new Error("Content nesting is too deep.");
    if (typeof v === "string") {
      if (v.length > 100_000) throw new Error("A content field is too large.");
      if (
        /^(href|url|src|image|photo|poster|phoneHref|appStore|googlePlay)$/i.test(
          key,
        ) &&
        v &&
        !safeUrl(v, /^(src|image|photo|poster)$/i.test(key))
      )
        throw new Error(`Unsafe URL in ${key}. Use a local path or HTTPS URL.`);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key, depth + 1));
    else if (v && typeof v === "object")
      Object.entries(v).forEach(([k, x]) => {
        if (blockedKeys.has(k)) throw new Error("Invalid content key.");
        walk(x, k, depth + 1);
      });
  };
  walk(d);
  if (
    Array.isArray(d.data) ||
    Array.isArray(d.overrides) ||
    Array.isArray(d.components) ||
    Array.isArray(d.seo)
  )
    throw new Error("Content groups must be objects.");
  if (!Object.values(d.components).every((v) => typeof v === "boolean"))
    throw new Error("Component visibility must be on or off.");
  const required = createDefaultDocument();
  for (const [key, original] of Object.entries(required.data)) {
    const current = d.data[key];
    if (
      current === undefined ||
      Array.isArray(original) !== Array.isArray(current) ||
      typeof original !== typeof current
    )
      throw new Error(`Invalid content collection: ${key}`);
  }
  for (const [key, original] of Object.entries(required.data))
    if (key !== "pages") checkShape([original], d.data[key], key);
  const pageSamples = Object.values(
    required.data.pages as Record<string, Json>,
  );
  const pageMap = d.data.pages as Record<string, Json>;
  for (const [slug, value] of Object.entries(pageMap)) {
    if (
      !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(slug) ||
      (/^(control|api|resources|local|_next|og)(\/|$)/.test(slug) &&
        !(slug in pages))
    )
      throw new Error("Invalid or reserved page path.");
    checkShape(pageSamples, value, slug);
    const p = value as Record<string, Json>;
    if (
      !p ||
      typeof p.title !== "string" ||
      typeof p.description !== "string" ||
      !Array.isArray(p.sections)
    )
      throw new Error(`Invalid page: ${slug}`);
  }
  const articleSlugs = new Set<string>();
  for (const article of d.data.articles as Record<string, Json>[]) {
    const slug = String(article.slug);
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      articleSlugs.has(slug) ||
      !["practitioners", "patients"].includes(String(article.audience))
    )
      throw new Error(
        "Articles need unique lowercase paths and a supported audience.",
      );
    articleSlugs.add(slug);
  }
  for (const [path, seo] of Object.entries(d.seo))
    if (
      !path.startsWith("/") ||
      !seo ||
      typeof seo.title !== "string" ||
      typeof seo.description !== "string"
    )
      throw new Error("Invalid search metadata.");
  for (const asset of d.media)
    if (
      !asset ||
      !/^[a-zA-Z0-9-]{20,64}$/.test(asset.id) ||
      typeof asset.name !== "string" ||
      typeof asset.alt !== "string" ||
      typeof asset.type !== "string" ||
      typeof asset.description !== "string" ||
      !Number.isFinite(asset.size)
    )
      throw new Error("Invalid media information.");
  if (d.theme.gradient) {
    const gradient = d.theme.gradient;
    if (
      typeof gradient.enabled !== "boolean" ||
      !/^#[0-9a-f]{6}$/i.test(gradient.from) ||
      !/^#[0-9a-f]{6}$/i.test(gradient.to) ||
      !Number.isFinite(gradient.angle) ||
      gradient.angle < 0 ||
      gradient.angle > 360
    )
      throw new Error("Invalid hero background gradient.");
  }
  for (const key of Object.keys(defaultTheme) as (keyof Theme)[]) {
    const v = d.theme[key];
    if (typeof v !== typeof defaultTheme[key])
      throw new Error(`Invalid theme value: ${key}`);
    if (
      typeof v === "string" &&
      key !== "headingFont" &&
      key !== "bodyFont" &&
      !/^#[0-9a-f]{6}$/i.test(v)
    )
      throw new Error("Use six-digit hex colors.");
  }
  if (
    !["Montserrat", "Inter", "Georgia", "system-ui"].includes(
      d.theme.headingFont,
    ) ||
    !["Montserrat", "Inter", "Georgia", "system-ui"].includes(d.theme.bodyFont)
  )
    throw new Error("Choose a supported font.");
  for (const [key, min, max] of [
    ["fontSize", 14, 20],
    ["radius", 0, 32],
    ["buttonRadius", 0, 999],
    ["spacing", 40, 120],
    ["buttonPadding", 12, 32],
  ] as const)
    if (
      !Number.isFinite(d.theme[key]) ||
      d.theme[key] < min ||
      d.theme[key] > max
    )
      throw new Error(`Theme ${key} is outside its safe range.`);
  for (const block of d.home)
    if (
      !block ||
      typeof block.id !== "string" ||
      typeof block.label !== "string" ||
      typeof block.enabled !== "boolean"
    )
      throw new Error("Invalid home section.");
  for (const [key, v] of Object.entries(d.overrides))
    if (
      typeof v !== "string" ||
      (/^(media|link):/.test(key) && v && !safeUrl(v, key.startsWith("media:")))
    )
      throw new Error("Invalid replacement URL.");
}
