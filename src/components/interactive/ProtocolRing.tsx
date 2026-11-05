"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { protocolSteps } from "@/content/protocol";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

const R = 120;
const nodes = protocolSteps.map((_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 4;
  return { x: 160 + R * Math.cos(a), y: 160 + R * Math.sin(a) };
});

/** Home §6: a circular system diagram that lights each step as its copy scrolls past. */
export function ProtocolRing() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      gsap.fromTo(
        "[data-ring-progress]",
        { strokeDashoffset: 2 * Math.PI * R },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 60%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:h-[28rem] lg:self-start">
        <svg data-aos="zoom-in" viewBox="-60 -40 440 400" className="mx-auto w-full max-w-[24rem]" role="img" aria-label={`The Beyonn Protocol: ${protocolSteps.map((s) => s.name).join(", ")}. Current step: ${protocolSteps[active].name}.`}>
          <defs>
            <linearGradient id="ringG" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#72cfb7" />
              <stop offset="1" stopColor="#3177bf" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r={R} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
          <circle
            data-ring-progress
            cx="160"
            cy="160"
            r={R}
            fill="none"
            stroke="url(#ringG)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * R}
            transform="rotate(-90 160 160)"
          />
          <circle cx="160" cy="160" r="70" className="fill-white" stroke="currentColor" strokeOpacity=".08" />
          <text x="160" y="150" textAnchor="middle" className="fill-dawn-deep text-[11px] font-semibold">
            Step {active + 1} of 4
          </text>
          <text x="160" y="178" textAnchor="middle" className="fill-current font-display text-[24px] font-semibold">
            {protocolSteps[active].name}
          </text>
          {nodes.map((n, i) => {
            const on = i <= active;
            const label = [
              { x: n.x, y: n.y - 34, anchor: "middle" },
              { x: n.x + 30, y: n.y + 5, anchor: "start" },
              { x: n.x, y: n.y + 44, anchor: "middle" },
              { x: n.x - 30, y: n.y + 5, anchor: "end" },
            ][i] as { x: number; y: number; anchor: "middle" | "start" | "end" };
            return (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={i === active ? 21 : 16} className={cn("transition-all duration-500", on ? "fill-dawn" : "fill-paper")} stroke="currentColor" strokeOpacity={on ? 0 : 0.18} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" className={cn("text-[11px] font-bold", on ? "fill-white" : "fill-ink")}>
                  0{i + 1}
                </text>
                <text x={label.x} y={label.y} textAnchor={label.anchor} className={cn("text-[13px] font-semibold transition-colors duration-500", i === active ? "fill-dawn-deep" : "fill-ink/45")}>
                  {protocolSteps[i].name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ol data-steps className="grid gap-4 pb-[12vh] lg:gap-7 lg:pb-[10vh]">
        {protocolSteps.map((s, i) => (
          <li
            key={s.key}
            data-step
            style={{ "--stack": `${8 + i * 1.5}rem`, "--stack-sm": `${4.75 + i * 0.75}rem` } as React.CSSProperties}
            className={cn(
              "origin-top rounded-[var(--radius-panel)] border bg-white p-6 shadow-[0_-12px_40px_-28px_rgb(19_37_62/0.35)] transition-[opacity,border-color,box-shadow,transform] duration-500 sm:p-8 sticky top-[var(--stack-sm)] lg:top-[var(--stack)]",
              i === active && "border-dawn/50 shadow-[0_24px_50px_-28px_rgb(19_37_62/0.5)]",
              i < active && "scale-[0.94] border-ink/10 bg-paper-2",
              i > active && "border-ink/10",
            )}
          >
            <div data-aos="fade-up">
              <div className="flex items-center gap-4">
                <span className={cn("grid size-10 flex-none place-items-center rounded-full font-display text-base font-bold transition-colors duration-500", i === active ? "bg-dawn text-white" : "bg-paper-2 text-ink/60")}>
                  0{i + 1}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] font-semibold tracking-tight">{s.name}</h3>
              </div>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">{s.short}</p>
              <dl className="mt-6 grid gap-5 border-t border-ink/10 pt-5 text-[0.95rem] sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-dawn-deep">Your team does</dt>
                  <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-text/85">{s.teamDoes}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-breath-deep">Beyonn gives</dt>
                  <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-text/85">{s.beyonnGives}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
