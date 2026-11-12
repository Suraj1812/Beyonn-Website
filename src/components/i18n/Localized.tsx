"use client";

import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { translateText, type Catalog } from "@/lib/i18n/languages";
import { useLanguage } from "./LanguageProvider";

type ElementProps = { children?: ReactNode; translate?: string; [key: string]: unknown };
const translatedAttributes = ["alt", "title", "placeholder", "aria-label", "aria-description", "aria-valuetext"];
const excludedTags = new Set(["script", "style", "code", "pre"]);
const phraseTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "legend", "figcaption"]);

function plainText(node: ReactNode): string {
  return Children.toArray(node).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    return isValidElement<ElementProps>(child) ? plainText(child.props.children) : "";
  }).join("");
}

/** Render translated React text, preserving elements, handlers, keys and refs. Never mutate the DOM. */
function localize(node: ReactNode, catalog: Catalog): ReactNode {
  if (typeof node === "string") return translateText(node, catalog);
  if (Array.isArray(node)) return node.map((child) => localize(child, catalog));
  if (!isValidElement<ElementProps>(node)) return node;
  const { type, props } = node;
  if (type === Localized || type === LocalizedWords) return node;
  if (props.translate === "no" || (typeof type === "string" && excludedTags.has(type))) return node;
  const updates: Record<string, unknown> = {};
  for (const attribute of translatedAttributes) {
    if (typeof props[attribute] === "string") updates[attribute] = translateText(props[attribute], catalog);
  }
  if (props.children !== undefined && type !== "textarea") {
    const sentence = plainText(props.children).replace(/\s+/g, " ").trim();
    // Translate inline emphasis and animated word spans as one grammatical phrase.
    // Interactive elements retain their own boundaries and handlers.
    const interactive = (children: ReactNode): boolean => Children.toArray(children).some((child) =>
      isValidElement<ElementProps>(child) && (Boolean(child.props.href || child.props.onClick) ||
        ["button", "input", "select", "textarea"].includes(String(child.type)) || interactive(child.props.children)));
    const structural = (children: ReactNode): boolean => Children.toArray(children).some((child) =>
      isValidElement<ElementProps>(child) && (["time", "br", "svg", "img", "div"].includes(String(child.type)) ||
        Boolean(child.props["aria-hidden"]) || structural(child.props.children)));
    updates.children = typeof type === "string" && phraseTags.has(type) && catalog[sentence] && !interactive(props.children) && !structural(props.children)
      ? catalog[sentence]
      : localize(props.children, catalog);
  }
  if (type === "input" && ["button", "submit", "reset"].includes(String(props.type)) && typeof props.value === "string") updates.value = translateText(props.value, catalog);
  return cloneElement(node as ReactElement<ElementProps>, updates);
}

/** Each component owns a boundary so freshly rendered forms, dialogs and menus are translated too. */
export function Localized({ children, text }: { children: ReactNode; text?: string }) {
  const { catalog, language } = useLanguage();
  if (language === "en") return <>{children}</>;
  // Word-by-word animation spans must be translated as a sentence, preserving word order.
  if (text && catalog[text.replace(/\s+/g, " ").trim()]) return <>{translateText(text, catalog)}</>;
  return <>{localize(children, catalog)}</>;
}

/** Used by animated headings whose source text is split into individual word spans. */
export function LocalizedWords({ children }: { children: ReactNode }) {
  const text = plainText(children);
  return <Localized text={text}><Fragment>{children}</Fragment></Localized>;
}
