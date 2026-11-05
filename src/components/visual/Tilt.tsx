"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Gentle 3D tilt that follows the pointer, with a soft light sweep on top.
 * Only for a fine pointer with hover (desktop); touch and reduced-motion users
 * get the plain card. Uses CSS variables + transform only, one write per frame.
 */
export function Tilt({ children, className, max = 6, shine = true }: { children: ReactNode; className?: string; max?: number; shine?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const allowed = useRef<boolean | null>(null);

  const can = () => {
    if (allowed.current === null) {
      allowed.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return allowed.current;
  };

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !can()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.dataset.tilt = "on";
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilt;
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("tilt", className)}>
      {children}
      {shine && <span className="tilt-shine" aria-hidden />}
    </div>
  );
}
