"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Hero "exit": while the first screen scrolls away, this block drifts by `y`
 * pixels (positive = down) and, optionally, fades and shrinks a touch.
 */
export function ScrollExit({ children, className, y = 60, fade = false, shrink = 0 }: { children: ReactNode; className?: string; y?: number; fade?: boolean; shrink?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const update = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
      el.style.transform = `translate3d(0, ${(p * y).toFixed(1)}px, 0)${shrink ? ` scale(${(1 - p * shrink).toFixed(3)})` : ""}`;
      if (fade) el.style.opacity = String(1 - p * 0.85);
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [y, fade, shrink]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
