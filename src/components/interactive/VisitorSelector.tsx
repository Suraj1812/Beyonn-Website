"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useVisitor } from "@/components/providers/VisitorProvider";
import { AppGet, type AppScreen } from "./AppGet";
import { cn } from "@/lib/cn";

type Option = { chip: string; need: string; reply: string; cta: string; href?: string; app?: AppScreen };
type Path = "practitioner" | "patient";

const practitionerOptions: Option[] = [
  { chip: "A new revenue stream", need: "I want a new revenue stream", reply: "OSA + TMD care is billed to medical insurance, so it adds to your dental revenue instead of competing with it. A short call is the quickest way to see what it could look like for you.", cta: "Book a Discovery Call", href: "/qualify#book" },
  { chip: "Helping OSA + TMD patients", need: "I want to help patients with OSA and TMD", reply: "Start with the free one-hour workshop. Dr. Willey walks through how to spot these patients in your chair and why both conditions are treated together.", cta: "Join the Free Workshop", href: "#workshop" },
  { chip: "Took the course, never launched", need: "I took the course but never launched", reply: "That's the story we hear most. Knowing how to treat is rarely the problem; the calls, paperwork, billing and follow-up are. This is how Beyonn handles that part.", cta: "See How It Works", href: "#gives" },
  { chip: "Do I qualify?", need: "I want to see if I qualify to be a Beyonn Network Partner", reply: "It only takes a few minutes. Tell us about your practice and the team will let you know if it's a fit.", cta: "See If My Practice Qualifies", href: "/qualify" },
  { chip: "Becoming a partner", need: "I want to become a Beyonn Network Partner", reply: "Let's talk. A discovery call covers your practice, your team and the level of support that fits.", cta: "Book a Discovery Call", href: "/qualify#book" },
  { chip: "Billing & insurance", need: "I want my team to handle medical billing and insurance", reply: "Your team gets a coding and documentation kit and training for every step, with Billing Assist if you'd like a hand.", cta: "See the Team Training", href: "#gives" },
  { chip: "Learning from Dr. Willey", need: "I want to learn from Dr. Rodney Willey", reply: "Every protocol, script and form in Beyonn comes from Dr. Willey's own OSA + TMD practices, and he coaches partner teams every month.", cta: "Meet Dr. Rodney Willey", href: "#doctor" },
  { chip: "The technology", need: "I want to see the technology", reply: "Learning, patients, cases, tests, appliance orders and results all live on one platform. Have a look inside.", cta: "See the Platform", href: "#platform" },
  { chip: "Practices doing it", need: "I want to hear from practices already doing it", reply: "Here are clinicians who have worked with Dr. Willey, in their own words.", cta: "Hear From Partners", href: "#stories" },
  { chip: "Outside the US", need: "My practice is outside the US", reply: "Beyonn Global brings the same program to practices outside the United States. Register your interest and we'll be in touch.", cta: "Register Your Interest", href: "/global#register" },
  { chip: "Just exploring", need: "I'm just exploring", reply: "No pressure at all. The free workshop is a relaxed way to see how it all works.", cta: "Join the Free Workshop", href: "#workshop" },
];

const patientOptions: Option[] = [
  { chip: "I snore", need: "I snore, and it's keeping someone up", reply: "Snoring that keeps someone awake is worth checking. The Snore Score in the Beyonn Patient App is a simple first step.", cta: "Check My Snore Score", app: "snore-score" },
  { chip: "Always tired", need: "I'm tired all day, no matter how much I sleep", reply: "Feeling tired however much you sleep can be linked to breathing problems at night. The Sleep Score helps you see if it's worth a closer look.", cta: "Check My Sleep Score", app: "sleep-score" },
  { chip: "Headaches or sore jaw", need: "I wake up with headaches or a sore jaw", reply: "Morning headaches and a sore jaw are often connected to how you breathe and clench at night. Here's how they're linked.", cta: "Find Out Why", href: "/patients#connected" },
  { chip: "Jaw clicks or locks", need: "My jaw clicks, locks or aches", reply: "Clicking, locking or aching can be signs of TMD. Here's what to look for and what can help.", cta: "See If It's TMD", href: "/patients#tmd" },
  { chip: "CPAP didn't work", need: "I tried CPAP and couldn't stick with it", reply: "You're not alone. A custom oral appliance is an option for many people who can't keep using CPAP.", cta: "Explore a CPAP Alternative", href: "/patients#treatment" },
  { chip: "A sleep test", need: "I want to take a sleep test", reply: "A provider can order a home sleep test after an exam. The app helps you book one.", cta: "Start With an Exam", app: "book-exam" },
  { chip: "Find a doctor", need: "I want to find a doctor for my symptoms", reply: "Search by ZIP code or city to find a Beyonn provider near you.", cta: "Find a Doctor", href: "/patients/find-a-provider" },
  { chip: "I'm already a patient", need: "I'm already a patient", reply: "Welcome back. The patient portal has your treatment, forms and messages.", cta: "Open the Patient Portal", href: "/portal" },
  { chip: "Just learning", need: "I just want to learn more about OSA and TMD", reply: "Our guides explain OSA and TMD in plain language, one question at a time.", cta: "Read the Guides", href: "/resources?for=patients" },
];

const options: Record<Path, Option[]> = { practitioner: practitionerOptions, patient: patientOptions };

/** Speech bubble. `from="beyonn"` sits left with the emblem avatar; `from="you"` sits right. */
function Bubble({ from, children }: { from: "beyonn" | "you"; children: React.ReactNode }) {
  const you = from === "you";
  return (
    <div className={cn("flex animate-fade-up items-end gap-2.5", you && "justify-end")}>
      {!you && (
        <span className="grid size-8 flex-none place-items-center rounded-full bg-ink" aria-hidden>
          <span className="block aspect-[1600/1306] w-5 bg-paper [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" />
        </span>
      )}
      <div className={cn("max-w-[85%] px-4 py-3 leading-relaxed", you ? "rounded-2xl rounded-br-md bg-dawn text-white" : "rounded-2xl rounded-bl-md bg-paper-2 text-text")}>{children}</div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-end gap-2.5" aria-hidden>
      <span className="size-8 flex-none" />
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-paper-2 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink/40" style={{ animationDelay: `${i * 140}ms` }} />
        ))}
      </div>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[0.93rem] font-medium text-ink transition-[border-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-dawn hover:text-dawn"
    >
      {children}
    </button>
  );
}

/**
 * Home §2: a short guided conversation. Pick who you are, pick what brings you
 * here, and get a plain-language answer with the right next step.
 * Replies are written in the Beyonn team's voice (not as quotes from Dr. Willey).
 */
export function VisitorSelector() {
  const { visitor, setVisitor } = useVisitor();
  const needId = useId();
  const path: Path | null = visitor === "patient" || visitor === "practitioner" ? visitor : null;
  const [pick, setPick] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const choosePath = (p: Path) => {
    window.clearTimeout(timer.current);
    setVisitor(p);
    setPick(null);
    setTyping(false);
  };

  const chooseNeed = (i: number) => {
    window.clearTimeout(timer.current);
    setPick(i);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyping(false);
      return;
    }
    setTyping(true);
    timer.current = window.setTimeout(() => setTyping(false), 650);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setVisitor(null);
    setPick(null);
    setTyping(false);
  };

  const opts = path ? options[path] : [];
  const chosen = pick !== null ? opts[pick] : null;
  const others = pick !== null ? opts.filter((_, i) => i !== pick).slice(0, 4) : [];

  return (
    <div data-visitor-selector>
      {/* The desktop conversation keeps its existing layout. */}
      <div data-aos="fade-up" data-aos-delay="100" className="rounded-[var(--radius-panel)] bg-white p-4 shadow-[0_30px_60px_-40px_rgb(19_37_62/0.55)] ring-1 ring-ink/10 sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.08] pb-3 sm:gap-4 sm:pb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-breath opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-breath-deep" />
            </span>
            <p className="text-sm font-semibold">Find your starting point</p>
          </div>
          {path && (
            <button type="button" onClick={reset} className="inline-flex min-h-11 flex-none items-center gap-1.5 text-xs text-muted sm:min-h-0 sm:text-sm transition-colors hover:text-ink">
              <RotateCcw className="size-3.5" aria-hidden />
              Start over
            </button>
          )}
        </div>

        <div className="mt-4 sm:hidden" data-mobile-selector>
          <p className="text-sm font-medium text-ink">Who are you here as?</p>
          <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Choose your audience">
            {(["practitioner", "patient"] as const).map((audience) => <button key={audience} type="button" aria-pressed={path === audience} onClick={() => choosePath(audience)} className={cn("min-h-11 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors", path === audience ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink")}>
              I&apos;m a {audience}
            </button>)}
          </div>
          {path && <div className="mt-4">
            <label htmlFor={needId} className="text-sm font-medium text-ink">What brings you here today?</label>
            <select id={needId} value={pick ?? ""} onChange={(event) => { window.clearTimeout(timer.current); setTyping(false); setPick(event.target.value === "" ? null : Number(event.target.value)); }} className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-ink/20 bg-paper-2 px-3 py-2 text-base text-ink focus:border-dawn">
              <option value="">Choose what you need</option>
              {opts.map((option,i) => <option key={option.chip} value={i}>{option.chip}</option>)}
            </select>
          </div>}
          <div aria-live="polite">
            {chosen && <div key={`${path}-${pick}`} className="mt-4 border-t border-ink/10 pt-4 motion-safe:animate-fade-up">
              <p className="text-sm leading-relaxed text-muted">{chosen.reply}</p>
              <div className="mt-3 [&_.btn]:h-auto [&_.btn]:min-h-11 [&_.btn]:w-full [&_.btn]:justify-between [&_.btn]:whitespace-normal [&_.btn]:py-2 [&_.btn]:text-left [&_.btn]:text-sm">
                {chosen.app ? <AppGet label={chosen.cta} screen={chosen.app} size="sm" variant="dawn" /> : <Link href={chosen.href!} className="btn btn--dawn btn--sm"><span>{chosen.cta}</span><ArrowRight className="size-4 flex-none" aria-hidden /></Link>}
              </div>
            </div>}
          </div>
        </div>

        <div className="mt-5 hidden space-y-4 sm:block" aria-live="polite" data-desktop-selector>
          <Bubble from="beyonn">Hi, welcome to Beyonn. Who are you here as?</Bubble>

          {!path ? (
            <div className="flex flex-wrap gap-2 pl-[2.6rem]">
              <Chip onClick={() => choosePath("practitioner")}>I&apos;m a practitioner</Chip>
              <Chip onClick={() => choosePath("patient")}>I&apos;m a patient</Chip>
            </div>
          ) : (
            <>
              <Bubble from="you">{path === "practitioner" ? "I'm a practitioner" : "I'm a patient"}</Bubble>
              <Bubble from="beyonn">{path === "practitioner" ? "Great to have you. What brings you here today?" : "Thanks for stopping by. What's going on?"}</Bubble>

              {!chosen ? (
                <div className="flex flex-wrap gap-2 pl-[2.6rem]">
                  {opts.map((o, i) => (
                    <Chip key={o.chip} onClick={() => chooseNeed(i)}>
                      {o.chip}
                    </Chip>
                  ))}
                </div>
              ) : (
                <>
                  <Bubble from="you">{chosen.need}</Bubble>
                  {typing ? (
                    <Typing />
                  ) : (
                    <>
                      <Bubble from="beyonn">
                        <p>{chosen.reply}</p>
                        <div className="mt-3">
                          {chosen.app ? (
                            <AppGet label={chosen.cta} screen={chosen.app} size="sm" variant="dawn" />
                          ) : (
                            <Link href={chosen.href!} className="btn btn--dawn btn--sm">
                              <span>{chosen.cta}</span>
                              <ArrowRight aria-hidden />
                            </Link>
                          )}
                        </div>
                      </Bubble>
                      <div className="flex flex-wrap items-center gap-2 pl-[2.6rem]">
                        <span className="mr-1 text-sm text-muted">Something else?</span>
                        {others.map((o) => (
                          <Chip key={o.chip} onClick={() => chooseNeed(opts.indexOf(o))}>
                            {o.chip}
                          </Chip>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {path === "patient" && <p className="mt-5 border-t border-ink/[0.08] pt-3 text-xs text-muted">General information only, not medical advice or a diagnosis.</p>}
      </div>
    </div>
  );
}
