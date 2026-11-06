"use client";

import { useEffect, useRef } from "react";
import { endorsements } from "@/content/endorsements";
import { EndorsementCard } from "@/components/sections/EndorsementCard";

const SPEED = 38; // px per second

/**
 * Endorsements as a continuous, self-running strip: it glides on its own in a
 * seamless loop (no arrows, no manual scrolling) and eases to a stop while the
 * pointer rests on it, so a card can be read. Only runs while on screen.
 * With reduced motion it stays still and can be scrolled by hand instead.
 */
export function EndorsementCarousel() {
  const viewport = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const vp = viewport.current;
    const el = strip.current;
    if (!vp || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      io.disconnect();
      vp.removeEventListener("pointerenter", slow);
      vp.removeEventListener("pointerleave", go);
    };
  }, []);

  const cards = [...endorsements, ...endorsements];

  return (
    <div
      ref={viewport}
      className="overflow-hidden motion-reduce:overflow-x-auto"
      aria-label="Clinical endorsements"
      role="region"
    >
      <ul ref={strip} className="flex w-max gap-5 px-[max(var(--gutter),calc((100vw_-_82rem)/2_+_var(--gutter)))] pb-4 will-change-transform">
        {cards.map((person, i) => (
          <li key={`${person.name}-${i}`} aria-hidden={i >= endorsements.length} className="w-[18.5rem] flex-none sm:w-[21rem]">
            <EndorsementCard person={person} index={i % endorsements.length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
