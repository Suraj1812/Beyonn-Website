"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat like "10,000+" or "~20 yrs" up from zero the first time it
 * scrolls into view. Values without a number (e.g. "DDS") render as-is.
 */
export function CountUp({ value, duration = 1600, className }: { value: string; duration?: number; className?: string }) {
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

  if (!match) return <span className={className}>{value}</span>;
  const shown = n === null ? value : `${match[1]}${n.toLocaleString("en-US")}${match[3]}`;
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
