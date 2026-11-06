import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BadgeCheck, CircleDollarSign, HandHeart, Megaphone, ShieldCheck } from "lucide-react";
import { HomeHero } from "@/components/sections/HomeHero";
import { CutoutPortrait } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CountUp } from "@/components/ui/CountUp";
import { Tilt } from "@/components/visual/Tilt";
import { Parallax } from "@/components/visual/Parallax";
import { ScrollWords } from "@/components/visual/ScrollWords";
import { CheckList } from "@/components/ui/Check";
import { SplitTable } from "@/components/sections/SplitTable";
import { Ladder, certificationTiers } from "@/components/sections/Ladder";
import { AirwayModel } from "@/components/visual/AirwayModel";
import { PathSplit } from "@/components/visual/PathSplit";
import { VisitorSelector } from "@/components/interactive/VisitorSelector";
import { EndorsementCarousel } from "@/components/interactive/EndorsementCarousel";
import { ProtocolRing } from "@/components/interactive/ProtocolRing";
import { OsTiles } from "@/components/interactive/OsTiles";
import { QuickAnswers } from "@/components/interactive/QuickAnswers";
import { blueprintModules } from "@/content/protocol";
import { articles } from "@/content/articles";
import { endorsements } from "@/content/endorsements";
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
  { value: "~20 yrs", label: "treating only OSA + TMD" },
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
  { icon: CircleDollarSign, title: "Revenue", text: "A new service line from patients you already see, billed to medical insurance." },
  { icon: HandHeart, title: "Impact", text: "Patients you used to refer out, now treated in your chair." },
  { icon: ShieldCheck, title: "Ownership", text: "The program, the skills and the patient relationships stay in your practice." },
  { icon: BadgeCheck, title: "Credibility", text: "Train with Dr. Rodney Willey and be listed in the Beyonn provider directory, where patients are routed to you." },
  { icon: Megaphone, title: "Patients", text: "Beyonn's awareness campaigns and the Patient App send patients to listed providers." },
];

const doctorStats = [
  { value: "10,000+", label: "oral appliances delivered in the US" },
  { value: "~20 yrs", label: "practice limited to OSA + TMD" },
  { value: "3", label: "credentials: DDS, D.ACSDD, D.ASBA" },
];

const doctorReasons: [string, string][] = [
  ["His system, not a textbook's.", "Every protocol, script and form in Beyonn was built and tested in his own OSA + TMD practices."],
  ["He coaches your team.", "Monthly coaching, a study club and guidance on your complex cases."],
  ["He built Beyonn for you.", "He kept meeting dentists trained in OSA and TMD who could not get it running, so he built the system that gets them there."],
];

const supportPlans = [
  { src: "/assets/site/card-done-for-you.png", alt: "OSA+TMD Done for You", title: "OSA + TMD Done for You", text: "We become your extended team and carry the operational load.", meta: "4 weeks · 15 resources" },
  { src: "/assets/site/card-pr-marketing.png", alt: "PR & Marketing Suite", title: "PR & Marketing Suite", text: "Ready-to-use patient education and practice growth resources.", meta: "40+ page workbook · Yearly marketing kit" },
];

const signs = ["Snoring", "Clenching", "Morning headaches", "Scalloped tongues", "Worn-out night guards"];

const credentials = [
  { k: "DDS", v: "Doctor of Dental Surgery" },
  { k: "D.ACSDD", v: "Diplomate credential" },
  { k: "D.ASBA", v: "Diplomate credential" },
  { k: "10,000+", v: "Oral appliances delivered in the US" },
  { k: "~20 yrs", v: "Practice limited to OSA and TMD" },
];

export default function HomePage() {
  const practitionerArticles = articles.filter((a) => a.audience === "practitioners").slice(0, 3);

  return (
    <>
      {/* 1. Hero */}
      <HomeHero
        actions={
          <>
            <Button href="/qualify" variant="light">
              See if your clinic qualifies
            </Button>
            <Button href="/#workshop" variant="ghost-light">
              Join the Free Workshop
            </Button>
          </>
        }
        below={
          <dl className="grid max-w-md grid-cols-2 divide-x divide-paper/20">
            {proof.map((p, i) => (
              <div key={p.label} className={i > 0 ? "pl-6 sm:pl-8" : "pr-6 sm:pr-8"}>
                <dt className="sr-only">{p.label}</dt>
                <dd>
                  <CountUp value={p.value} className="block font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-3xl" />
                  <span className="mt-0.5 block text-sm text-paper/65">{p.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      {/* 2. Visitor selector */}
      <section data-guide="welcome" className="relative isolate overflow-clip border-t border-ink/[0.08] bg-paper-2 py-12 sm:py-16 lg:py-20" aria-labelledby="welcome">
        <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -left-40 top-10 -z-10 aspect-[1600/1306] w-[44rem] bg-dawn/[0.05] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" aria-hidden />
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
            <SectionHeading eyebrow="Choose your path" title={<span id="welcome">Welcome to Beyonn. <em>Where should we start?</em></span>} />
            <p data-aos="fade-up" data-aos-delay="120" className="max-w-sm text-muted">
              Two quick taps and we&apos;ll point you to the right next step, whether you treat patients or you are one.
            </p>
          </div>
          <div className="mt-10 lg:mt-12">
            <VisitorSelector />
          </div>
        </div>
      </section>

      {/* 3. Dr. Rodney Willey banner */}
      <section id="doctor" data-guide="doctor" className="spotlight relative overflow-clip bg-ink text-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div data-aos="fade-up" className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
              <CutoutPortrait
                emblem="on-dark"
                photo={{ src: "/assets/people/rodney-hero.webp", alt: "Dr. Rodney Willey", mode: "contain", caption: { name: "Dr. Rodney Willey", role: "DDS, D.ACSDD, D.ASBA" } }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading tone="dark" eyebrow="The clinician behind Beyonn" title={<>Learn from the clinician who has done it <em>10,000 times.</em></>} />
              <dl className="mt-10 grid grid-cols-3 divide-x divide-paper/10 overflow-hidden rounded-[var(--radius-card)] bg-paper/[0.05] ring-1 ring-paper/10">
                {doctorStats.map((d, i) => (
                  <div key={d.label} data-aos="fade-up" data-aos-delay={i * 80} className="px-4 py-5 sm:px-6">
                    <dt className="sr-only">{d.label}</dt>
                    <dd>
                      <CountUp value={d.value} className="block font-display text-2xl font-semibold tracking-tight text-breath sm:text-3xl" />
                      <span className="mt-1 block text-[0.8rem] leading-snug text-paper/65 sm:text-sm">{d.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p data-aos="fade-up" className="mt-8 max-w-xl t-lead text-paper/75">
                Known for the hard cases: chronic pain, disabilities and failed prior treatment. Every protocol in Beyonn comes from his own chair.
              </p>
              <figure data-aos="fade-up" className="mt-8 rounded-[var(--radius-card)] bg-paper/[0.05] p-6 ring-1 ring-paper/10 sm:p-7">
                <span className="block font-display text-6xl leading-[0.6] text-breath" aria-hidden>&ldquo;</span>
                <blockquote className="mt-3 font-display text-[clamp(1.25rem,2vw,1.65rem)] font-medium leading-snug">
                  Don&apos;t treat an airway without understanding the joint. Don&apos;t treat the joint without understanding the airway.
                </blockquote>
                <figcaption className="mt-4 text-sm text-paper/60">Dr. Rodney Willey</figcaption>
              </figure>
              <div className="mt-8" data-aos="fade-up">
                <Button href="/dr-rodney-willey" variant="light">
                  Meet Dr. Rodney Willey
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <h3 data-aos="fade-up" className="t-h3">Why partner with him</h3>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {doctorReasons.map(([t, d], i) => (
                <li key={t} data-aos="fade-up" data-aos-delay={i * 100} className="rounded-[var(--radius-card)] bg-paper/[0.05] p-6 ring-1 ring-paper/10 transition-colors duration-300 hover:bg-paper/[0.08]">
                  <span className="grid size-9 place-items-center rounded-full bg-dawn text-sm font-bold text-white">{i + 1}</span>
                  <p className="mt-5 font-display text-lg font-semibold tracking-tight">{t}</p>
                  <p className="mt-2 leading-relaxed text-paper/65">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. The opportunity */}
      <section id="opportunity" data-guide="opportunity" className="section-y bg-paper">
        <div className="container-x grid gap-14 lg:grid-cols-[7fr_5fr] lg:items-end">
          <div>
            <SectionHeading index="03" eyebrow="The opportunity" title={<>The patients are <em>already in your chair.</em></>} />
            <p data-aos="fade-up" className="mt-8 max-w-2xl t-lead text-muted">
              Snoring, clenching, morning headaches, scalloped tongues, worn-out night guards. These are often signs of OSA and TMD, and most go unrecognized in a dental office. Each one is a patient you could help and a case your practice isn&apos;t treating yet.
            </p>
          </div>
          <div>
            <Parallax speed={0.05}><div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2" data-aos="reveal" data-aos-duration="1200"><Image src="/assets/people/patient-conversation.webp" alt="Clinician speaking with a patient" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain" /></div></Parallax>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Common signs seen in the dental chair">
              {signs.map((s, i) => (
                <li key={s} data-aos="fade-up" data-aos-delay={i * 50} className="rounded-full border border-ink/15 bg-white/60 px-4 py-2 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container-x mt-14">
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-ink px-6 py-12 text-paper sm:px-14 sm:py-16">
            <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -right-16 top-1/2 aspect-[1600/1306] w-[28rem] -translate-y-1/2 bg-paper/[0.05] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[40rem]" aria-hidden />
            <ScrollWords
              className="relative mx-auto max-w-4xl text-center font-display text-[clamp(1.5rem,2.8vw,2.5rem)] font-semibold leading-[1.25] tracking-tight"
              segments={[{ text: "OSA and TMD are married. Treated separately, they relapse." }, { text: "Treated together, they resolve.", className: "text-breath" }]}
            />
          </div>
        </div>
      </section>

      {/* 4b. How an appliance helps, in 3D */}
      <section id="how-it-works" data-guide="airway" className="section-y overflow-clip border-t border-ink/[0.06] bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title={<>How an oral appliance <em>helps.</em></>} />
          <div className="mt-8 lg:mt-10">
            <AirwayModel />
          </div>
        </div>
      </section>

      {/* 5. What Beyonn gives your team */}
      <section id="gives" data-guide="gives" className="section-y bg-paper-2">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              index="04"
              eyebrow="What Beyonn gives your team"
              title={<>Choose the support <em>your practice needs.</em></>}
              lead="Your team can run the program with Beyonn training and tools. Practices needing more operational help can explore Beyonn's Done-for-You support. Both paths share the same clinical foundation."
            />
            <p data-aos="fade-up" className="rounded-full bg-ink px-6 py-3 font-semibold text-paper">Built around the way you work.</p>
          </div>
          <div className="mt-10">
            <SplitTable head={["Your team's job", "How Beyonn equips them"]} rows={teamRows} />
          </div>

          <div className="mt-14">
            <h3 data-aos="fade-up" className="t-h3">Want more hands on deck?</h3>
            <ul className="mt-5 grid gap-5 md:grid-cols-2">
              {supportPlans.map((c, i) => (
                <li key={c.title} data-aos="fade-up" data-aos-delay={i * 120}>
                  <Tilt className="h-full rounded-[var(--radius-card)]">
                  <Link href="/qualify#book" className="card group flex h-full flex-col gap-4 overflow-hidden bg-white p-4 sm:flex-row sm:items-center sm:gap-6 sm:pr-6">
                    <span className="relative block aspect-[5/3] w-full flex-none overflow-hidden rounded-lg sm:w-48">
                      <Image src={c.src} alt={c.alt} fill sizes="12rem" className="object-contain" />
                    </span>
                    <span className="min-w-0 flex-1 px-2 pb-2 sm:p-0">
                      <span className="block text-[0.95rem] leading-snug text-text/85">{c.text}</span>
                      <span className="mt-1.5 block text-sm font-semibold text-dawn-deep">{c.meta}</span>
                    </span>
                    <span className="hidden size-9 flex-none place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:translate-x-1 sm:grid">
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Link>
                  </Tilt>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[3.5fr_8.5fr]">
            <div data-aos="fade-up" className="lg:sticky lg:top-28 lg:self-start">
              <p className="t-eyebrow text-muted">At the core</p>
              <h3 className="mt-3 t-h2">The Coaching Clinician Blueprint</h3>
              <p className="mt-4 leading-relaxed text-muted">Twelve modules from the first new patient call to replacement appliances, plus the Forms Center, onboarding and ongoing coaching. When staff change, the system stays.</p>
              <div className="mt-5">
                <ArrowLink href="/academy">Explore Beyonn Academy</ArrowLink>
              </div>
            </div>
            <ol data-morph-shape="rect" className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink/10 sm:grid-cols-2 xl:grid-cols-4">
              {blueprintModules.map((m, i) => (
                <li key={m} data-aos="fade-up" data-aos-delay={(i % 4) * 60} className="flex min-h-[7rem] flex-col justify-between gap-3 bg-paper-2 p-5 transition-colors duration-500 hover:bg-paper">
                  <span className="font-mono text-sm text-dawn-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium leading-snug">{m}</span>
                </li>
              ))}
            </ol>
          </div>
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
      <section id="protocol" data-guide="protocol" className="section-y bg-paper">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading index="05" eyebrow="The Beyonn Protocol" title={<>One system. Four steps. <em>Run by your team.</em></>} />
            <Button href="/the-beyonn-system" variant="ghost">
              See the full Beyonn System
            </Button>
          </div>
          <div className="mt-12">
            <ProtocolRing />
          </div>
        </div>
      </section>

      {/* 7. The Beyonn Operating System */}
      <section id="platform" data-guide="platform" className="spotlight section-y relative overflow-hidden bg-ink text-paper">
        <div className="hero-glow absolute inset-0 opacity-30" aria-hidden />
        <div className="container-x relative">
          <SectionHeading
            tone="dark"
            align="center"
            eyebrow="The Beyonn Operating System"
            title={<>Every part of your program, <em className="text-breath">on one platform.</em></>}
            lead="Learning, patients, cases, tests, appliance orders, marketing and results."
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
      <section id="gain" data-guide="gain" className="section-y bg-paper">
        <div className="container-x">
          <SectionHeading index="07" eyebrow="What you gain" title={<>A program that pays you back <em>in every direction.</em></>} />
          <div className="mt-10 grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
            {gains.map((g, i) => {
              const big = i === 0;
              const span = ["md:col-span-3 md:row-span-2", "md:col-span-3", "md:col-span-3", "md:col-span-3", "md:col-span-3"][i];
              return (
                <div key={g.title} data-aos="fade-up" data-aos-delay={(i % 3) * 90} className={span}>
                  <Tilt className="h-full rounded-[var(--radius-panel)]" max={big ? 4 : 6}>
                    <div
                      className={cn(
                        "relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] p-7",
                        big ? "min-h-[19rem] bg-ink text-paper" : "border border-ink/10 bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]",
                      )}
                    >
                      {big && (
                        <div data-morph-shape="emblem" data-morph-hide className="pointer-events-none absolute -bottom-20 -right-24 aspect-[1600/1306] w-[26rem] bg-paper/[0.06] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" aria-hidden />
                      )}
                      <span className={cn("grid size-12 place-items-center rounded-xl", big ? "bg-paper/10 text-breath" : "bg-dawn/10 text-dawn")}>
                        <g.icon className="size-6" aria-hidden />
                      </span>
                      <h3 className={cn("relative font-display font-semibold tracking-tight", big ? "mt-auto pt-12 text-[clamp(1.7rem,2.6vw,2.4rem)]" : "mt-5 text-xl")}>{g.title}</h3>
                      <p className={cn("relative mt-2 leading-relaxed", big ? "max-w-md text-lg text-paper/75" : "text-[0.95rem] text-muted")}>{g.text}</p>
                    </div>
                  </Tilt>
                </div>
              );
            })}
          </div>
          <div className="mt-16">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h3 data-aos="fade-up" className="t-h2">
                Your growth path.
              </h3>
              <Button href="/qualify#book" variant="dark">
                Book a Discovery Call
              </Button>
            </div>
            <Ladder tiers={certificationTiers.home} />
          </div>
        </div>
      </section>

      {/* 9. Free workshop */}
      <section id="workshop" data-guide="workshop" className="spotlight section-y relative overflow-clip bg-night text-paper">
        <div className="container-x relative grid gap-14 lg:grid-cols-[6fr_6fr]">
          {/* Both columns are sticky: whichever is shorter holds while the other scrolls. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading tone="dark" index="08" eyebrow="Free workshop" title={<>See it live. <em className="text-breath">A free one-hour workshop</em> with Dr. Rodney Willey.</>} />
            <div data-aos="fade-up" className="mt-10">
              <h3 className="t-eyebrow text-paper/50">What you&apos;ll learn</h3>
              <CheckList
                className="mt-6 text-paper/85"
                items={[
                  "The missed opportunity of not offering OSA + TMD care in your practice",
                  "How to spot these patients in your chair",
                  "Why OSA and TMD must be treated together",
                  "How Beyonn trains your team to run the program",
                ]}
              />
            </div>
            <p data-aos="fade-up" className="mt-10 max-w-md leading-relaxed text-paper/65">Ask the team for the next live session date and joining details.</p>
          </div>
          <div data-morph-shape="rect" data-aos="fade-up" className="rounded-[var(--radius-panel)] border border-paper/10 bg-paper/[0.03] p-7 sm:p-10 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl" data-aos="reveal" data-aos-duration="1200" data-aos-delay="150"><Image src="/assets/people/rodney-hero.webp" alt="Dr. Rodney Willey" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain object-bottom" /></div>
            <h3 className="mt-8 t-h3">Join the next conversation.</h3>
            <p className="mt-3 text-paper/60">Online with Dr. Willey. The team will confirm the next date and access details.</p>
            <div className="mt-6"><Button href="mailto:info@beyonn.com?subject=Next%20Beyonn%20Workshop" variant="dawn">Ask for the next workshop</Button></div>
          </div>
        </div>
      </section>

      {/* 10. Recognition */}
      <section className="section-y bg-paper" aria-labelledby="recognized">
        <div className="container-x">
          <SectionHeading index="09" eyebrow="Credentials" title={<span id="recognized">Recognized by <em>the profession.</em></span>} />
          <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink/10 md:grid-cols-5">
            {credentials.map((c, i) => (
              <li key={c.k} data-aos="fade-up" data-aos-delay={i * 60} className="flex min-h-[10rem] flex-col justify-between bg-paper p-6">
                <CountUp value={c.k} className="font-display text-3xl font-semibold tracking-tight" />
                <span className="text-sm text-muted">{c.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11. Clinician endorsements */}
      <section id="stories" data-guide="stories" className="section-y overflow-clip bg-paper-2">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Clinical endorsements" title={<>The people behind <em>the perspective.</em></>} lead="Physicians, dentists, therapists and nurses who have worked with Dr. Willey." />
        </div>
        <div className="mt-6 lg:-mt-12">
          <EndorsementCarousel />
        </div>
        <div data-aos="fade-up" className="container-x mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">Summaries of endorsements published by Beyonn.</p>
          <ArrowLink href="/endorsements">Meet all {endorsements.length} endorsers</ArrowLink>
        </div>
      </section>

      {/* 12. Blogs and resources */}
      <section className="section-y bg-paper">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading index="11" eyebrow="Blogs and resources" title={<>Learn before <em>you leap.</em></>} />
            <ArrowLink href="/resources">All resources</ArrowLink>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {practitionerArticles.map((a, i) => (
              <Link key={a.slug} href={`/resources/${a.slug}`} data-aos="fade-up" data-aos-delay={i * 80} className="card card-hover group flex min-h-[20rem] flex-col justify-between bg-white/55 p-7">
                <span className="flex items-center justify-between t-eyebrow text-muted">
                  <span>For practitioners · {a.minutes} min</span>
                  <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </span>
                <span>
                  <span className="block t-h3">{a.title}</span>
                  <span className="mt-3 block leading-relaxed text-muted">{a.excerpt}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Quick answers */}
      <section className="section-y bg-paper pt-0">
        <div className="container-x grid gap-12 lg:grid-cols-[4fr_8fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Quick answers" title={<>Questions, <em>answered.</em></>} />
          </div>
          <QuickAnswers />
        </div>
      </section>

      {/* 15. Final: choose your path */}
      <div data-guide="cta">
        <PathSplit />
      </div>
    </>
  );
}
