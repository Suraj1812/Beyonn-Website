"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

function anchorOffset() {
  // On phones the target's CSS scroll margin already clears the fixed header.
  return window.matchMedia("(width < 48rem)").matches ? 0 : -96;
}

/** Let the browser handle wheel/touch inertia; retain anchor navigation and modal locks. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ autoRaf: true, smoothWheel: false, syncTouch: false, anchors: { offset: anchorOffset(), duration: 0.65 } });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- expose the instance once it exists
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // On route change: move to the hash target, or return to the top.
  useEffect(() => {
    const hash = window.location.hash;
    const navigated = previousPath.current !== pathname;
    previousPath.current = pathname;
    // Initial hydration must not reset native scrolling after the visitor has already moved.
    if (!hash && !navigated) return;
    const go = () => {
      if (hash) {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: anchorOffset(), duration: 0.65 });
          else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
          return;
        }
      }
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo({ top: 0, behavior: "instant" });
    };
    const t = window.setTimeout(() => {
      go();
    }, 60);
    return () => window.clearTimeout(t);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
