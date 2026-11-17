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
    body.dataset.aosDuration = pathname === "/team" ? "600" : "800";
    let disposed = false;
    const decoded = new WeakSet<HTMLElement>();
    const decoding = new WeakSet<HTMLElement>();

    // Elements already revealed. React may rewrite a className on re-render and
    // drop "aos-animate"; we put it straight back so nothing vanishes.
    const revealed = new WeakSet<HTMLElement>();
    const awaitingCurtain = new Set<HTMLElement>();
    const watchedCurtains = new WeakSet<HTMLElement>();
    const navigationObservers = new Set<MutationObserver>();
    const show = (el: HTMLElement) => {
      const curtain = Array.from(document.querySelectorAll<HTMLElement>('.route-curtain')).find(node => getComputedStyle(node).display !== 'none' && node.getClientRects().length > 0);
      if (curtain) {
        awaitingCurtain.add(el);
        if (!watchedCurtains.has(curtain)) {
          watchedCurtains.add(curtain);
          const observer = new MutationObserver(() => {
            if (getComputedStyle(curtain).display !== 'none') return;
            observer.disconnect(); navigationObservers.delete(observer);
            awaitingCurtain.forEach(node => { if (node.isConnected) show(node); else awaitingCurtain.delete(node); });
          });
          observer.observe(curtain, { attributes: true, attributeFilter: ['style'] });
          navigationObservers.add(observer);
        }
        return;
      }
      awaitingCurtain.delete(el);
      // Hero copy and artwork share an image-readiness gate, so neither plays
      // while the illustration is still downloading or decoding.
      if (el.hasAttribute("data-aos-wait-for-images") && !decoded.has(el)) {
        if (decoding.has(el)) return;
        decoding.add(el);
        const images = Array.from((el.closest("section") ?? el).querySelectorAll<HTMLImageElement>("img"));
        void Promise.all(images.map((image) => image.decode().catch(() => undefined))).then(() => {
          if (disposed || !el.isConnected) return;
          decoded.add(el);
          show(el);
        });
        return;
      }
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
    // Reveal only after the intro and any client-navigation curtain have left.
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
      if (disposed || started) return;
      window.clearTimeout(readyTimer);
      readyTimer = window.setTimeout(start, 60);
    };
    let preparing = false;
    let curtainObserver: MutationObserver | undefined;
    const afterCurtains = () => {
      if (disposed || started) return;
      const curtains = Array.from(document.querySelectorAll<HTMLElement>(".route-curtain"));
      const check = () => {
        if (disposed || curtains.some((curtain) => getComputedStyle(curtain).display !== "none" && curtain.getClientRects().length > 0)) return;
        curtainObserver?.disconnect();
        schedule();
      };
      curtainObserver = new MutationObserver(check);
      curtains.forEach((curtain) => curtainObserver!.observe(curtain, { attributes: true, attributeFilter: ["style"] }));
      check();
    };
    const prepare = () => {
      if (disposed || started || preparing) return;
      preparing = true;
      const animations = document.querySelector(".intro")?.getAnimations().filter((animation) => animation.pending || animation.playState === "running") ?? [];
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(afterCurtains);
    };
    if (mobile) motionPreference.addEventListener("change", start);
    if (document.readyState === "complete") {
      prepare();
    } else {
      window.addEventListener("load", prepare, { once: true });
    }
    // Never wait forever (e.g. a slow third-party asset holding "load").
    const failSafe = window.setTimeout(prepare, 2500);

    return () => {
      disposed = true;
      navigationObservers.forEach(observer => observer.disconnect());
      awaitingCurtain.clear();
      io.disconnect();
      mo.disconnect();
      curtainObserver?.disconnect();
      motionPreference.removeEventListener("change", start);
      window.removeEventListener("load", prepare);
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      window.clearTimeout(timer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(failSafe);
    };
  }, [pathname]);

  return null;
}
