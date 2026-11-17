export type VisualKind = "text" | "link" | "media";
import type { CSSProperties } from "react";

export type TextFormat = { color?: string; hoverColor?: string; size?: number };
export type TextRange = TextFormat & { start: number; end: number; original: string; text?: string };

export function textFormatProps(format: TextFormat | undefined, style?: CSSProperties) {
  if (!format) return {};
  return {
    style: {
      ...style,
      ...(format.color ? { color: format.color } : {}),
      ...(format.hoverColor ? { "--cms-edit-hover-color": format.hoverColor } : {}),
      ...(format.size ? { "--cms-edit-size": `${format.size / 16}rem` } : {}),
    } as CSSProperties,
    "data-cms-size": format.size ? "" : undefined,
    "data-cms-hover-color": format.hoverColor ? "" : undefined,
  };
}

export const EDITOR_READY = "beyonn:editor-ready";
export const EDITOR_DOCUMENT = "beyonn:editor-document";
export const textColorPattern = /^#[0-9a-f]{6}$/i;
export const textSize = { min: 10, max: 96 };

export const pageOverrideKey = (path: string, kind: VisualKind, source: string) =>
  `page:${path}:${kind}:${source}`;

export const loadingTextSource = (source: string) => `loading-label:${source}`;
