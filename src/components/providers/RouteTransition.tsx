"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

let hydrated = false;

/**
 * Client navigation: a navy curtain with the Beyonn emblem sweeps up off the new
 * page while the content settles in. Skipped on the first, server-rendered load
 * (the intro handles that) and for reduced motion.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!hydrated) {
        hydrated = true;
        return;
      }
      if (window.matchMedia("(width < 48rem), (prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline();
      tl.set(curtain.current, { display: "grid", yPercent: 0 })
        .fromTo(curtain.current!.firstElementChild, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" })
        .to(curtain.current, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, "+=0.1")
        .set(curtain.current, { display: "none" })
        .fromTo(ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity" }, 0.35);
    },
    { scope: ref },
  );

  return (
    <>
      <div ref={curtain} className="route-curtain" aria-hidden>
        <div className="route-curtain__emblem" />
      </div>
      <div ref={ref}>{children}</div>
    </>
  );
}
