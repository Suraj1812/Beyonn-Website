"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Gauge, Stethoscope, Sprout, Check, FileText, Users, ClipboardList, MessageCircle, ScanHeart, CircleCheck, Megaphone, Network, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

export function OsTiles() {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 64rem) and (min-height: 46rem) and (prefers-reduced-motion: no-preference)", () => {
      const update = (self: ScrollTrigger) => {
        setPosition(self.progress * 3);
        setActive(Math.min(3, Math.round(self.progress * 3)));
      };
      const story = ScrollTrigger.create({
        trigger: root.current, start: "top 105px", end: () => `+=${window.innerHeight * 2.7}`,
        pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: update, onRefresh: update,
      });
      trigger.current = story;
      return () => { trigger.current = null; story.kill(); setPosition(null); };
    });
    media.add("(max-width: 63.99rem), (max-height: 45.99rem), (prefers-reduced-motion: reduce)", () => {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.chapterIndex));
        }
      }, { rootMargin: "-15% 0px -50% 0px", threshold: 0 });
      root.current?.querySelectorAll("[data-chapter-index]").forEach((chapter) => observer.observe(chapter));
      return () => observer.disconnect();
    });
    return () => media.revert();
  }, []);

  function select(index: number) {
    setActive(index);
    const story = trigger.current;
    if (story) window.scrollTo({ top: story.start + (story.end - story.start) * index / 3, behavior: "smooth" });
    else document.getElementById(`${id}-chapter-${index}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
  function onKey(event: React.KeyboardEvent, index: number) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 3 : event.key === "ArrowRight" ? (index + 1) % 4 : event.key === "ArrowLeft" ? (index + 3) % 4 : null;
    if (next === null) return;
    event.preventDefault(); select(next); buttons.current[next]?.focus({ preventScroll: true });
  }

  return (
    <div ref={root} className={styles.root} data-os-story data-pinned={position !== null}>
      <nav className={styles.navigation} aria-label="Operating System chapters">
        {areas.map((area,index) => <button key={area.name} ref={(el) => { buttons.current[index] = el; }} type="button" onClick={() => select(index)} onKeyDown={(event) => onKey(event,index)} aria-current={active === index ? "step" : undefined} aria-controls={`${id}-chapter-${index}`} className={styles.chapterLink}>
          <span className={styles.navNumber}>0{index+1}</span><span>{area.name}</span><span className={styles.track} aria-hidden><i style={{ transform: `scaleX(${position === null ? (active === index ? 1 : 0) : Math.max(0,Math.min(1,position-index+1))})` }} /></span>
        </button>)}
      </nav>
      <div className={styles.chapters}>
        {areas.map((area,index) => {
          const offset = position === null ? 0 : index - position;
          const opacity = position === null ? 1 : Math.max(0,1-Math.abs(offset)*1.65);
          return <section key={area.name} id={`${id}-chapter-${index}`} aria-labelledby={`${id}-heading-${index}`} aria-hidden={position !== null && active !== index} inert={position !== null && active !== index} className={styles.chapter} data-chapter-index={index} data-active={active === index} style={position === null ? undefined : { opacity, visibility: opacity < 0.01 ? "hidden" : "visible", transform: `translateY(${offset*60}px)`, pointerEvents: active === index ? "auto" : "none" }}>
            <div className={styles.copy}>
              <p className={styles.label}>0{index+1} / The Beyonn Operating System</p>
              <h3 id={`${id}-heading-${index}`} className={styles.name}>{area.name}<span>.</span></h3>
              <h4 className={styles.headline}>{area.title}</h4>
              <p className={styles.description}>{area.detail}</p>
              <Link href={nextSteps[index].href} className={styles.link}>{nextSteps[index].label}<ArrowRight className="size-4" aria-hidden /></Link>
            </div>
            <div className={styles.workspace}>
              <div className={styles.visual}>
                <div className={styles.visualHeader}><span>One connected workflow</span><area.icon className="size-5" strokeWidth={1.5} aria-hidden /></div>
                <ol className={styles.workflow} aria-label={`${area.name} workflow`}>
                  {area.flow.map((step,i) => <li key={step.label} style={{ "--step": i } as React.CSSProperties}><span className={styles.node}><step.icon strokeWidth={1.4} aria-hidden /></span><span>{step.label}</span>{i<2 && <span className={styles.connector} aria-hidden><i /><ArrowRight className="size-4" /></span>}</li>)}
                </ol>
              </div>
              <div className={styles.included}><p>Included in {area.name}</p><ul>{area.items.map((item,i) => <li key={item} style={{ "--step": i } as React.CSSProperties}><Check className="size-4" aria-hidden /><span>{item}</span></li>)}</ul></div>
            </div>
          </section>;
        })}
      </div>
      <div className={styles.footer}><span>Learn → Run → Treat → Grow</span><p>Scroll to explore <span aria-hidden>↓</span></p><span className={styles.counter}>0{active+1} / 04</span></div>
    </div>
  );
}
