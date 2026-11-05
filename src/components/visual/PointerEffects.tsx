"use client";

import { useEffect } from "react";

/**
 * Site-wide pointer polish, attached once with a delegated listener:
 * [data-magnetic] elements lean slightly toward the cursor.
 * Desktop pointers only; off for reduced motion.
 */
export function PointerEffects() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let magnet: HTMLElement | null = null;
    let raf = 0;
    let last: PointerEvent | null = null;

    const release = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };

    const tick = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
        m.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      }

    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeaveWindow = () => release();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
      cancelAnimationFrame(raf);
      release();
    };
  }, []);

  return null;
}
