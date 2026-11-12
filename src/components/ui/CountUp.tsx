"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Localized } from "@/components/i18n/Localized";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat like "10,000+" or "~20 yrs" up from zero the first time it
 * scrolls into view. Values without a number (e.g. "DDS") render as-is.
 */
export function CountUp({ value, duration = 1600, className }: { value: string; duration?: number; className?: string }) {
  const { t } = useLanguage();
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!match || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let fallback = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setN(0);
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - start) / duration));
          setN(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        // If frames are paused (hidden tab), never leave the real number stuck at zero.
        fallback = window.setTimeout(() => setN(target), duration + 400);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per value
  }, [value]);

  if (!match) return <Localized>{<span className={className}>{value}</span>}</Localized>;
  // Translate the complete stat once; animate only its digits so units retain
  // their target-language position and never fall back to English mid-animation.
  const translated = t(value);
  const shown = n === null ? translated : translated.replace(/[\d,]+/, n.toLocaleString("en-US"));
  return <Localized>{(
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{translated}</span>
    </span>
  )}</Localized>;
}
