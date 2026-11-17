"use client";

import { useCms, useCmsText } from "@/components/control/CmsProvider";
import { normalize } from "@/lib/cms/model";
import { renderTextRanges, replaceSelectedWords, textRangesFor } from "@/lib/cms/text-ranges";
import { pageOverrideKey, textFormatProps } from "@/lib/cms/visual";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/cn";

type Segment = { text: string; className?: string };

/**
 * A statement whose words light up one by one as it scrolls through the viewport.
 * Words are dim (not hidden), so the full sentence is always readable.
 */
export function ScrollWords({ segments, className }: { segments: Segment[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { t } = useLanguage();
  const { document, editing, pathname } = useCms();
  const resolve = useCmsText();
  const source = normalize(segments.map(({ text }) => text).join(" "));
  const whole = resolve(source);
  const parts = whole === source
    ? segments.map((segment) => ({ ...segment, display: t(resolve(segment.text)) }))
    : [{ text: source, className: undefined, display: t(whole) }];
  const renderedParts = parts.map((part) => ({
    ...part,
    ranges: textRangesFor(document.textRanges, pathname, normalize(part.text)),
  }));
  const full = renderedParts.map(({ display, ranges }) => replaceSelectedWords(normalize(display), ranges)).join(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.45)));
      const lit = p * words.length;
      words.forEach((w, i) => {
        w.style.opacity = String(0.18 + 0.82 * Math.min(1, Math.max(0, lit - i)));
      });
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [full]);

  return (
    <p ref={ref} className={className} aria-label={full}
      {...textFormatProps(document.textFormats?.[pageOverrideKey(pathname, "text", source)])}>
      {renderedParts.map((part, index) => (
        <span key={index} className={part.className}
          aria-hidden={editing ? undefined : true}
          tabIndex={editing ? 0 : undefined}
          data-cms-edit-text={editing ? normalize(part.text) : undefined}
          data-cms-edit-part={editing ? "" : undefined}
          {...(whole === source ? textFormatProps(document.textFormats?.[pageOverrideKey(pathname, "text", normalize(part.text))]) : {})}>
          {renderTextRanges(part.display.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} data-w className={cn("inline-block transition-opacity duration-200")} style={{ opacity: 0.18 }}>
              {word}
              {" "}
            </span>
          )), part.ranges, editing)}
        </span>
      ))}
    </p>
  );
}

// Keep the original segment phrases available for localization and CMS editing.
ScrollWords.cmsLocalizedBoundary = true;
