"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";

/** Keep browser titles and descriptions in sync during client navigation. */
export function LocalizedMetadata() {
  const { t } = useLanguage();
  const originals = useRef(new WeakMap<Element, { source: string; rendered: string }>());
  useEffect(() => {
    const update = () => {
      document.head.querySelectorAll('title, meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach((element) => {
        const title = element.tagName === "TITLE";
        const current = title ? element.textContent ?? "" : element.getAttribute("content") ?? "";
        const previous = originals.current.get(element);
        const source = previous && current === previous.rendered ? previous.source : current;
        let rendered = t(source);
        if (rendered === source && source.endsWith(" | Beyonn")) rendered = `${t(source.slice(0, -9))} | Beyonn`;
        originals.current.set(element, { source, rendered });
        if (current === rendered) return;
        if (title) element.textContent = rendered;
        else element.setAttribute("content", rendered);
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["content"] });
    return () => observer.disconnect();
  }, [t]);
  return null;
}
