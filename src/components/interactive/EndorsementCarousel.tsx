"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { endorsements } from "@/content/endorsements";
import { EndorsementCard } from "@/components/sections/EndorsementCard";

const SPEED = 38; // px per second
const MOBILE_INTERVAL = 4500;

/**
 * Endorsements as a continuous, self-running strip: it glides on its own in a
 * seamless loop (no arrows, no manual scrolling) and eases to a stop while the
 * pointer rests on it, so a card can be read. Only runs while on screen.
 * Phones advance one card at a time and support swipe and pause.
 */
export function EndorsementCarousel() {
  const viewport = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const vp = viewport.current;
    const el = strip.current;
    if (!vp || !el) return;
    const media = window.matchMedia("(min-width: 40rem) and (prefers-reduced-motion: no-preference)");
    const start = () => {
      vp.scrollLeft = 0;
      let x = 0;
      let speed = SPEED;
      let target = SPEED;
      let last = performance.now();
      let raf = 0;
      let onScreen = false;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!onScreen || document.hidden) return;
        speed += (target - speed) * (1 - Math.exp(-dt * 4));
        // The list is rendered twice; wrap after one full set for a seamless loop.
        const half = el.scrollWidth / 2;
        x = (x + speed * dt) % half;
        el.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
      };
      raf = requestAnimationFrame(frame);

      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        last = performance.now();
      });
      io.observe(vp);
      const slow = () => (target = 0);
      const go = () => (target = SPEED);
      vp.addEventListener("pointerenter", slow);
      vp.addEventListener("pointerleave", go);
      return () => {
        cancelAnimationFrame(raf);
        el.style.transform = "";
        io.disconnect();
        vp.removeEventListener("pointerenter", slow);
        vp.removeEventListener("pointerleave", go);
      };
    };
    let stop: (() => void) | undefined;
    const sync = () => {
      stop?.();
      stop = media.matches ? start() : undefined;
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      stop?.();
      media.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const vp = viewport.current;
    const list = strip.current;
    if (!vp || !list || paused) return;
    const media = window.matchMedia("(width < 40rem) and (prefers-reduced-motion: no-preference)");
    let visible = false;
    let touching = false;
    let lastScroll = 0;
    let timer = 0;

    const advance = () => {
      if (!visible || touching || document.hidden || vp.matches(":focus-visible") || performance.now() - lastScroll < 900) return;
      const first = list.children[0] as HTMLElement | undefined;
      const second = list.children[1] as HTMLElement | undefined;
      if (!first || !second) return;
      const step = second.offsetLeft - first.offsetLeft;
      if (step <= 0) return;
      const last = vp.scrollWidth - vp.clientWidth;
      const atEnd = vp.scrollLeft >= last - 2;
      vp.scrollTo({ left: atEnd ? 0 : Math.min(last, (Math.round(vp.scrollLeft / step) + 1) * step), behavior: atEnd ? "instant" : "smooth" });
    };
    const sync = () => {
      window.clearInterval(timer);
      if (visible && media.matches) timer = window.setInterval(advance, MOBILE_INTERVAL);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= 0.5;
      sync();
    }, { threshold: 0.5 });
    const onScroll = () => { lastScroll = performance.now(); };
    const onDown = () => { touching = true; };
    const onUp = () => { touching = false; sync(); };
    observer.observe(vp);
    media.addEventListener("change", sync);
    vp.addEventListener("scroll", onScroll, { passive: true });
    vp.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      media.removeEventListener("change", sync);
      vp.removeEventListener("scroll", onScroll);
      vp.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [paused]);

  const cards = [...endorsements, ...endorsements];

  return (
    <>
      <div className="container-x mb-2 flex items-center justify-between gap-2 sm:hidden">
        <p className="t-eyebrow text-muted">Swipe to read more →</p>
        <button type="button" aria-label={paused ? "Play testimonials" : "Pause testimonials"} onClick={() => setPaused((value) => !value)} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-ink motion-reduce:hidden">
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      </div>
      <div
        ref={viewport}
        className="overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:overscroll-x-contain max-sm:[scroll-padding-inline:var(--gutter)] sm:overflow-hidden motion-reduce:sm:overflow-x-auto"
        aria-label="Clinical endorsements"
        role="region"
        tabIndex={0}
      >
        <ul ref={strip} className="flex w-max gap-3 sm:gap-5 px-[max(var(--gutter),calc((100vw_-_82rem)/2_+_var(--gutter)))] py-1 sm:pb-4 sm:pt-0 sm:will-change-transform">
          {cards.map((person, i) => (
            <li key={`${person.name}-${i}`} aria-hidden={i >= endorsements.length} className={`w-[min(calc(100vw-3.5rem),23rem)] flex-none max-sm:snap-start sm:w-[21rem] ${i >= endorsements.length ? "max-sm:hidden" : ""}`}>
              <EndorsementCard person={person} index={i % endorsements.length} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
