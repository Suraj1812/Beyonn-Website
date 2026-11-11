"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { CutoutPortrait } from "@/components/sections/PageHero";
import { WorkshopAnnouncement } from "@/components/sections/WorkshopAnnouncement";
import { Scribble } from "@/components/ui/Scribble";
import { cn } from "@/lib/cn";

type Slide = { kicker: string; title: (play: boolean) => ReactNode; sub: string };

/** Hero copy from the approved content doc. More slides can be added later. */
const slides: Slide[] = [
  {
    kicker: "The OSA + TMD Program Your Team Can Run",
    title: (play) => (
      <>
        Your team. Our <Scribble play={play}>system.</Scribble>{" "}
        <span className="hidden sm:inline">A complete OSA + TMD integration program.</span>
      </>
    ),
    sub: "Bring OSA + TMD care into your practice with team training, practical tools and coaching from Dr. Rodney Willey. Build a program that runs with confidence.",
  },
];

const SLIDE_MS = 7000;

/**
 * Home hero: a slow, pausable four-slide story beside Dr. Willey.
 * Slides are stacked in one grid cell so the layout never jumps between them.
 * The progress bar's CSS animation drives auto-advance, so it pauses on its own
 * when the tab is hidden, on hover/focus, or when the visitor presses pause.
 */
export function HomeHero({ actions, below }: { actions: ReactNode; below: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- respect the visitor's motion setting after mount
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  // Scroll exit: as the hero leaves, the copy drifts down and fades, the portrait rises a touch.
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktop = window.matchMedia("(min-width: 40rem)");
    let raf = 0;
    const update = () => {
      const h = section.current?.offsetHeight ?? 1;
      const p = desktop.matches ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (copy.current) {
        copy.current.style.transform = `translate3d(0, ${(p * 70).toFixed(1)}px, 0)`;
        copy.current.style.opacity = String(1 - p * 0.85);
      }
      if (figure.current) figure.current.style.transform = `translate3d(0, ${(p * -40).toFixed(1)}px, 0) scale(${(1 - p * 0.05).toFixed(3)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const running = playing && !hold;
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <>
    <div className="pt-[6.875rem] md:pt-[6.25rem] lg:pt-[6.75rem]"><WorkshopAnnouncement /></div>
    <section ref={section} data-guide="hero" className="spotlight relative isolate overflow-hidden bg-[linear-gradient(135deg,var(--color-ink)_0%,var(--color-night)_100%)] text-paper [--em-color:var(--color-breath)] [--scribble:var(--color-dawn-deep)]">
      <div className="pointer-events-none absolute -left-48 top-16 -z-10 size-[32rem] rounded-full bg-breath/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[36rem] rounded-full bg-dawn/25 blur-3xl" aria-hidden />

      <div className="container-x grid items-center gap-6 pb-8 pt-8 sm:gap-12 sm:pb-12 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-16 lg:pt-16">
        <div ref={copy} className="max-w-[42rem] will-change-transform">
          <div
            className="grid"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
            {slides.map((s, i) => {
              const active = i === index;
              const Title = active ? "h1" : "p";
              return (
                <div
                  key={s.kicker}
                  aria-hidden={!active}
                  className={cn(
                    "[grid-area:1/1] transition-[opacity,transform,visibility] duration-700 ease-[var(--ease-out-expo)]",
                    active ? "visible translate-y-0 opacity-100 delay-150" : "invisible translate-y-3 opacity-0",
                  )}
                >
                  <p data-mobile-hero-enter className="t-eyebrow text-breath">
                    {slides.length > 1 && (
                      <>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                          {i + 1} / {slides.length}
                        </span>
                        <span className="mx-2 text-paper/40">·</span>
                      </>
                    )}
                    <span className="sm:hidden">Dental sleep medicine · OSA + TMD</span>
                    <span className="hidden sm:inline">{s.kicker}</span>
                  </p>
                  <Title data-mobile-hero-enter className="[--phone-hero-delay:65ms] mt-4 t-display !text-[clamp(2.2rem,3.9vw,3.7rem)] max-sm:!text-[clamp(1.95rem,8.5vw,2.8rem)]">{s.title(active)}</Title>
                  <p data-mobile-hero-enter className="[--phone-hero-delay:125ms] mt-4 max-w-[35rem] text-[0.95rem] leading-relaxed text-paper/80 sm:hidden">
                    Bring sleep apnea and jaw joint care into your practice with team training, technology and coaching from Dr. Rodney Willey.
                  </p>
                  <p className="mt-6 hidden max-w-[35rem] t-lead text-paper/80 sm:block">{s.sub}</p>
                </div>
              );
            })}
          </div>

          <div data-mobile-hero-enter className="[--phone-hero-delay:185ms] mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">{actions}</div>

          {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-3" role="group" aria-label="Hero slides">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="grid size-9 place-items-center rounded-full ring-1 ring-paper/25 transition-colors hover:bg-paper/10"
              aria-label={playing ? "Pause slides" : "Play slides"}
            >
              {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
            </button>
            {slides.map((s, i) => (
              <button
                key={s.kicker}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}: ${s.kicker}`}
                aria-current={i === index ? "true" : undefined}
                className="group relative h-6 w-10 sm:w-12"
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-paper/20 transition-colors group-hover:bg-paper/30">
                  {i < index && <span className="absolute inset-0 bg-paper/60" />}
                  {i === index && (
                    <span
                      key={`${index}-${playing}`}
                      onAnimationEnd={next}
                      className="absolute inset-y-0 left-0 w-full origin-left bg-breath"
                      style={{
                        animation: playing ? `hero-progress ${SLIDE_MS}ms linear forwards` : "none",
                        animationPlayState: running ? "running" : "paused",
                        transform: playing ? undefined : "scaleX(1)",
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          )}

          <div className="mt-6 border-t border-paper/15 pt-4 sm:mt-12 sm:border-0 sm:pt-0">{below}</div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div ref={figure} className="will-change-transform">
          <CutoutPortrait
            emblem="on-dark"
            emblem3d
            compact
            photo={{
              src: "/assets/people/rodney-hero.webp",
              alt: "Dr. Rodney Willey seated in clinic",
              mode: "contain",
              caption: { name: "Dr. Rodney Willey", role: "Founder · DDS, D.ACSDD, D.ASBA" },
            }}
          />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
