import type { CSSProperties } from "react";

export type BoxStyle = {
  background?: string;
  gradient?: { from: string; to: string; angle: number };
  color?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  gap?: number;
  maxWidth?: number;
  borderRadius?: number;
  textAlign?: "left" | "center" | "right";
  hidden?: boolean;
};
export type ElementStyle = { desktop?: BoxStyle; mobile?: BoxStyle };
export type BuilderBlock = {
  id: string;
  type: "heading" | "text" | "list" | "image" | "video" | "button" | "cards" | "spacer";
  text: string;
  items?: string[];
  src?: string;
  alt?: string;
  href?: string;
};
export type BuilderSection = {
  id: string;
  label: string;
  anchor: string;
  position: "before" | "after";
  enabled: boolean;
  blocks: BuilderBlock[];
};
export type BuilderPage = {
  styles?: Record<string, ElementStyle>;
  sections?: BuilderSection[];
  lists?: Record<string, string[]>;
};
export type Builder = Record<string, BuilderPage>;
export const builderIdPattern = /^[a-zA-Z0-9_-]{1,100}$/;
export const builderSelectorPattern = /^(?:\[data-cms-section="[a-zA-Z0-9_-]{1,100}"\]|[a-z][a-z0-9-]*:nth-of-type\([1-9][0-9]{0,3}\))(?: > [a-z][a-z0-9-]*:nth-of-type\([1-9][0-9]{0,3}\))*$/;
export const boxNumbers = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft", "gap", "maxWidth", "borderRadius"] as const;
export function listKey(source: string) {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return `list-${(hash >>> 0).toString(36)}`;
}
export function boxCss(style: BoxStyle = {}) {
  const declarations: string[] = [];
  if (style.background) declarations.push(`background:${style.background}`);
  if (style.gradient) declarations.push(`background:linear-gradient(${style.gradient.angle}deg,${style.gradient.from},${style.gradient.to})`);
  if (style.color) declarations.push(`color:${style.color}`);
  for (const key of boxNumbers) if (style[key] !== undefined)
    declarations.push(`${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${style[key]}px`);
  if (style.textAlign) declarations.push(`text-align:${style.textAlign}`);
  if (style.hidden !== undefined) declarations.push(`display:${style.hidden ? "none" : "revert"}`);
  return declarations.map((value) => `${value}!important`).join(";");
}
export function builderCss(page?: BuilderPage) {
  return Object.entries(page?.styles ?? {}).map(([selector, style]) => {
    if (!builderSelectorPattern.test(selector)) return "";
    const root = `#main ${selector}`;
    const desktop = boxCss(style.desktop);
    const mobile = boxCss(style.mobile);
    return `${desktop ? `${root}{${desktop}}` : ""}${mobile ? `@media(max-width:640px){${root}{${mobile}}}` : ""}`;
  }).join("\n");
}
export function inlineBoxStyle(style: BoxStyle): CSSProperties {
  const { gradient, hidden, ...rest } = style;
  return { ...rest, ...(gradient ? { background: `linear-gradient(${gradient.angle}deg,${gradient.from},${gradient.to})` } : {}), ...(hidden ? { display: "none" } : {}) };
}

/** Validate persisted layout controls before either saving or rendering their CSS. */
export function validateBuilder(value: unknown, safeUrl: (value: string, media?: boolean) => boolean): asserts value is Builder {
  const object = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
  const color = (v: unknown) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  function fail(): never { throw new Error("Invalid page layout. Check backgrounds, spacing and content blocks."); }
  const shape = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every((key) => keys.includes(key));
  function box(v: unknown) {
    if (!object(v) || !shape(v, [...boxNumbers, "background", "gradient", "color", "textAlign", "hidden"])) fail();
    for (const key of ["background", "color"]) if (v[key] !== undefined && !color(v[key])) fail();
    for (const key of boxNumbers) if (v[key] !== undefined &&
      (typeof v[key] !== "number" || !Number.isFinite(v[key]) || Number(v[key]) < 0 || Number(v[key]) > (key === "maxWidth" ? 2400 : 320))) fail();
    if (v.textAlign !== undefined && !["left", "center", "right"].includes(String(v.textAlign))) fail();
    if (v.hidden !== undefined && typeof v.hidden !== "boolean") fail();
    if (v.gradient !== undefined) {
      const g = v.gradient;
      if (!object(g) || !shape(g, ["from", "to", "angle"]) || !color(g.from) || !color(g.to) || typeof g.angle !== "number" || !Number.isFinite(g.angle) || g.angle < 0 || g.angle > 360) fail();
    }
  }
  if (!object(value) || Object.keys(value).length > 200) fail();
  for (const [path, page] of Object.entries(value)) {
    if (!/^\/(?:[a-z0-9]+(?:[-/][a-z0-9]+)*)?$/.test(path) || !object(page) || !shape(page, ["styles", "sections", "lists"])) fail();
    if (page.styles !== undefined) {
      if (!object(page.styles) || Object.keys(page.styles).length > 500) fail();
      for (const [selector, style] of Object.entries(page.styles)) {
        if (!builderSelectorPattern.test(selector) || !object(style) || !shape(style, ["desktop", "mobile"])) fail();
        if (style.desktop !== undefined) box(style.desktop);
        if (style.mobile !== undefined) box(style.mobile);
      }
    }
    if (page.lists !== undefined) {
      if (!object(page.lists) || Object.keys(page.lists).length > 500) fail();
      for (const [id, items] of Object.entries(page.lists)) if (!builderIdPattern.test(id) || !Array.isArray(items) || items.length > 100 || items.some((item) => typeof item !== "string" || item.length > 10000)) fail();
    }
    if (page.sections !== undefined) {
      if (!Array.isArray(page.sections) || page.sections.length > 100) fail();
      const ids = new Set<string>();
      for (const section of page.sections) {
        if (!object(section) || !shape(section, ["id", "label", "anchor", "position", "enabled", "blocks"]) || typeof section.id !== "string" || !builderIdPattern.test(section.id) || ids.has(section.id) || typeof section.label !== "string" || section.label.length > 200 || typeof section.anchor !== "string" || !builderIdPattern.test(section.anchor) || !["before", "after"].includes(String(section.position)) || typeof section.enabled !== "boolean" || !Array.isArray(section.blocks) || section.blocks.length > 100) fail();
        ids.add(section.id);
        const blockIds = new Set<string>();
        for (const block of section.blocks) {
          if (!object(block) || !shape(block, ["id", "type", "text", "items", "src", "alt", "href"]) || typeof block.id !== "string" || !builderIdPattern.test(block.id) || blockIds.has(block.id) || !["heading", "text", "list", "image", "video", "button", "cards", "spacer"].includes(String(block.type)) || typeof block.text !== "string" || block.text.length > 10000) fail();
          blockIds.add(block.id);
          if (block.items !== undefined && (!Array.isArray(block.items) || block.items.length > 100 || block.items.some((item) => typeof item !== "string" || item.length > 10000))) fail();
          for (const key of ["src", "href", "alt"]) if (block[key] !== undefined && typeof block[key] !== "string") fail();
          if (block.src && !safeUrl(String(block.src), true)) fail();
          if (block.href && !safeUrl(String(block.href))) fail();
        }
      }
    }
  }
}
