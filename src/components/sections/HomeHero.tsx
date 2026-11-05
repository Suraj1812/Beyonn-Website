"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { CutoutPortrait } from "@/components/sections/PageHero";
import { Scribble } from "@/components/ui/Scribble";
import { cn } from "@/lib/cn";

type Slide = { kicker: string; title: (play: boolean) => ReactNode; sub: string };

/** The four-part story from beyonn.com, told one slide at a time. */
const slides: Slide[] = [
  {
    kicker: "The program",
    title: (play) => (
      <>
        Build the practice <Scribble play={play}>beyond</Scribble> the chair.
      </>
    ),
    sub: "A complete OSA + TMD program, built for your team to run. Clinical protocols, practical training and technology connect every patient journey from first question to follow-up.",
  },
  {
    kicker: "The patients",
    title: (play) => (
      <>
        OSA and TMD are <Scribble play={play}>already</Scribble> in your practice.
      </>
    ),
    sub: "Snoring, clenching, morning headaches, the night guard that never worked. Most of these patients leave your chair undiagnosed.",
  },
  {
    kicker: "Why they are missed",
    title: (play) => (
      <>
        One patient. <Scribble play={play}>Two</Scribble> conditions.
      </>
    ),
    sub: "Sleep apnea and TMJ disorder share an airway, a joint and a nervous system. Treated separately, they relapse. Treated together, they resolve.",
  },
  {
    kicker: "What your practice gets",
    title: (play) => (
      <>
        New revenue from patients you <Scribble play={play}>already</Scribble> see.
      </>
    ),
    sub: "It is billed to medical insurance, so it adds to your dental revenue instead of competing with it. Your whole team is trained, not just you.",
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
    let raf = 0;
    const update = () => {
      const h = section.current?.offsetHeight ?? 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const running = playing && !hold;
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section ref={section} className="spotlight relative isolate overflow-hidden bg-[linear-gradient(135deg,var(--color-ink)_0%,var(--color-night)_100%)] text-paper [--scribble:var(--color-breath)]">
      <div className="pointer-events-none absolute -left-48 top-16 -z-10 size-[32rem] rounded-full bg-breath/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[36rem] rounded-full bg-dawn/25 blur-3xl" aria-hidden />

      <div className="container-x grid items-center gap-12 pb-12 pt-32 sm:pt-36 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-16 lg:pt-40">
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
                  <p className="t-eyebrow text-breath">
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {i + 1} / {slides.length}
                    </span>
                    <span className="mx-2 text-paper/40">·</span>
                    {s.kicker}
                  </p>
                  <Title className="mt-4 t-display !text-[clamp(2.4rem,4.4vw,4.25rem)]">{s.title(active)}</Title>
                  <p className="mt-6 max-w-[35rem] t-lead text-paper/80">{s.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>

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

          <div className="mt-12">{below}</div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div ref={figure} className="will-change-transform">
          <CutoutPortrait
            emblem="on-dark"
            emblem3d
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
  );
}
