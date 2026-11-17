"use client";

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { translateText, type Catalog } from "@/lib/i18n/languages";
import { useCms, useCmsText } from "@/components/control/CmsProvider";
import { safeUrl, normalize } from "@/lib/cms/model";
import { useLanguage } from "./LanguageProvider";
import { pageOverrideKey, type TextFormat } from "@/lib/cms/visual";

type ElementProps = {
  children?: ReactNode;
  translate?: string;
  [key: string]: unknown;
};
const translatedAttributes = [
  "alt",
  "title",
  "placeholder",
  "aria-label",
  "aria-description",
  "aria-valuetext",
];
// Client-rendered components that own a localization boundary must translate their own fresh output.
const ownsBoundary = (type: unknown) =>
  typeof type === "function" &&
  (type as { cmsLocalizedBoundary?: boolean }).cmsLocalizedBoundary === true;
const excludedTags = new Set(["script", "style", "code", "pre"]);
const phraseTags = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "blockquote",
  "legend",
  "figcaption",
]);

function plainText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      return isValidElement<ElementProps>(child)
        ? plainText(child.props.children)
        : "";
    })
    .join("");
}

/** Render translated React text, preserving elements, handlers, keys and refs. Never mutate the DOM. */
function localize(node: ReactNode, catalog: Catalog): ReactNode {
  if (typeof node === "string") return translateText(node, catalog);
  if (Array.isArray(node)) return Children.map(node, (child) => localize(child, catalog));
  if (!isValidElement<ElementProps>(node)) return node;
  const { type, props } = node;
  if (type === Localized || type === LocalizedWords || ownsBoundary(type))
    return node;
  if (
    props.translate === "no" ||
    (typeof type === "string" && excludedTags.has(type))
  )
    return node;
  const updates: Record<string, unknown> = {};
  for (const attribute of translatedAttributes) {
    if (typeof props[attribute] === "string")
      updates[attribute] = translateText(props[attribute], catalog);
  }
  if (props.children !== undefined && type !== "textarea") {
    const sentence = plainText(props.children).replace(/\s+/g, " ").trim();
    // Translate inline emphasis and animated word spans as one grammatical phrase.
    // Interactive elements retain their own boundaries and handlers.
    const interactive = (children: ReactNode): boolean =>
      Children.toArray(children).some(
        (child) =>
          isValidElement<ElementProps>(child) &&
          (Boolean(child.props.href || child.props.onClick) ||
            ["button", "input", "select", "textarea"].includes(
              String(child.type),
            ) ||
            interactive(child.props.children)),
      );
    const structural = (children: ReactNode): boolean =>
      Children.toArray(children).some(
        (child) =>
          isValidElement<ElementProps>(child) &&
          (["time", "br", "svg", "img", "div"].includes(String(child.type)) ||
            Boolean(child.props["aria-hidden"]) ||
            structural(child.props.children)),
      );
    updates.children =
      typeof type === "string" &&
      phraseTags.has(type) &&
      catalog[sentence] &&
      !interactive(props.children) &&
      !structural(props.children)
        ? catalog[sentence]
        : localize(props.children, catalog);
  }
  if (
    type === "input" &&
    ["button", "submit", "reset"].includes(String(props.type)) &&
    typeof props.value === "string"
  )
    updates.value = translateText(props.value, catalog);
  return cloneElement(node as ReactElement<ElementProps>, updates);
}

/** Apply CMS values to React trees before translation, preserving handlers and component state. */
type ManagedOptions = {
  resolve: ReturnType<typeof useCmsText>;
  editing: boolean;
  pathname: string;
  formats?: Record<string, TextFormat>;
};

function managed(node: ReactNode, options: ManagedOptions): ReactNode {
  const { resolve, editing, pathname, formats } = options;
  if (typeof node === "string") return resolve(node);
  if (Array.isArray(node)) return Children.map(node, (child) => managed(child, options));
  if (!isValidElement<ElementProps>(node)) return node;
  if (
    node.type === Localized ||
    node.type === LocalizedWords ||
    ownsBoundary(node.type) ||
    (typeof node.type === "string" && excludedTags.has(node.type))
  )
    return node;
  const updates: Record<string, unknown> = {};
  for (const key of [
    "title",
    "alt",
    "placeholder",
    "aria-label",
    "sub",
    "lead",
    "eyebrow",
    "label",
    "text",
    "value",
  ]) {
    if (typeof node.props[key] === "string")
      updates[key] = resolve(node.props[key] as string);
    else if (isValidElement(node.props[key]))
      updates[key] = managed(node.props[key] as ReactNode, options);
  }
  for (const key of ["href", "src", "poster"]) {
    const value = node.props[key];
    if (typeof value !== "string") continue;
    const kind = key === "href" ? "link" : "media";
    if (editing && key !== "poster" && safeUrl(value, kind === "media")) {
      updates[`data-cms-edit-${kind}`] = normalize(value);
      if (kind === "media" && node.type !== "iframe" && node.type !== "source")
        updates.tabIndex = node.props.tabIndex ?? 0;
    }
    const next = resolve(value, kind);
    if (key === "src") {
      const original = `media-alt:${value}`;
      const alt = resolve(original);
      if (alt !== original) {
        if (node.type === "iframe" || node.type === "video") updates.title = alt;
        else updates.alt = alt;
      }
    }
    if (
      key === "src" &&
      typeof node.type !== "string" &&
      /^(https:|blob:|\/api\/control\/media\/)/.test(next)
    )
      updates.unoptimized = true;
    if (
      next !== value &&
      (safeUrl(next, key !== "href") ||
        (next.startsWith("blob:") && key !== "href"))
    ) {
      if (
        node.type === "iframe" &&
        !next.startsWith("blob:") &&
        !next.startsWith("/api/control/media/")
      ) {
        try {
          if (
            ![
              "player.mux.com",
              "www.youtube.com",
              "www.youtube-nocookie.com",
              "player.vimeo.com",
            ].includes(new URL(next).hostname)
          )
            continue;
        } catch {
          continue;
        }
      }
      updates[key] = next;
      if (key === "src" && typeof node.type !== "string")
        updates.unoptimized = true;
    }
  }
  if (typeof node.props.className === "string") {
    for (const match of node.props.className.matchAll(
      /(mask|background(?:-image)?):url\(([^)]+)\)/g,
    )) {
      if (editing) updates["data-cms-edit-media"] ??= match[2];
      const next = resolve(match[2], "media");
      if (
        next !== match[2] &&
        (safeUrl(next, true) || next.startsWith("/api/control/media/"))
      ) {
        const style = {
          ...((node.props.style as Record<string, unknown>) ?? {}),
          ...((updates.style as Record<string, unknown>) ?? {}),
        };
        if (match[1] === "mask") {
          style.maskImage = `url(${JSON.stringify(next)})`;
          style.WebkitMaskImage = style.maskImage;
        } else style.backgroundImage = `url(${JSON.stringify(next)})`;
        updates.style = style;
      }
    }
  }
  if (node.props.children !== undefined && node.type !== "textarea") {
    const phrase = normalize(plainText(node.props.children));
    const children = Children.toArray(node.props.children);
    const directText = normalize(children.filter((child) => typeof child === "string").join(""));
    // Some actions render raw text beside an icon. Give the text a CMS target
    // while keeping the icon and the action's original layout.
    const actionLabel = Boolean(directText && directText === phrase &&
      (node.type === "button" || typeof node.props.href === "string"));
    const editableText = phrase && (actionLabel || (typeof node.type === "string" &&
      (phraseTags.has(node.type) || typeof node.props.children === "string")));
    const replacement = editableText ? resolve(phrase) : phrase;
    if (editableText) {
      if (editing) {
        updates["data-cms-edit-text"] = phrase;
        if (typeof node.type === "string" && phraseTags.has(node.type))
          updates.tabIndex = node.props.tabIndex ?? 0;
      }
      const format = formats?.[pageOverrideKey(pathname, "text", phrase)];
      if (format?.color || format?.size) {
        updates.style = {
          ...((node.props.style as Record<string, unknown>) ?? {}),
          ...((updates.style as Record<string, unknown>) ?? {}),
          ...(format.color ? { color: format.color } : {}),
          ...(format.size ? { "--cms-edit-size": `${format.size / 16}rem` } : {}),
        };
        if (format.size) updates["data-cms-size"] = "";
      }
    }
    if (actionLabel && replacement !== phrase) {
      let first = true;
      updates.children = Children.map(node.props.children, (child) => {
        if (typeof child !== "string" || !child.trim()) return managed(child, options);
        if (!first) return null;
        first = false;
        return replacement;
      });
      const aria = node.props["aria-label"];
      if (typeof aria === "string" && (aria === phrase || aria.startsWith(`${phrase} (`)))
        updates["aria-label"] = replacement + aria.slice(phrase.length);
    } else {
      updates.children = replacement !== phrase ? replacement : managed(node.props.children, options);
    }
  }
  if (
    node.type === "iframe" &&
    typeof updates.src === "string" &&
    (updates.src.startsWith("blob:") ||
      updates.src.startsWith("/api/control/media/"))
  )
    return (
      <video
        key={node.key}
        src={updates.src}
        title={String(updates.title ?? node.props.title ?? "Video")}
        data-cms-edit-media={updates["data-cms-edit-media"] as string | undefined}
        controls
        preload="metadata"
        className={String(node.props.className ?? "")}
      />
    );
  return cloneElement(node, updates);
}

/** Each component owns a boundary so freshly rendered forms, dialogs and menus are translated too. */
export function Localized({
  children,
  text,
}: {
  children: ReactNode;
  text?: string;
}) {
  const { catalog } = useLanguage();
  const resolve = useCmsText();
  const { document, editing, pathname } = useCms();
  const content = managed(children, { resolve, editing, pathname, formats: document.textFormats });
  if (text && resolve(normalize(text)) !== normalize(text))
    return <>{translateText(resolve(normalize(text)), catalog)}</>;
  // Word-by-word animation spans must be translated as a sentence, preserving word order.
  if (text && catalog[text.replace(/\s+/g, " ").trim()])
    return <>{translateText(text, catalog)}</>;
  // Traverse both the source language and translations so React child keys stay stable.
  return <>{localize(content, catalog)}</>;
}

/** Used by animated headings whose source text is split into individual word spans. */
export function LocalizedWords({ children }: { children: ReactNode }) {
  const text = plainText(children);
  return (
    <Localized text={text}>
      <Fragment>{children}</Fragment>
    </Localized>
  );
}
