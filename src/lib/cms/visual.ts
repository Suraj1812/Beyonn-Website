export type VisualKind = "text" | "link" | "media";
export type TextFormat = { color?: string; size?: number };

export const EDITOR_READY = "beyonn:editor-ready";
export const EDITOR_DOCUMENT = "beyonn:editor-document";
export const textColorPattern = /^#[0-9a-f]{6}$/i;
export const textSize = { min: 10, max: 96 };

export const pageOverrideKey = (path: string, kind: VisualKind, source: string) =>
  `page:${path}:${kind}:${source}`;
