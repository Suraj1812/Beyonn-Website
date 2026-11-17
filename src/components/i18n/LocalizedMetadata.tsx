"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";

/** Keep browser titles and descriptions in sync during client navigation. */
export function LocalizedMetadata() {
  const { t } = useLanguage();
  const originals = useRef(
    new WeakMap<Element, { source: string; rendered: string }>(),
  );
  useEffect(() => {
    const update = () => {
      document
        .querySelectorAll(
          'title, meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]',
        )
        .forEach((element) => {
          const title = element.tagName === "TITLE";
          const current = title
            ? (element.textContent ?? "")
            : (element.getAttribute("content") ?? "");
          const previous = originals.current.get(element);
          const source =
            previous && current === previous.rendered
              ? previous.source
              : current;
          let rendered = t(source);
          if (rendered === source && source.endsWith(" | Beyonn"))
            rendered = `${t(source.slice(0, -9))} | Beyonn`;
          originals.current.set(element, { source, rendered });
          if (current === rendered) return;
          if (title) element.textContent = rendered;
          else element.setAttribute("content", rendered);
        });
    };
    update();
    const observer = new MutationObserver((records) => {
      const affectsMetadata = records.some((record) => {
        const target =
          record.target instanceof Element
            ? record.target
            : record.target.parentElement;
        if (target?.matches("title, title *, meta")) return true;
        return Array.from(record.addedNodes).some(
          (node) =>
            node instanceof Element &&
            (node.matches("title, meta") ||
              Boolean(node.querySelector("title, meta"))),
        );
      });
      if (affectsMetadata) update();
    });
    // React can initially stream metadata into the body before hoisting it into the head.
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => observer.disconnect();
  }, [t]);
  return null;
}
