"use client";

import { Localized } from "@/components/i18n/Localized";

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
  const full = segments.map((s) => t(s.text)).join(" ");

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

  return <Localized>{(
    <p ref={ref} className={className} aria-label={full}>
      {segments.map((seg, si) => (
        <span key={si} className={seg.className} aria-hidden>
          {t(seg.text).split(" ").map((w, wi) => (
            <span key={wi} data-w className={cn("inline-block transition-opacity duration-200")} style={{ opacity: 0.18 }}>
              {w}
              {" "}
            </span>
          ))}
        </span>
      ))}
    </p>
  )}</Localized>;
}
