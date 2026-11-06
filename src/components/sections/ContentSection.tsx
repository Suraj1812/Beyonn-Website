import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Action, Card, PageSection } from "@/content/pages";
import { team } from "@/content/team";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CheckList } from "@/components/ui/Check";
import { Faq } from "@/components/ui/Faq";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { SplitTable } from "@/components/sections/SplitTable";
import { QuoteBlock } from "@/components/sections/QuoteBlock";
import { Ladder, certificationTiers } from "@/components/sections/Ladder";
import { AppGet } from "@/components/interactive/AppGet";
import { PatientCheck } from "@/components/interactive/PatientCheck";
import { EndorsementCarousel } from "@/components/interactive/EndorsementCarousel";
import { MailtoForm, type MailtoField } from "@/components/interactive/MailtoForm";
import { Parallax } from "@/components/visual/Parallax";
import { Tilt } from "@/components/visual/Tilt";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

const SIGN_IN_URL = "https://www.beyonn.com/sign-in";

const registerFields: MailtoField[] = [
  { name: "name", label: "Name", required: true, autoComplete: "name" },
  { name: "country", label: "Country", required: true, autoComplete: "country-name" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "practice", label: "Practice name", autoComplete: "organization" },
  { name: "role", label: "Role" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
];

const referralFields: MailtoField[] = [
  { name: "name", label: "Name", required: true, autoComplete: "name" },
  { name: "zip", label: "ZIP", required: true, autoComplete: "postal-code" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "symptoms", label: "Symptoms", type: "textarea" },
];

export const discoveryFields: MailtoField[] = [
  { name: "name", label: "Name", required: true, autoComplete: "name" },
  { name: "practice", label: "Practice", required: true, autoComplete: "organization" },
  { name: "role", label: "Role" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "time", label: "Best time", wide: true },
];

const countries = [
  { flag: "🇦🇪", name: "United Arab Emirates" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇪🇹", name: "Ethiopia" },
];

/** A page button: Patient App actions open the store / QR dialog, the rest are links. */
export function ActionButton({ action, fallback = "dawn" }: { action: Action; fallback?: NonNullable<Action["variant"]> }) {
  const variant = action.variant ?? fallback;
  if (action.app) return <AppGet label={action.label} screen={action.app} variant={variant} />;
  return (
    <Button href={action.href ?? "/"} variant={variant}>
      {action.label}
    </Button>
  );
}

const paragraphs = (body?: string | string[]) => (body ? (Array.isArray(body) ? body : [body]) : []);

function Body({ body, dark, className }: { body?: string | string[]; dark?: boolean; className?: string }) {
  const items = paragraphs(body);
  if (!items.length) return null;
  return (
    <div className={cn("max-w-2xl space-y-5", className)}>
      {items.map((p) => (
        <p key={p} data-aos="fade-up" className={cn("t-lead", dark ? "text-paper/75" : "text-muted")}>
          {p}
        </p>
      ))}
    </div>
  );
}

function Header({ section, dark }: { section: PageSection; dark?: boolean }) {
  const eyebrow = section.eyebrow && section.eyebrow !== section.title ? section.eyebrow : undefined;
  if (section.title) return <SectionHeading eyebrow={eyebrow} title={section.title} tone={dark ? "dark" : "light"} />;
  if (eyebrow)
    return (
      <div data-aos="fade-up">
        <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>
      </div>
    );
  return null;
}

const colClass = (n: number) => (n >= 5 ? "sm:grid-cols-2 lg:grid-cols-3" : n === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : n === 3 ? "md:grid-cols-3" : "md:grid-cols-2");

function Cards({ cards }: { cards: Card[] }) {
  const letters = cards.every((c) => c.label && c.label.length === 1);
  return (
    <ul data-morph-shape="rect" className={cn("grid gap-4", colClass(cards.length))}>
      {cards.map((c, i) => (
        <li key={`${c.label ?? ""}${c.title ?? c.text}`} data-aos="fade-up" data-aos-delay={Math.min(i * 70, 280)}>
          <Tilt className="h-full rounded-[var(--radius-card)]" max={5}>
            <div className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-ink/10 bg-white p-6 shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]">
              {letters && <span className="font-display text-5xl font-bold leading-none text-dawn">{c.label}</span>}
              {c.title && <h3 className="text-lg font-semibold leading-snug">{c.title}</h3>}
              {c.text && <p className="leading-relaxed text-text/80">{c.text}</p>}
            </div>
          </Tilt>
        </li>
      ))}
    </ul>
  );
}

function Columns({ columns }: { columns: NonNullable<PageSection["columns"]> }) {
  return (
    <div data-morph-shape="rect" className={cn("grid gap-4", colClass(columns.length))}>
      {columns.map((col, i) => (
        <div key={col.title} data-aos="fade-up" data-aos-delay={i * 80} className={cn("rounded-[var(--radius-card)] border border-ink/10 p-6 sm:p-7", col.negative ? "bg-paper-2" : "bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]")}>
          <h3 className="t-h3">{col.title}</h3>
          <CheckList items={col.items} negative={col.negative} className="mt-5" />
        </div>
      ))}
    </div>
  );
}

function Steps({ steps }: { steps: Card[] }) {
  const cols = steps.length === 6 ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" : steps.length === 5 ? "sm:grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <ol data-morph-shape="rect" className={cn("grid gap-4", cols)}>
      {steps.map((s, i) => (
        <li key={s.title ?? s.text} data-aos="fade-up" data-aos-delay={Math.min(i * 80, 400)} className="relative flex flex-col gap-3 rounded-[var(--radius-card)] border border-ink/10 bg-white p-6 shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]">
          <span className="grid size-10 place-items-center rounded-full bg-dawn font-display text-sm font-bold text-white">{i + 1}</span>
          {s.title && <h3 className="text-lg font-semibold leading-snug">{s.title}</h3>}
          {s.text && <p className="leading-relaxed text-text/80">{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

function Table({ table }: { table: NonNullable<PageSection["table"]> }) {
  const { head, rows, variant = "compare" } = table;

  if (variant === "arrow") {
    return (
      <div data-morph-shape="rect" className="overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white">
        <div className="hidden grid-cols-[1fr_auto_1fr] gap-6 bg-paper-2/60 px-6 py-3.5 t-eyebrow text-muted md:grid">
          <span>{head[0]}</span>
          <span className="w-6" aria-hidden />
          <span>{head[1]}</span>
        </div>
        {rows.map(([a, b], i) => (
          <div key={a} data-aos="fade-up" data-aos-delay={Math.min(i * 50, 300)} className="grid items-center gap-2 border-t border-ink/8 px-6 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <p className="font-semibold leading-relaxed">{a}</p>
            <ArrowRight className="size-6 rotate-90 text-breath-deep md:rotate-0" aria-hidden />
            <p className="leading-relaxed text-text/80">{b}</p>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "matrix") {
    const cols = head.length - 1;
    return (
      <div data-morph-shape="rect" className="overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white">
        {/* Wide screens: a real grid with a header row */}
        <div className="hidden md:block">
          <div className="grid gap-6 bg-paper-2/60 px-6 py-4" style={{ gridTemplateColumns: `minmax(8rem,0.7fr) repeat(${cols}, minmax(0,1fr))` }}>
            {head.map((h, i) => (
              <span key={`${h}${i}`} className={cn("font-semibold", i > 0 && "text-dawn-deep")}>
                {h}
              </span>
            ))}
          </div>
          {rows.map((row, r) => (
            <div key={row[0]} data-aos="fade-up" data-aos-delay={r * 80} className="grid gap-6 border-t border-ink/8 px-6 py-5" style={{ gridTemplateColumns: `minmax(8rem,0.7fr) repeat(${cols}, minmax(0,1fr))` }}>
              {row.map((cell, i) => (
                <p key={`${i}${cell}`} className={cn("leading-relaxed", i === 0 ? "t-eyebrow pt-1 text-muted" : "text-text/85")}>
                  {cell}
                </p>
              ))}
            </div>
          ))}
        </div>
        {/* Phones: one block per column */}
        <div className="divide-y divide-ink/8 md:hidden">
          {head.slice(1).map((h, c) => (
            <div key={h} className="px-5 py-5">
              <h3 className="font-semibold text-dawn-deep">{h}</h3>
              <dl className="mt-3 space-y-3">
                {rows.map((row) => (
                  <div key={row[0]}>
                    <dt className="t-eyebrow text-muted">{row[0]}</dt>
                    <dd className="mt-1 leading-relaxed">{row[c + 1]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length > 1) {
    return (
      <div data-morph-shape="rect">
        <SplitTable head={[head[0], head[1]]} rows={rows.map(([a, b]) => [a, b] as [string, string])} />
      </div>
    );
  }

  const [a, b] = rows[0];
  return (
    <div data-morph-shape="rect" className="grid overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white md:grid-cols-2">
      <div className="p-6">
        <p className="t-eyebrow text-muted">{head[0]}</p>
        <p className="mt-2 font-semibold leading-relaxed">{a}</p>
      </div>
      <div className="border-t border-ink/8 bg-paper-2/50 p-6 md:border-l md:border-t-0">
        <p className="t-eyebrow text-dawn-deep">{head[1]}</p>
        <p className="mt-2 leading-relaxed">{b}</p>
      </div>
    </div>
  );
}

function Stats({ stats }: { stats: NonNullable<PageSection["stats"]> }) {
  return (
    <dl data-morph-shape="rect" className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.value} data-aos="fade-up" data-aos-delay={i * 80} className="flex flex-col gap-2 bg-white p-6 sm:p-7">
          <dt className="order-2 leading-relaxed text-muted">{s.label}</dt>
          <dd className="order-1 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-none tracking-tight text-ink">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Aside({ aside }: { aside: NonNullable<PageSection["aside"]> }) {
  return (
    <div data-aos="fade-up" className="rounded-[var(--radius-card)] border border-ink/10 bg-white p-6 sm:p-8">
      <h3 className="t-h3">{aside.title}</h3>
      <ul className="mt-5 space-y-3.5">
        {aside.items.map((item, i) => (
          <li key={item} className="leading-relaxed">
            <span className="flex gap-3">
              <span className="mt-2.5 size-1.5 flex-none rounded-full bg-dawn" aria-hidden />
              <span>{item}</span>
            </span>
            {aside.nested && aside.nested.after === i && (
              <ul className="ml-4 mt-3 flex flex-wrap gap-2">
                {aside.nested.items.map((n) => (
                  <li key={n} className="rounded-full border border-ink/15 bg-paper-2 px-3.5 py-1.5 text-sm">
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamGrid() {
  return (
    <div data-morph-shape="rect" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {team.map((person, i) => (
        <div key={person.name} data-aos="fade-up" data-aos-delay={(i % 5) * 70}>
          <Tilt className="h-full rounded-[var(--radius-card)]">
            <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]">
              <div className="relative aspect-[4/5] bg-breath/40">
                <Image src={person.image} alt={person.name} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw" className="object-contain object-bottom" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold leading-snug">{person.name}</h3>
                {person.role && <p className="mt-2 text-sm text-muted">{person.role}</p>}
                {person.href && (
                  <div className="mt-auto pt-4">
                    <ArrowLink href={person.href.url} className="text-sm">
                      {person.href.label}
                    </ArrowLink>
                  </div>
                )}
              </div>
            </article>
          </Tilt>
        </div>
      ))}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-morph-shape="rect" data-aos="fade-up" className={cn("rounded-[var(--radius-panel)] border border-ink/10 bg-white p-6 shadow-[0_30px_60px_-40px_rgb(19_37_62/0.45)] sm:p-10", className)}>
      {children}
    </div>
  );
}

function Widget({ section }: { section: PageSection }) {
  switch (section.widget) {
    case "team":
      return <TeamGrid />;
    case "ladder":
      return <Ladder tiers={certificationTiers.academy} tone="dark" />;
    case "testimonials":
      return <EndorsementCarousel />;
    case "countries":
      return (
        <div data-morph-shape="rect" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c, i) => (
            <div key={c.name} data-aos="fade-up" data-aos-delay={i * 60} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-ink/10 bg-white px-5 py-4">
              <span className="text-3xl leading-none" aria-hidden>
                {c.flag}
              </span>
              <span className="font-semibold">{c.name}</span>
            </div>
          ))}
          <a href="#register" data-aos="fade-up" data-aos-delay={countries.length * 60} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-dawn/50 bg-dawn/[0.06] px-5 py-4 font-semibold text-dawn-deep transition-colors hover:bg-dawn/10">
            Your country next? Register your interest.
          </a>
        </div>
      );
    case "register-form":
      return (
        <Panel className="max-w-3xl">
          <MailtoForm fields={registerFields} subject="Beyonn Global: Register your interest" submitLabel="Register Your Interest" confirmation="Thank you. Our international team will contact you about availability in your country." />
        </Panel>
      );
    case "referral-form":
      return (
        <Panel className="max-w-3xl">
          <MailtoForm fields={referralFields} subject="Request a Referral" submitLabel="Request a Referral" />
        </Panel>
      );
    case "app-download":
      return (
        <div className="space-y-10">
          <div data-aos="fade-up" className="flex flex-wrap gap-3">
            <AppGet label="App Store" variant="light" />
            <AppGet label="Google Play" variant="ghost-light" />
          </div>
          <div data-aos="fade-up" className="flex flex-wrap items-center gap-5 border-t border-paper/15 pt-8">
            <p className="t-lead text-paper/80">Want the app for your patients? Become a Beyonn Network Partner.</p>
            <Button href="/qualify" variant="dawn">
              Book Your Discovery Call
            </Button>
          </div>
        </div>
      );
    case "portal-signin":
    case "partner-signin":
      return (
        <Panel className="mx-auto max-w-xl text-center">
          <Button href={SIGN_IN_URL} variant="dawn">
            Sign In
          </Button>
          {section.widget === "portal-signin" && (
            <>
              <p className="mt-6 text-sm text-muted">Your information is protected and handled in line with HIPAA.</p>
              <p className="mt-3 text-sm text-muted">
                Trouble signing in? Call{" "}
                <a className="font-semibold text-text underline" href={site.phoneHref}>
                  {site.phone}
                </a>{" "}
                or email{" "}
                <a className="font-semibold text-text underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            </>
          )}
        </Panel>
      );
    default:
      return null;
  }
}

/** One content section, composed from whichever blocks the approved copy calls for. */
export function ContentSection({ section, index }: { section: PageSection; index: number }) {
  if (section.widget === "quick-check") return <PatientCheck />;

  const dark = section.dark;
  const tone = dark ? "spotlight relative overflow-hidden bg-ink text-paper" : index % 2 === 0 ? "bg-paper" : "bg-paper-2";
  const hasHeader = Boolean(section.title || section.eyebrow);

  // Statement band: large lines on navy, revealed one after another.
  if (dark && section.lines && !section.title) {
    return (
      <section id={section.id} className={cn("section-y scroll-mt-24", tone)}>
        <div className="container-x">
          <Header section={section} dark />
          <div className="mt-10 max-w-5xl space-y-4">
            {section.lines.map((line, i) => (
              <p key={line} data-aos="fade-up" data-aos-delay={i * 260} className={cn("font-display text-[clamp(1.6rem,3.4vw,3rem)] font-semibold leading-[1.15] tracking-tight", i === section.lines!.length - 1 && "text-breath")}>
                {line}
              </p>
            ))}
          </div>
          <Body body={section.body} dark className="mt-10" />
        </div>
      </section>
    );
  }

  if (section.faq) {
    return (
      <section id={section.id} className={cn("section-y scroll-mt-24", tone)}>
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Header section={section} />
          </div>
          <Faq items={section.faq} />
        </div>
      </section>
    );
  }

  const list = section.list && <CheckList items={section.list} tone={dark ? "breath" : "dawn"} className="max-w-3xl" />;
  const intro = (
    <>
      <Header section={section} dark={dark} />
      {!section.bodyAfter && <Body body={section.body} dark={dark} className={hasHeader ? "mt-7" : ""} />}
      {section.tagline && (
        <p data-aos="fade-up" className={cn("mt-6 font-display text-lg font-semibold", dark ? "text-breath" : "text-dawn-deep")}>
          {section.tagline}
        </p>
      )}
      {list && <div className="mt-8">{list}</div>}
      {section.bodyAfter && <Body body={section.body} dark={dark} className="mt-8" />}
    </>
  );

  const blocks = (
    <>
      {section.points && <FeatureCards points={section.points} className={section.points.length > 3 ? "sm:grid-cols-2" : ""} />}
      {section.cards && <Cards cards={section.cards} />}
      {section.columns && <Columns columns={section.columns} />}
      {section.steps && <Steps steps={section.steps} />}
      {section.table && <Table table={section.table} />}
      {section.stats && <Stats stats={section.stats} />}
      {section.aside && <Aside aside={section.aside} />}
      {section.callout && (
        <div data-morph-shape="rect" data-aos="fade-up" className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="t-lead">{section.callout.text}</p>
          <ActionButton action={section.callout.action} />
        </div>
      )}
      {section.quote && (
        <div data-morph-shape="rect" className={cn("rounded-[var(--radius-panel)] p-6 sm:p-12", dark ? "" : "bg-ink text-paper")}>
          <QuoteBlock quote={section.quote.text} cite={section.quote.cite} tone="dark" />
        </div>
      )}
      {section.pull && (
        <p data-aos="fade-up" className="max-w-4xl font-display text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-dawn-deep">
          {section.pull}
        </p>
      )}
      {section.widget && <Widget section={section} />}
      {section.lines?.map((line) => (
        <p key={line} data-aos="fade-up" className={cn("max-w-3xl font-display text-[clamp(1.15rem,1.8vw,1.45rem)] font-semibold leading-snug", dark ? "text-paper" : "text-ink")}>
          {line}
        </p>
      ))}
      {section.links && (
        <div data-aos="fade-up" className="flex flex-wrap gap-6">
          {section.links.map((l) => (
            <ArrowLink key={l.label} href={l.href ?? "/"}>
              {l.label}
            </ArrowLink>
          ))}
        </div>
      )}
    </>
  );

  if (section.image) {
    return (
      <section id={section.id} className={cn("section-y scroll-mt-24", tone)}>
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <div className={index % 2 === 1 ? "lg:order-2" : ""}>{intro}</div>
          <Parallax speed={0.05} className={index % 2 === 1 ? "lg:order-1" : ""}>
            <Tilt className="rounded-[var(--radius-panel)]" max={4}>
              <div data-morph-shape="rect" data-aos="reveal" data-aos-duration="1200" className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2 shadow-[0_30px_60px_-38px_rgb(19_37_62/0.55)]">
                <Image src={section.image} alt={section.imageAlt ?? section.title ?? ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
              </div>
            </Tilt>
          </Parallax>
        </div>
        <div className="container-x mt-12 space-y-8 empty:hidden">{blocks}</div>
      </section>
    );
  }

  // Copy only: a light statement panel.
  const copyOnly = !section.list && !section.aside && !section.callout && !section.points && !section.cards && !section.columns && !section.steps && !section.table && !section.stats && !section.quote && !section.pull && !section.widget && !section.lines && !section.links;
  if (copyOnly && !dark) {
    return (
      <section id={section.id} className={cn("section-y scroll-mt-24", tone)}>
        <div className="container-x">
          <div data-morph-shape="rect" className={`relative isolate overflow-hidden rounded-[var(--radius-panel)] border border-ink/10 px-6 py-14 sm:px-14 sm:py-20 ${index % 2 === 0 ? "bg-paper-2" : "bg-white"}`}>
            <div className="pointer-events-none absolute -bottom-24 -right-20 -z-10 aspect-[1600/1306] w-[30rem] bg-dawn/[0.08] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[40rem]" aria-hidden />
            {intro}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={section.id} className={cn("section-y scroll-mt-24", tone)}>
      <div className="container-x">
        {hasHeader || section.body ? <div>{intro}</div> : list}
        <div className={cn("space-y-8", (hasHeader || section.body) && "mt-12")}>{blocks}</div>
      </div>
    </section>
  );
}
