"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, Check, Users, Layers } from "lucide-react";
import { protocolSteps } from "@/content/protocol";
import { cn } from "@/lib/cn";
import styles from "./ProtocolRing.module.css";

gsap.registerPlugin(ScrollTrigger);

export function ProtocolRing() {
  const root = useRef<HTMLDivElement>(null);
  const scroll = useRef<ScrollTrigger | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const step = protocolSteps[active];

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top 100px",
        end: () => `+=${window.innerHeight * 2.4}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const position = self.progress * 3;
          setProgress(position);
          setActive(Math.min(3, Math.floor(position + 0.15)));
        },
      });
      scroll.current = trigger;
      const refresh = () => ScrollTrigger.refresh();
      void document.fonts.ready.then(refresh);
      return () => { scroll.current = null; setProgress(null); trigger.kill(); };
    });
    return () => media.revert();
  }, []);

  function selectStep(index: number) {
    setActive(index);
    const trigger = scroll.current;
    if (trigger) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * index / 3, behavior: "smooth" });
  }

  function onKey(event: React.KeyboardEvent, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % protocolSteps.length
      : event.key === "ArrowLeft" ? (index + protocolSteps.length - 1) % protocolSteps.length
      : event.key === "Home" ? 0 : event.key === "End" ? protocolSteps.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    selectStep(next);
    tabs.current[next]?.focus();
  }

  return (
    <div ref={root} data-protocol-stack className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper-2/65">
      <div className="grid items-center gap-4 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:p-8">
        <div className={styles.navigator}>
          <p className="mb-3 text-center t-eyebrow text-dawn-deep lg:mb-0">Explore the four steps</p>
          <div className={styles.diagram}>
            <svg viewBox="0 0 360 360" className={styles.orbit} aria-hidden>
              <circle cx="180" cy="180" r="123" fill="none" stroke="#d8e5f3" strokeWidth="2" />
              <circle cx="180" cy="180" r="123" fill="none" stroke="#3177bf" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - (active + 1) * 25} transform="rotate(-90 180 180)" className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500" />
            </svg>
            <div className={styles.center} aria-hidden>
              <span className="text-xs font-semibold uppercase tracking-widest text-dawn-deep">One connected system</span>
              <span key={step.key} className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{step.name}</span>
              <span className="mt-2 text-xs text-muted">Step 0{active + 1} / 04</span>
            </div>
            <div role="tablist" aria-label="Beyonn Protocol steps" className={styles.tabs}>
              {protocolSteps.map((item, i) => (
                <button key={item.key} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === active} aria-controls={`${id}-panel-${i}`} tabIndex={i === active ? 0 : -1} onClick={() => selectStep(i)} onKeyDown={(event) => onKey(event, i)} className={cn(styles.tab, i === active && styles.selected)}>
                  <span className={styles.number}>{i < active ? <Check className="size-4" aria-hidden /> : `0${i + 1}`}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 hidden text-center text-xs text-muted lg:block">Select a step to see how your team is supported.</p>
        </div>

        <div className="min-w-0 rounded-2xl border border-ink/10 bg-white shadow-[0_16px_48px_-36px_rgb(19_37_62/0.4)]">
          <div className="grid">
            {protocolSteps.map((item, i) => (
              <div key={item.key} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} aria-hidden={active !== i} inert={active !== i} tabIndex={0} style={progress === null ? undefined : { visibility: "visible", opacity: 1, zIndex: i, position: "relative", background: "white", transform: `translateY(${Math.max(0, Math.min(1, i - progress)) * 110}%) scale(${1 - Math.min(1, Math.max(0, progress - i)) * 0.035})`, transformOrigin: "top center", pointerEvents: active === i ? "auto" : "none" }} className={cn("[grid-area:1/1] p-5 sm:p-7", active === i ? "visible opacity-100" : "invisible opacity-0")}>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 flex-none place-items-center rounded-xl bg-dawn/10 font-mono text-sm font-semibold text-dawn-deep">0{i + 1}</span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{item.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{item.short}</p>
                <dl className="mt-5 grid gap-3 border-t border-ink/10 pt-5">
                  <div className="rounded-xl bg-paper-2 p-4">
                    <dt className="flex items-center gap-2 text-sm font-semibold text-dawn-deep"><Users className="size-4" aria-hidden />Your team does</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-text/85">{item.teamDoes}</dd>
                  </div>
                  <div className="rounded-xl border border-breath-deep/10 bg-breath/10 p-4">
                    <dt className="flex items-center gap-2 text-sm font-semibold text-breath-deep"><Layers className="size-4" aria-hidden />Beyonn gives</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-text/85">{item.beyonnGives}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-3 sm:px-7">
            <span className="text-xs font-medium tabular-nums text-muted">0{active + 1} / 04</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => selectStep((active + 3) % 4)} aria-label="Previous protocol step" className="grid size-11 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-paper-2"><ArrowLeft className="size-4" aria-hidden /></button>
              <button type="button" onClick={() => selectStep((active + 1) % 4)} className="flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition-colors hover:bg-dawn">Next step<ArrowRight className="size-4" aria-hidden /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
