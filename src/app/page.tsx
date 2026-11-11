import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronDown, CircleDollarSign, HandHeart, Megaphone, ShieldCheck } from "lucide-react";
import { HomeHero } from "@/components/sections/HomeHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CountUp } from "@/components/ui/CountUp";
import { Tilt } from "@/components/visual/Tilt";
import { Parallax } from "@/components/visual/Parallax";
import { ScrollWords } from "@/components/visual/ScrollWords";
import { SplitTable } from "@/components/sections/SplitTable";
import { Ladder, certificationTiers } from "@/components/sections/Ladder";
import { CtaBand } from "@/components/sections/CtaBand";
import { VisitorSelector } from "@/components/interactive/VisitorSelector";
import { WorkshopSignup } from "@/components/interactive/WorkshopSignup";
import { EndorsementCarousel } from "@/components/interactive/EndorsementCarousel";
import { ProtocolRing } from "@/components/interactive/ProtocolRing";
import { OsTiles } from "@/components/interactive/OsTiles";
import { QuickAnswers } from "@/components/interactive/QuickAnswers";
import { blueprintModules } from "@/content/protocol";
import { articles } from "@/content/articles";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata = pageMeta({
  title: "Dental Sleep Medicine Program for Your Team | OSA + TMD | Beyonn",
  description:
    "Add Obstructive Sleep Apnea and Temporomandibular Joint Disorder treatment to your practice. Beyonn trains your team, gives you the systems and coaches you until it runs.",
  path: "/",
  keywords: ["dental sleep medicine", "sleep apnea training for dentists", "TMD training for dentists", "sleep apnea courses for dentists", "oral appliance therapy", "OSA and TMD program"],
  kicker: "The OSA + TMD program your team can run",
});

const proof = [
  { value: "10,000+", label: "oral appliances delivered" },
  { value: "~20 yrs", label: "20 Years of Treating OSA + TMD" },
  { value: "In-clinic", label: "Built inside a clinic, not a classroom" },
];

const teamRows: [string, string][] = [
  ["Clinical care (you)", "Dr. Rodney Willey's protocols, plus guidance on complex cases"],
  ["New patient calls and booking", "Call scripts, checklists and role-play training"],
  ["Registration and sleep study records", "New patient forms, STOP-Bang screening and Beyonn home sleep test ordering, interpreted by a physician"],
  ["Insurance and medical billing", "A coding and documentation kit (CPT/ICD-10 crosswalks, medical-necessity letters, appeal templates, payer rules), plus optional Billing Assist if you want a hand"],
  ["Treatment plan presentation", "Presentation scripts, consent forms and insurance notices"],
  ["No-shows and follow-up", "A proven no-show and follow-up system"],
  ["Physician referrals and co-management", "A medical referral network kit: letters and pathways for sleep physicians, ENTs, cardiologists and primary care"],
  ["Finding new patients", "Chair-side screening and referral playbooks, plus Beyonn's patient-awareness campaigns"],
];

const gains = [
  { icon: CircleDollarSign, title: "Revenue", text: "Build a new service line around patients you already see, with training in medical billing and case follow-through." },
  { icon: HandHeart, title: "Impact", text: "Patients you used to refer out, now treated in your chair." },
  { icon: ShieldCheck, title: "Ownership", text: "Keep the skills and patient relationships in your practice. A repeatable workflow helps your program continue when staff change." },
  { icon: BadgeCheck, title: "Credibility", text: "Train with Dr. Rodney Willey and be listed in the Beyonn provider directory, where patients are routed to you." },
  { icon: Megaphone, title: "Patients", text: "Beyonn's awareness campaigns and the Patient App send patients to listed providers." },
];

const doctorReasons: [string, string][] = [
  ["His system, not a textbook's.", "Every protocol, script and form in Beyonn was built and tested in his own OSA + TMD practices."],
  ["He coaches your team.", "Monthly coaching, a study club and guidance on your complex cases."],
  ["He built Beyonn for you.", "He kept meeting dentists trained in treating OSA and TMD but could not get it running, so he built the system that gets them there."],
];

export default function HomePage() {
  const practitionerArticles = articles.filter((a) => a.audience === "practitioners").slice(0, 3);

  return (
    <>
      {/* 1. Hero */}
      <HomeHero
        actions={
          <>
            <Button href="/qualify" variant="light" className="max-sm:w-full max-sm:justify-between">
              See if your clinic qualifies
            </Button>

          </>
        }
        below={
          <dl className="grid max-w-xl grid-cols-3 divide-x divide-paper/20">
            {proof.map((p, i) => (
              <div key={p.label} className={i > 0 ? "pl-4 pr-2 sm:pl-6" : "pr-4 sm:pr-6"}>
                <dt className="sr-only">{p.label}</dt>
                <dd>
                  <CountUp value={p.value} className="block font-display text-[clamp(1.1rem,5.8vw,1.75rem)] font-semibold leading-tight tracking-tight sm:text-3xl" />
                  <span className="mt-0.5 block text-[0.72rem] leading-snug text-paper/65 sm:text-sm">{p.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      <aside aria-label="Upcoming workshop" className="relative overflow-hidden border-b border-breath/30 bg-[#e5f3ef]">
        <div className="container-x grid items-center gap-4 py-5 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:py-7">
          <div className="hidden size-20 flex-col items-center justify-center rounded-2xl bg-ink text-paper shadow-sm sm:flex" aria-hidden>
            <span className="text-xs font-semibold uppercase tracking-widest text-breath">Dec</span>
            <span className="font-display text-4xl font-semibold leading-tight">01</span>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dawn-deep"><CalendarDays className="size-4" aria-hidden /> Featured event · Free live workshop</p>
            <h2 className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl">Build your next service line with Dr. Rodney Willey.</h2>
            <p className="mt-2 text-sm text-ink/75"><time dateTime="2026-12-01">December 1, 2026</time><span className="mx-2 text-ink/30" aria-hidden>·</span>9 AM or 7 PM CST · Online</p>
          </div>
          <Button href="/workshop" className="justify-between sm:justify-center">Explore the workshop</Button>
        </div>
      </aside>

      {/* 2. Visitor selector */}
      <section data-guide="welcome" className="relative isolate overflow-clip border-t border-ink/[0.08] bg-paper-2 py-12 sm:py-14 lg:py-16" aria-labelledby="welcome-title" id="welcome">
        <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -left-40 top-10 -z-10 aspect-[1600/1306] w-[44rem] bg-dawn/[0.05] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" aria-hidden />
        <div className="container-x grid gap-5 sm:gap-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-14">
          <div>
            <SectionHeading eyebrow="Choose your path" title={<span id="welcome-title">Welcome to Beyonn. <em>Where should we start?</em></span>} />
            <p data-aos="fade-up" data-aos-delay="120" className="mt-5 max-w-sm text-muted">
              Two quick taps and we&apos;ll point you to the right next step, whether you treat patients or you are one.
            </p>
          </div>
          <VisitorSelector />
        </div>
      </section>

      {/* 11. Clinician endorsements */}
      <section id="stories" data-guide="stories" className="section-y max-sm:py-10 overflow-clip bg-paper-2">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={<>From practitioners who <em>made the move.</em></>} />
        </div>
        <div data-aos="phone-lift" className="mt-5 sm:mt-10">
          <EndorsementCarousel />
        </div>
        <p className="container-x mt-4 text-sm text-muted">Video testimonials and patient stories coming soon.</p>
      </section>

      {/* 3. Dr. Rodney Willey banner */}
      <section id="doctor" data-guide="doctor" className="spotlight relative overflow-clip bg-ink text-paper">
        <div className="container-x py-12 sm:py-14 lg:py-16">
          <div className="grid gap-7 sm:gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* Left: the Beyonn emblem (the dots rebuild it on scroll) and why to partner with him. */}
            <div className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
              <div data-aos="fade-up" className="relative mx-auto hidden aspect-[1600/1306] w-full max-w-[17rem] lg:block" aria-hidden>
                <div className="absolute -inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(114_207_183/0.16),transparent_65%)]" />
                <div
                  data-morph-shape="emblem"
                  data-morph-hide
                  className="absolute inset-0 bg-[linear-gradient(160deg,rgb(255_255_255/0.22),rgb(114_207_183/0.28))] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]"
                />
              </div>
              <h3 data-aos="fade-up" className="t-h3 lg:mt-10">Why partner with him</h3>
              <ol className="mt-4 grid gap-2 sm:mt-5 sm:gap-3 md:grid-cols-3 lg:grid-cols-1">
                {doctorReasons.map(([t, d], i) => (
                  <li key={t} data-aos="fade-up" data-aos-delay={i * 100} className="flex gap-4 rounded-[var(--radius-card)] bg-paper/[0.05] p-3.5 ring-1 ring-paper/10 transition-colors sm:p-5 duration-300 hover:bg-paper/[0.08]">
                    <span className="grid size-8 flex-none place-items-center rounded-full bg-dawn text-sm font-bold text-white">{i + 1}</span>
                    <span>
                      <span className="block font-display text-[1.05rem] font-semibold tracking-tight">{t}</span>
                      <span className="mt-1.5 block text-sm leading-snug text-paper/65 sm:text-[0.93rem] sm:leading-relaxed">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading tone="dark" eyebrow="The clinician behind Beyonn" title={<>Meet Dr. Rodney Willey. <em>The clinician behind Beyonn.</em></>} />
              <div data-aos="reveal" className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-paper/5">
                <Image src="/assets/site/never-lose-a-yes.jpg" alt="Founder Dr. Rodney Willey greeting a patient" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
              </div>
              <p data-aos="fade-up" className="mt-4 text-paper/75">Founder Dr. Rodney Willey brings experience with complex sleep challenges, jaw pain and cases where previous treatment has fallen short.</p>
              <figure data-aos="fade-up" className="mt-5 rounded-[var(--radius-card)] bg-paper/[0.05] p-5 ring-1 ring-paper/10 sm:p-6">
                <span className="block font-display text-5xl leading-[0.6] text-breath" aria-hidden>&ldquo;</span>
                <blockquote className="mt-3 font-display text-[clamp(1.25rem,2vw,1.65rem)] font-medium leading-snug">
                  Don&apos;t treat an airway without understanding the joint. Don&apos;t treat the joint without understanding the airway.
                </blockquote>
                <figcaption className="mt-4 text-sm text-paper/60">Dr. Rodney Willey</figcaption>
              </figure>
              <div className="mt-6" data-aos="fade-up">
                <Button href="/dr-rodney-willey" variant="light">
                  Meet Dr. Rodney Willey
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. The opportunity */}
      <section id="opportunity" data-guide="opportunity" className="section-y max-sm:py-10 bg-paper">
        <div className="container-x grid gap-5 sm:gap-14 lg:grid-cols-[7fr_5fr] lg:items-end">
          <div>
            <SectionHeading index="03" eyebrow="The opportunity" title={<>The patients are <em>already in your chair.</em></>} />
            <p data-aos="fade-up" className="mt-4 max-w-2xl sm:mt-8 t-lead text-muted">
              Snoring, clenching, morning headaches, scalloped tongues, worn-out night guards. These are often signs of OSA and TMD, and most go unrecognized in a dental office. Each one is a patient you could help and a case your practice isn&apos;t treating yet.
            </p>
          </div>
          <div>
            <Parallax speed={0.05}><div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2" data-aos="reveal" data-aos-duration="1200"><Image src="/assets/people/patient-conversation.webp" alt="Clinician speaking with a patient" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain" /></div></Parallax>
          </div>
        </div>
        <div className="container-x mt-6 sm:mt-14">
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-ink px-6 py-7 text-paper sm:px-14 sm:py-16">
            <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -right-16 top-1/2 aspect-[1600/1306] w-[28rem] -translate-y-1/2 bg-paper/[0.05] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[40rem]" aria-hidden />
            <ScrollWords
              className="relative mx-auto max-w-4xl text-center font-display text-[clamp(1.5rem,2.8vw,2.5rem)] font-semibold leading-[1.25] tracking-tight"
              segments={[{ text: "OSA and TMD are married. Treated separately, they relapse." }, { text: "Treated together, they resolve.", className: "text-breath" }]}
            />
          </div>
        </div>
      </section>

      {/* 5. What Beyonn gives your team */}
      <section id="gives" data-guide="gives" className="section-y max-sm:py-10 bg-paper-2">
        <div className="container-x">
          <div className="grid gap-5 sm:gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              index="04"
              eyebrow="What Beyonn gives your team"
              title={<>We don&apos;t do it for you. <em>We enable your team for it.</em></>}
              lead="Outsourcing keeps you dependent. Beyonn builds the skills inside your practice, so the program, the patients and the know-how stay with you."
            />
            <p data-aos="fade-up" className="border-l-2 border-dawn pl-4 text-sm font-semibold text-dawn-deep">More ownership. Not less support.</p>
          </div>
          <div className="mt-6 md:hidden">
            <p className="mb-3 t-eyebrow text-muted">Tap a role to see what your team gets</p>
            <div className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {teamRows.map(([role, support], i) => (
                <details key={role} data-aos="phone-lift" data-aos-delay={(i % 3) * 55} name="home-team-roles" className="group open:bg-paper">
                  <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 font-semibold focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-xs text-dawn-deep" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    {role}
                    <ChevronDown className="size-4 text-dawn-deep group-open:rotate-180 motion-safe:transition-transform" aria-hidden />
                  </summary>
                  <p className="mobile-reveal pb-4 pl-11 pr-4 text-sm leading-relaxed text-muted">{support}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="mt-10 hidden md:block">
            <SplitTable head={["Your team's job", "How Beyonn equips them"]} rows={teamRows} />
          </div>

          <div className="mt-5"><Button href="/qualify">Book a Discovery Call</Button></div>
          <section id="blueprint" aria-labelledby="coaching-blueprint" className="mt-8 grid gap-6 rounded-[var(--radius-panel)] border border-dawn/20 border-t-4 border-t-dawn bg-white p-5 shadow-[0_20px_60px_-40px_rgb(19_37_62/0.35)] sm:mt-14 sm:gap-10 sm:p-8 lg:grid-cols-[3.5fr_8.5fr]">
            <div data-aos="fade-up" className="lg:sticky lg:top-28 lg:self-start">
              <p className="t-eyebrow text-muted max-sm:flex max-sm:items-center max-sm:gap-2 max-sm:text-dawn-deep max-sm:before:h-0.5 max-sm:before:w-5 max-sm:before:bg-dawn">Core training · The Blueprint</p>
              <h3 id="coaching-blueprint" className="mt-3 t-h2">The Coaching Clinician Blueprint</h3>
              <p className="mt-4 leading-relaxed text-muted">Twelve training modules that take your team from the first new patient call to replacement appliances.</p>
              <p className="mt-4 leading-relaxed text-muted">Plus: the Forms Center, hands-on onboarding from the Beyonn team, and ongoing coaching.</p>
              <p className="mt-6 font-display text-lg font-semibold tracking-tight text-ink">Built to last. When staff change, the system stays.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-dawn-deep">
                <span className="rounded-full bg-dawn/10 px-3 py-2">12 modules</span><span className="rounded-full bg-dawn/10 px-3 py-2">4 workflow stages</span><span className="rounded-full bg-dawn/10 px-3 py-2">One team learning path</span>
              </div>
              <div className="mt-5"><ArrowLink href="/academy">Explore the training pathway</ArrowLink></div>
            </div>
            <ol data-morph-shape="rect" className="grid grid-cols-2 gap-2 sm:gap-px sm:overflow-hidden sm:rounded-[var(--radius-card)] sm:border sm:border-ink/10 sm:bg-ink/10 xl:grid-cols-4">
              {blueprintModules.map((m, i) => (
                <li key={m} data-aos="fade-up" data-phone-reveal="card" data-aos-delay={(i % 4) * 60} className="flex flex-col gap-2 bg-paper-2 p-3 text-sm transition-colors duration-500 max-sm:rounded-xl max-sm:border max-sm:border-dawn/12 sm:min-h-[7rem] sm:justify-between sm:gap-3 sm:p-5 sm:text-base sm:hover:bg-paper">
                  <span className="font-mono text-sm text-dawn-deep max-sm:grid max-sm:size-7 max-sm:place-items-center max-sm:rounded-md max-sm:bg-dawn/10 max-sm:text-xs">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium leading-snug">{m}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      {/* Marquee */}
      <div data-aos="fade" className="overflow-hidden border-y border-paper/10 bg-ink py-7 text-paper" aria-hidden>
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="marquee__track">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center gap-12 whitespace-nowrap text-[clamp(1.5rem,3vw,2.5rem)] tracking-tight">
                  You&apos;re the operator. <em className="serif-em text-breath">Beyonn is the operating system.</em>
                  <span className="size-2 rounded-full bg-paper/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 6. The Beyonn Protocol */}
      <section id="protocol" data-guide="protocol" className="section-y max-sm:py-10 border-y border-dawn/15 bg-[#f0f5fb]">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading index="05" eyebrow="The Beyonn Protocol" title={<>One system. Four steps. <em>Run by your team.</em></>} />
            <Button href="/the-beyonn-system" variant="ghost">
              See the full Beyonn System
            </Button>
          </div>
          <div className="mt-6 lg:mt-12">
            <ProtocolRing />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dawn/15 bg-white px-5 py-4">
            <div><p className="font-semibold text-ink">See the four steps in practice.</p><p className="mt-1 text-sm text-muted">Explore the approach in a free workshop with Dr. Rodney Willey.</p></div>
            <Button href="/workshop">Explore the workshop</Button>
          </div>
        </div>
      </section>

      {/* 7. The Beyonn Operating System */}
      <section id="platform" data-guide="platform" className="spotlight section-y max-sm:py-10 relative overflow-hidden bg-ink text-paper">
        <div className="hero-glow absolute inset-0 opacity-30" aria-hidden />
        <div className="container-x relative">
          <SectionHeading
            tone="dark"
            align="center"
            title={<>The Beyonn <em className="text-breath">Operating System</em></>}
            lead="Every part of your program lives on one platform: learning, patients, cases, tests, appliance orders, marketing and results."
          />
          <div className="mt-10">
            <OsTiles />
          </div>
          <div data-aos="fade-up" className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-6 border-t border-paper/10 pt-8">
            <p className="text-paper/65">One platform for the US and Beyonn Global.</p>
            <ArrowLink href="/patient-app" className="text-breath">
              See the Beyonn Patient App
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* 8. What you gain */}
      <section id="gain" data-guide="gain" className="section-y max-sm:py-10 bg-paper">
        <div className="container-x">
          <SectionHeading index="07" title={<>What you <em>gain</em></>} />
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-6 md:gap-4 md:grid-rows-[auto_auto_auto]">
            {gains.map((g, i) => {
              const big = i === 0;
              const span = ["md:col-span-3 md:row-span-2", "md:col-span-3", "md:col-span-3", "md:col-span-3", "md:col-span-3"][i];
              return (
                <div key={g.title} data-aos="fade-up" data-phone-reveal="card" data-aos-delay={(i % 3) * 90} className={cn(span, big && "col-span-2")}>
                  <Tilt className="h-full rounded-[var(--radius-panel)]" max={big ? 4 : 6}>
                    <div
                      className={cn(
                        "relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] p-4 md:p-7",
                        big ? "bg-ink text-paper md:min-h-[19rem]" : "border border-ink/10 bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]",
                      )}
                    >
                      {big && (
                        <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -bottom-20 -right-24 aspect-[1600/1306] w-[26rem] bg-paper/[0.06] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" aria-hidden />
                      )}
                      <span className={cn("grid size-9 place-items-center rounded-xl md:size-12", big ? "bg-paper/10 text-breath" : "bg-dawn/10 text-dawn")}>
                        <g.icon className="size-5 md:size-6" aria-hidden />
                      </span>
                      <h3 className={cn("relative font-display font-semibold tracking-tight", big ? "mt-auto pt-4 md:pt-12 text-[clamp(1.7rem,2.6vw,2.4rem)]" : "mt-3 text-lg md:mt-5 md:text-xl")}>{g.title}</h3>
                      <p className={cn("relative mt-2 leading-relaxed", big ? "max-w-md text-paper/75 md:text-lg" : "text-sm text-muted md:text-[0.95rem]")}>{g.text}</p>
                    </div>
                  </Tilt>
                </div>
              );
            })}
          </div>
          <div className="mt-9 md:mt-16">
            <div className="mb-5 md:mb-10">
              <h3 data-aos="fade-up" className="t-h2">
                Your growth path
              </h3>
              <p className="mt-3 max-w-2xl text-muted">Begin with core training, build experience with ongoing coaching, then progress through the provider tiers.</p>
            </div>
            <Ladder tiers={certificationTiers.home} compact />
          </div>
        </div>
      </section>

      {/* 9. Free workshop */}
      <section id="workshop" data-guide="workshop" className="spotlight section-y max-sm:py-10 relative overflow-clip bg-night text-paper">
        <div className="container-x relative grid gap-6 lg:grid-cols-[6fr_6fr] lg:gap-14">
          {/* Both columns are sticky: whichever is shorter holds while the other scrolls. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-breath/30 bg-breath/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-breath"><CalendarDays className="size-4" aria-hidden /> Free live workshop · December 1</p>
            <SectionHeading tone="dark" index="08" title={<>Build your next service line. <em className="text-breath">Join a free workshop</em> with Dr. Rodney Willey.</>} />
            <div data-aos="fade-up" className="mt-6 lg:mt-10">
              <h3 className="t-eyebrow text-paper/50">What you&apos;ll learn</h3>
              <ol className="mt-3 divide-y divide-paper/10 border-y border-paper/10 sm:mt-5">
                {[
                  "The missed opportunity of not offering OSA + TMD care in your practice",
                  "How to spot these patients in your chair",
                  "Why OSA and TMD must be treated together",
                  "How to build a service line with medical billing, patient demand and ongoing team support",
                ].map((item, i) => (
                  <li key={item} data-aos="phone-lift" data-aos-delay={i * 40} className="group flex items-baseline gap-3 py-2 sm:gap-5 sm:py-2.5 lg:py-4">
                    <span className="font-display text-sm font-semibold tabular-nums text-breath">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm leading-snug text-paper/85 sm:text-[1.02rem] transition-colors duration-300 group-hover:text-paper">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div data-morph-shape="rect" data-aos="fade-up" className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(160deg,rgb(255_255_255/0.09),rgb(255_255_255/0.025)_55%)] p-4 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)] ring-1 ring-paper/12 sm:p-9 lg:sticky lg:top-28 lg:self-start">
            <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-breath/15 blur-3xl" aria-hidden />
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-xl"><Image src="/assets/site/staff-onboarding.jpg" alt="Dr. Rodney Willey reviewing a tablet with a team member in the clinic" fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" /></div>
            <WorkshopSignup />
            <div className="mt-4"><ArrowLink href="/workshop" className="text-paper">Explore the workshop agenda</ArrowLink></div>
          </div>
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="container-x grid items-center gap-6 md:grid-cols-2">
          <div><SectionHeading eyebrow="For your patients" title={<>Care continues <em>between visits.</em></>} lead="The Beyonn Patient App helps patients recognise symptoms, prepare for appointments and follow their care journey." /><div className="mt-5"><Button href="/patient-app">Explore the Patient App</Button></div></div>
          <div data-aos="fade-up" className="rounded-2xl border border-dawn/15 bg-white p-6"><p className="t-eyebrow text-dawn-deep">Patient App</p><h3 className="mt-3 t-h3">Check. Prepare. Follow through.</h3><p className="mt-3 text-muted">App interface preview coming soon</p></div>
        </div>
      </section>

      {/* 12. Blogs and resources */}
      <section className="section-y max-sm:py-10 bg-paper">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading index="11" title={<>Learn before <em>you leap.</em></>} />
            <ArrowLink href="/resources">All resources</ArrowLink>
          </div>
          <p className="mt-5 t-eyebrow text-muted md:hidden">Swipe to explore articles →</p>
          <div className="mt-3 grid gap-4 max-md:-mx-[var(--gutter)] max-md:snap-x max-md:snap-mandatory max-md:auto-cols-[min(82%,23rem)] max-md:grid-flow-col max-md:overflow-x-auto max-md:overscroll-x-contain max-md:px-[var(--gutter)] max-md:pb-3 max-md:[scroll-padding-inline:var(--gutter)] md:mt-10 md:grid-cols-3">
            {practitionerArticles.map((a, i) => (
              <Link key={a.slug} href={`/resources/${a.slug}`} data-aos="fade-up" data-phone-reveal="card" data-aos-delay={i * 80} className="card card-hover group flex flex-col justify-between gap-4 bg-white/55 p-5 max-md:snap-start md:min-h-[20rem] md:gap-0 md:p-7">
                <span className="flex items-center justify-between t-eyebrow text-muted">
                  <span>For practitioners · {a.minutes} min</span>
                  <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </span>
                <span>
                  <span className="block t-h3">{a.title}</span>
                  <span className="mt-3 block leading-relaxed text-muted max-md:line-clamp-3">{a.excerpt}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Quick answers */}
      <section className="section-y max-sm:pb-10 bg-paper pt-0">
        <div className="container-x grid gap-4 sm:gap-12 lg:grid-cols-[4fr_8fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading title={<>Your questions, <em>answered.</em></>} />
          </div>
          <QuickAnswers />
        </div>
      </section>

      {/* 15. Final call to action */}
      <div data-guide="cta">
        <CtaBand
          eyebrow=""
          title={<>Your patients are already in the chair. <em className="text-breath">Let&apos;s get your team ready to treat them.</em></>}
          actions={
            <>
              <Button href="/qualify" variant="dawn">
                See If Your Practice Qualifies
              </Button>
              <Button href="/workshop" variant="ghost-light">
                Join a Workshop
              </Button>
            </>
          }
        />
      </div>
    </>
  );
}
