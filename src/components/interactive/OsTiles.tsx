"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Gauge, Lock, Sprout, Stethoscope } from "lucide-react";
import { cn } from "@/lib/cn";

const tiles = [
  {
    name: "Learn",
    icon: BookOpen,
    url: "app.beyonn.com/learn",
    lead: "One login for your whole team, with every lesson, form and video on demand.",
    points: ["Coaching Clinician Blueprint, module by module", "Forms Center, video library and case studies", "Progress tracking and onboarding for new hires", "AI assistant trained on Dr. Willey's content"],
    shot: { src: "/assets/site/platform-platform.png", alt: "Beyonn LMS lesson with a video module and learning resources" },
  },
  {
    name: "Run",
    icon: Gauge,
    url: "app.beyonn.com/run",
    lead: "Every lead, case and claim in one place, with follow-up that runs itself.",
    points: ["Dashboard: leads, cases, conversion, claims", "CRM with email, SMS and WhatsApp follow-up", "The Golden Tracker, so no “yes” is lost", "Coding kit, optional Billing Assist, HIPAA built in"],
    shot: { src: "/assets/site/platform-medical-billing.png", alt: "Patient intake form and file record in the Beyonn platform" },
  },
  {
    name: "Treat",
    icon: Stethoscope,
    url: "app.beyonn.com/treat",
    lead: "Everything between the exam and the delivered appliance, in one workflow.",
    points: ["The Beyonn appliance, ordered from the platform", "STOP-Bang screening and home sleep testing", "Case guidance from Dr. Willey's team", "Presentation templates and treatment planners"],
    shot: { src: "/assets/site/platform-presentations.png", alt: "Treatment presentation templates and planners in the Beyonn platform" },
  },
  {
    name: "Grow",
    icon: Sprout,
    url: "app.beyonn.com/grow",
    lead: "Bring the right patients to your door and keep them coming back.",
    points: ["Patient App with Snore Score and Sleep Score", "National awareness campaigns and local kits", "A listing in the Beyonn provider directory", "Monthly study club with Dr. Willey"],
    shot: { src: "/assets/site/card-pr-marketing.png", alt: "Beyonn PR & Marketing Suite" },
  },
];

const STEP_MS = 6500;

/**
 * Home §7: the platform as a real product showcase. Tabs (auto-advancing,
 * pausable) switch screens inside a browser window that tilts flat in 3D as it
 * scrolls into view; the screens crossfade and the four points update below.
 */
export function OsTiles() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(false);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = tiles[active];

  // Scroll-linked 3D: the window starts tipped back and lands flat.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the motion preference once mounted
    setStill(reduce);
    const el = stage.current;
    if (!el || reduce) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      const e = 1 - Math.pow(1 - p, 3);
      el.style.transform = `perspective(1600px) rotateX(${((1 - e) * 22).toFixed(2)}deg) scale(${(0.9 + 0.1 * e).toFixed(3)})`;
      el.style.opacity = String(0.35 + 0.65 * e);
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Only auto-advance while the section is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const auto = !still;
  const running = auto && visible && !hold;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + tiles.length) % tiles.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div ref={root} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      {/* Tabs */}
      <div data-aos="fade-up" className="flex justify-center">
        <div role="tablist" aria-label="Beyonn platform" className="relative grid w-full max-w-2xl grid-cols-4 gap-1 rounded-2xl bg-paper/[0.06] p-1.5 ring-1 ring-paper/10">
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem-0.75rem)/4)] rounded-xl bg-paper shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[var(--ease-out-expo)]"
            style={{ transform: `translateX(calc(${active} * (100% + 0.25rem)))` }}
          />
          {tiles.map((tile, i) => {
            const on = i === active;
            const Icon = tile.icon;
            return (
              <button
                key={tile.name}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`os-tab-${i}`}
                aria-selected={on}
                aria-controls="os-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn("relative z-10 flex flex-col items-center gap-1 rounded-xl px-2 pb-2.5 pt-3 text-sm font-semibold transition-colors duration-300 sm:flex-row sm:justify-center sm:gap-2 sm:text-[0.95rem]", on ? "text-ink" : "text-paper/70 hover:text-paper")}
              >
                <Icon className={cn("size-[1.05rem]", on ? "text-dawn" : "text-breath")} aria-hidden />
                {tile.name}
                {on && auto && (
                  <span className="absolute inset-x-4 bottom-1 h-[2px] overflow-hidden rounded-full bg-ink/10" aria-hidden>
                    <span
                      key={`${active}-${running}`}
                      onAnimationEnd={() => setActive((a) => (a + 1) % tiles.length)}
                      className="block h-full origin-left bg-dawn"
                      style={{ animation: `hero-progress ${STEP_MS}ms linear forwards`, animationPlayState: running ? "running" : "paused" }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product window */}
      <div className="relative mx-auto mt-10 max-w-5xl">
        <FloatingBadge className="-left-6 top-[18%] hidden lg:flex" delay="0s" label="Coaching Clinician Blueprint" />
        <FloatingBadge className="-right-8 top-[40%] hidden lg:flex" delay="-1.2s" label="Golden Tracker" />
        <FloatingBadge className="-left-10 bottom-[16%] hidden lg:flex" delay="-2.4s" label="Beyonn Patient App" />

        <div ref={stage} className="origin-bottom will-change-transform">
          <div data-morph-shape="rect" className="overflow-hidden rounded-2xl bg-paper shadow-[0_50px_100px_-40px_rgb(0_0_0/0.75)] ring-1 ring-paper/15">
            <div className="flex items-center gap-3 border-b border-ink/10 bg-paper-2 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs text-muted ring-1 ring-ink/[0.06]">
                <Lock className="size-3 flex-none" aria-hidden />
                <span key={t.url} className="truncate animate-fade-up">{t.url}</span>
              </span>
              <span className="w-[46px]" aria-hidden />
            </div>
            <div id="os-panel" role="tabpanel" aria-labelledby={`os-tab-${active}`} className="relative aspect-video bg-paper-2">
              {tiles.map((tile, i) => (
                <div
                  key={tile.name}
                  aria-hidden={i !== active}
                  className={cn("absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]", i === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0")}
                >
                  <Image src={tile.shot.src} alt={tile.shot.alt} fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-contain" priority={i === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What's inside the current tab */}
      <div key={t.name} className="mx-auto mt-10 max-w-5xl">
        <p className="animate-fade-up text-center font-display text-[clamp(1.15rem,1.8vw,1.45rem)] font-semibold leading-snug text-paper">{t.lead}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.points.map((p, i) => (
            <li key={p} className="flex animate-fade-up gap-2.5 rounded-xl bg-paper/[0.05] p-4 text-[0.93rem] leading-snug text-paper/85 ring-1 ring-paper/10" style={{ animationDelay: `${80 + i * 70}ms` }}>
              <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-breath/15 text-breath">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FloatingBadge({ label, className, delay }: { label: string; className?: string; delay: string }) {
  return (
    <div className={cn("absolute z-10 items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink shadow-[0_20px_40px_-18px_rgb(0_0_0/0.6)] ring-1 ring-ink/[0.06] animate-bob", className)} style={{ animationDelay: delay }} aria-hidden>
      <span className="size-2 rounded-full bg-breath-deep" />
      {label}
    </div>
  );
}
