"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Accent word with a hand-drawn underline that draws itself from left to right
 * on page load and every time it scrolls back into view. `play={false}` holds it
 * undrawn (used by the hero slider so each slide draws its own line).
 */
export function Scribble({ children, play = true }: { children: React.ReactNode; play?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setDrawn(entry.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <em ref={ref} className="relative inline-block">
      {children}
      <svg className="pointer-events-none absolute -bottom-[0.14em] left-0 h-[0.3em] w-full overflow-visible" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden>
        <path
          d="M3 9.5C38 4 70 12 104 7.5S168 3.5 197 8"
          pathLength={1}
          data-drawn={drawn && play}
          className="scribble-path"
          fill="none"
          stroke="var(--scribble, var(--color-dawn))"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </em>
  );
}
