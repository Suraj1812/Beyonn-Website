"use client";

import { useId, useRef, useState } from "react";
import { BookOpen, Gauge, Stethoscope, Sprout, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const areas = [
  { name: "Learn", icon: BookOpen, title: "A learning path for the whole team", items: ["Clinical Coaching Blueprint", "Clinical videos and case studies", "Forms and team progress"], detail: "Build confidence with step-by-step training and resources your team can return to." },
  { name: "Run", icon: Gauge, title: "Keep the practice moving", items: ["Golden Tracker and case workflow", "Billing and documentation tools", "Patient communication"], detail: "Keep cases, follow-up and the work around care organised in one place." },
  { name: "Treat", icon: Stethoscope, title: "Support from screening to treatment", items: ["Sleep testing and screening", "Appliance ordering", "Clinical case guidance"], detail: "Give your clinical team a connected workflow, with guidance for complex cases." },
  { name: "Grow", icon: Sprout, title: "Turn awareness into patient conversations", items: ["Patient App and provider directory", "Patient education resources", "Coaching and study club"], detail: "Help patients recognise their symptoms and find their next step with your practice." },
];

export function OsTiles() {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const area = areas[active];
  const Icon = area.icon;
  return (
    <div className="mx-auto max-w-5xl">
      <div role="tablist" aria-label="Beyonn platform" className="grid grid-cols-4 gap-1 rounded-xl bg-paper/10 p-1">
        {areas.map((item, i) => (
          <button key={item.name} ref={(el) => { buttons.current[i] = el; }} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(event) => {
            const next = event.key === "Home" ? 0 : event.key === "End" ? areas.length - 1 : event.key === "ArrowRight" ? (i + 1) % areas.length : event.key === "ArrowLeft" ? (i + areas.length - 1) % areas.length : null;
            if (next === null) return;
            event.preventDefault(); setActive(next); buttons.current[next]?.focus();
          }} className={cn("min-h-12 rounded-lg px-2 text-sm font-semibold transition-colors", active === i ? "bg-paper text-ink" : "text-paper/75 hover:bg-paper/10")}>{item.name}</button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="mt-4 grid gap-5 rounded-2xl border border-paper/15 bg-paper/[0.05] p-5 sm:p-7 md:grid-cols-2">
        <div key={area.name} className="animate-fade-up">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-breath"><Icon className="size-5" aria-hidden />{area.name}</span>
          <h3 className="mt-3 t-h3">{area.title}</h3>
          <p className="mt-3 text-paper/70">{area.detail}</p>
        </div>
        <div className="rounded-xl bg-paper/[0.04] p-4">
          <p className="t-eyebrow text-paper/55">Included in {area.name}</p>
          <ul className="mt-3 space-y-3">{area.items.map((item) => <li key={item} className="flex gap-2 text-sm leading-relaxed"><Check className="mt-0.5 size-4 flex-none text-breath" aria-hidden />{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
