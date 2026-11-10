"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Entrance reveals for [data-aos] elements (styles come from aos.css plus our
 * overrides in globals.css).
 *
 * We trigger them with an IntersectionObserver instead of AOS's own scroll maths:
 * AOS measures every element once, so cards could reveal at the wrong moment, or
 * never, after images loaded, sticky columns moved things, or tabs/carousels
 * changed the DOM. An observer always uses the element's real position.
 * - Each element reveals once, when it first enters the viewport.
 * - `data-aos-delay` is applied as-is (AOS's CSS only knows 50ms steps).
 * - New elements (route changes, tabs) are picked up automatically.
 */
export function AosInit() {
  const pathname = usePathname();

  useEffect(() => {
    const mobile = window.matchMedia("(width < 48rem)").matches;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = !mobile && motionPreference.matches;

    const body = document.body;
    body.dataset.aosEasing = "ease-out-cubic";
    body.dataset.aosDuration = "800";

    // Elements already revealed. React may rewrite a className on re-render and
    // drop "aos-animate"; we put it straight back so nothing vanishes.
    const revealed = new WeakSet<HTMLElement>();
    const show = (el: HTMLElement) => {
      revealed.add(el);
      const delay = el.dataset.aosDelay;
      if (delay) {
        el.style.transitionDelay = `${mobile ? Math.min(Number(delay), 120) : delay}ms`;
        // Drop the delay once the entrance is done so hover transitions stay instant.
        el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true });
      }
      el.classList.add("aos-animate");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: mobile ? "0px 0px -24px 0px" : "0px 0px -6% 0px", threshold: 0 },
    );

    const scan = (root: ParentNode) => {
      const found: HTMLElement[] = [];
      if (root instanceof HTMLElement && root.matches("[data-aos]")) found.push(root);
      root.querySelectorAll<HTMLElement>("[data-aos]").forEach((el) => found.push(el));
      for (const el of found) {
        if (el.classList.contains("aos-animate")) continue;
        if (still) show(el);
        else io.observe(el);
      }
    };

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes") {
          const el = m.target as HTMLElement;
          if (revealed.has(el) && !el.classList.contains("aos-animate")) el.classList.add("aos-animate");
          continue;
        }
        m.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n));
      }
    });

    // Backup: also check real positions on scroll (throttled), so nothing can stay
    // hidden even where the observer is slow or paused.
    let last = 0;
    const sweep = () => {
      const now = performance.now();
      if (now - last < 250) return;
      last = now;
      const limit = mobile ? window.innerHeight - 24 : window.innerHeight * 0.94;
      document.querySelectorAll<HTMLElement>("[data-aos]:not(.aos-animate)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0 && (r.width || r.height)) {
          show(el);
          io.unobserve(el);
        }
      });
    };
    // Phones have no entrance curtain, so begin after the initial render.
    // Desktop keeps its load-time reveal schedule.
    let started = false;
    let timer = 0;
    const start = () => {
      if (started || (mobile && motionPreference.matches)) return;
      started = true;
      scan(document);
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
      sweep();
      window.addEventListener("scroll", sweep, { passive: true });
      window.addEventListener("resize", sweep);
      timer = window.setTimeout(() => {
        last = 0;
        sweep();
      }, 400);
    };
    let readyTimer = 0;
    const schedule = () => {
      readyTimer = window.setTimeout(start, 60);
    };
    if (mobile) motionPreference.addEventListener("change", start);
    if (mobile || document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    // Never wait forever (e.g. a slow third-party asset holding "load").
    const failSafe = window.setTimeout(start, 2500);

    return () => {
      io.disconnect();
      mo.disconnect();
      motionPreference.removeEventListener("change", start);
      window.removeEventListener("load", schedule);
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      window.clearTimeout(timer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(failSafe);
    };
  }, [pathname]);

  return null;
}
