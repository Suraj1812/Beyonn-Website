"use client";

import { useId, useRef, useState } from "react";
import { BookOpen, Gauge, Stethoscope, Sprout, Check, FileText, Users, ClipboardList, MessageCircle, ScanHeart, CircleCheck, Megaphone, Network, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./OsTiles.module.css";

const areas = [
  { name: "Learn", icon: BookOpen, flow: [{ icon: BookOpen, label: "Training" }, { icon: FileText, label: "Resources" }, { icon: Users, label: "Your team" }], title: "A learning path for the whole team", items: ["Clinical Coaching Blueprint", "Clinical videos and case studies", "Forms and team progress"], detail: "Build confidence with step-by-step training and resources your team can return to." },
  { name: "Run", icon: Gauge, flow: [{ icon: Users, label: "Patients" }, { icon: ClipboardList, label: "Cases" }, { icon: MessageCircle, label: "Follow-up" }], title: "Keep the practice moving", items: ["Golden Tracker and case workflow", "Billing and documentation tools", "Patient communication"], detail: "Keep cases, follow-up and the work around care organised in one place." },
  { name: "Treat", icon: Stethoscope, flow: [{ icon: ScanHeart, label: "Screening" }, { icon: Stethoscope, label: "Treatment" }, { icon: CircleCheck, label: "Review" }], title: "Support from screening to treatment", items: ["Sleep testing and screening", "Appliance ordering", "Clinical case guidance"], detail: "Give your clinical team a connected workflow, with guidance for complex cases." },
  { name: "Grow", icon: Sprout, flow: [{ icon: Megaphone, label: "Awareness" }, { icon: Network, label: "Referrals" }, { icon: GraduationCap, label: "Coaching" }], title: "Turn awareness into patient conversations", items: ["Patient App and provider directory", "Patient education resources", "Coaching and study club"], detail: "Help patients recognise their symptoms and find their next step with your practice." },
];

const nextSteps = [
  { href: "/academy", label: "Explore the Academy" },
  { href: "/the-beyonn-system", label: "Explore the Beyonn System" },
  { href: "/the-beyonn-system", label: "See the clinical workflow" },
  { href: "/partner", label: "Explore network partnership" },
];

export function OsTiles() {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) { setActive(index); }
  function onKey(event: React.KeyboardEvent, index: number) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? areas.length - 1 : event.key === "ArrowRight" ? (index + 1) % areas.length : event.key === "ArrowLeft" ? (index + areas.length - 1) % areas.length : null;
    if (next === null) return;
    event.preventDefault(); select(next); buttons.current[next]?.focus();
  }

  return (
    <div className={styles.root} data-os-explorer>
      <div role="tablist" aria-label="Beyonn platform" className={styles.tabs}>
        <span className={styles.indicator} style={{ transform: `translateX(${active * 100}%)` }} aria-hidden />
        {areas.map((area, i) => <button key={area.name} ref={(el) => { buttons.current[i] = el; }} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={active === i} tabIndex={active === i ? 0 : -1} onClick={() => select(i)} onKeyDown={(event) => onKey(event, i)} className={styles.tab}>
          <area.icon className={styles.tabIcon} strokeWidth={1.7} aria-hidden /><span>{area.name}</span><span className={styles.tabNumber} aria-hidden>0{i + 1}</span>
        </button>)}
      </div>
      <div className={styles.panels}>
        {areas.map((area, index) => <div key={area.name} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} aria-hidden={active !== index} inert={active !== index} tabIndex={0} data-active={active === index} className={styles.panel}>
          <div className={styles.overview}>
            <p className={styles.kicker}><span>0{index + 1} / {area.name}</span><span>One connected platform</span></p>
            <h3 className={styles.heading}>{area.title}</h3>
            <p className={styles.description}>{area.detail}</p>
            <ol aria-label={`${area.name} workflow`} className={styles.workflow}>
              {area.flow.map((step,i) => <li key={step.label} style={{ "--step": i } as React.CSSProperties}>
                <span className={styles.flowIcon}><step.icon className="size-5" strokeWidth={1.6} aria-hidden /></span>
                <span className={styles.flowLabel}>{step.label}</span>
                {i < area.flow.length - 1 && <span className={styles.connector} aria-hidden><ArrowRight className="size-3.5" /></span>}
              </li>)}
            </ol>
          </div>
          <div className={styles.included}>
            <p className={styles.includedTitle}>Included in {area.name}</p>
            <ul>{area.items.map((item,i) => <li key={item} style={{ "--step": i } as React.CSSProperties}><Check className="size-4" strokeWidth={1.8} aria-hidden /><span>{item}</span></li>)}</ul>
            <Link href={nextSteps[index].href} className={styles.nextLink}>{nextSteps[index].label}<ArrowRight className="size-4" aria-hidden /></Link>
          </div>
        </div>)}
      </div>
      <p className={styles.hint}>Choose an area to explore how it supports your team.</p>
    </div>
  );
}
