"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { endorsements } from "@/content/endorsements";
import { EndorsementCard } from "@/components/sections/EndorsementCard";
import { cn } from "@/lib/cn";

const AUTO_MS = 4000;

/**
 * Swipeable endorsement carousel: native scroll-snap (works with mouse, trackpad
 * and touch), prev/next arrows that loop, a progress bar that tracks the scroll,
 * and a gentle autoscroll that pauses whenever someone is reading or interacting.
 */
export function EndorsementCarousel() {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const max = el.scrollWidth - el.clientWidth;
    // At the end, loop back to the start (and vice versa).
    if (dir === 1 && el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir === -1 && el.scrollLeft <= 8) el.scrollTo({ left: max, behavior: "smooth" });
    else el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Autoscroll: one card every few seconds, paused on hover, focus, touch,
  // while off screen, or for reduced motion.
  const paused = useRef(false);
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
    };
    let resume = 0;
    const hold = () => {
      paused.current = true;
      window.clearTimeout(resume);
    };
    const release = (delay = 0) => {
      window.clearTimeout(resume);
      resume = window.setTimeout(() => (paused.current = false), delay);
    };
    const onEnter = () => hold();
    const onLeave = () => release(400);
    const onTouch = () => {
      hold();
      release(6000);
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);
    el.addEventListener("touchstart", onTouch, { passive: true });
    const tick = window.setInterval(() => {
      if (!paused.current && onScreen() && !document.hidden) go(1);
    }, AUTO_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(resume);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
      el.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <div>
      <div className="container-x flex items-center justify-end gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => go(dir)}
            aria-label={dir === -1 ? "Previous endorsements" : "Next endorsements"}
            className="grid size-11 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/15 transition-[background-color,color] duration-300 hover:bg-ink hover:text-paper"
          >
            {dir === -1 ? <ArrowLeft className="size-4" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
          </button>
        ))}
      </div>

      <ul
        ref={track}
        data-lenis-prevent-wheel
        className="h-scroll mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(var(--gutter),calc((100vw_-_82rem)/2_+_var(--gutter)))] scroll-px-[max(var(--gutter),calc((100vw_-_82rem)/2_+_var(--gutter)))] pb-4"
        aria-label="Clinical endorsements"
      >
        {endorsements.map((person, i) => (
          <li key={person.name} data-aos="fade-up" data-aos-delay={Math.min(i, 3) * 90} className="w-[18.5rem] flex-none snap-start sm:w-[21rem]">
            <EndorsementCard person={person} index={i} />
          </li>
        ))}
      </ul>

      <div className="container-x mt-4">
        <div className="h-1 overflow-hidden rounded-full bg-ink/10" aria-hidden>
          <div className={cn("h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--color-breath),var(--color-dawn))]")} style={{ transform: `scaleX(${0.12 + progress * 0.88})` }} />
        </div>
      </div>
    </div>
  );
}
