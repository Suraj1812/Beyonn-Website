"use client";
import { useCmsData } from "@/components/control/CmsProvider";
import { academyTiers as initial_academyTiers } from "@/content/academy";

import { Localized } from "@/components/i18n/Localized";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ChevronDown } from "lucide-react";

/** Native disclosure controls keep the full curriculum usable with keyboard and touch. */
export function AcademyCurriculum() {
  const academyTiers = useCmsData("academyTiers", initial_academyTiers);

  return <Localized>{(
    <div className="space-y-8">
      {academyTiers.map((tier) => (
        <article key={tier.id} id={`academy-tier-${tier.id}`} className="scroll-mt-28 overflow-hidden rounded-[var(--radius-panel)] border border-ink/10 bg-white">
          <header className="space-y-3 border-b border-ink/10 bg-paper-2 p-5 sm:p-8">
            <p className="t-eyebrow text-dawn-deep"><span>{tier.id}</span> · <span>{tier.level}</span></p>
            <h3 className="t-h3">{tier.title}</h3>
            <p className="font-medium">{tier.tagline}</p>
            <p className="max-w-3xl leading-relaxed text-muted">{tier.objective}</p>
            <p className="text-sm font-semibold text-dawn-deep">{tier.summary}</p>
          </header>
          <div className="divide-y divide-ink/10">
            {tier.units.map((unit) => (
              <details key={unit.id} className="group" open={unit.id.endsWith(".1")}>
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dawn sm:px-8 [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 font-mono text-sm text-dawn-deep">{unit.id}</span>
                  <h4 className="min-w-0 flex-1 font-semibold">{unit.title}</h4>
                  <ChevronDown aria-hidden className="size-5 shrink-0 text-dawn-deep motion-safe:transition-transform group-open:rotate-180" />
                </summary>
                <ul className="space-y-3 border-t border-ink/5 bg-paper-2/40 px-5 py-5 sm:px-8">
                  {unit.lessons.map((lesson) => (
                    <li key={lesson.reference} className="flex items-start gap-3 text-sm leading-relaxed sm:text-base">
                      <span translate="no" className="min-w-10 shrink-0 font-mono text-xs leading-6 text-muted">{lesson.reference}</span>
                      <span>{lesson.title}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {"completion" in tier && <p className="border-t border-ink/10 bg-breath/10 p-5 text-sm leading-relaxed sm:px-8">{tier.completion}</p>}
        </article>
      ))}
    </div>
  )}</Localized>;
}

/** Render the preview within its language boundary, including all tier cards. */
export function AcademyOverview() {
  const academyTiers = useCmsData("academyTiers", initial_academyTiers);

  return <Localized>{(
    <section id="blueprint" aria-labelledby="academy-curriculum-heading" className="mt-8 grid gap-6 rounded-[var(--radius-panel)] border border-dawn/20 border-t-4 border-t-dawn bg-white p-5 shadow-[0_20px_60px_-40px_rgb(19_37_62/0.35)] sm:mt-14 sm:gap-10 sm:p-8 lg:grid-cols-[3.5fr_8.5fr]">
      <div data-aos="fade-up" className="lg:sticky lg:top-28 lg:self-start">
        <p className="t-eyebrow text-muted max-sm:flex max-sm:items-center max-sm:gap-2 max-sm:text-dawn-deep max-sm:before:h-0.5 max-sm:before:w-5 max-sm:before:bg-dawn">Core training · Beyonn Academy</p>
        <h3 id="academy-curriculum-heading" className="mt-3 t-h2">Beyonn Academy</h3>
        <p className="mt-4 leading-relaxed text-muted">3 tiers, 14 learning units and 52 clinical videos, from foundations to advanced mastery.</p>
        <div className="mt-5"><ArrowLink href="/academy#blueprint">Explore the Academy</ArrowLink></div>
      </div>
      <ol data-morph-shape="rect" className="grid gap-4 md:grid-cols-3">
        {academyTiers.map((tier) => (
          <li key={tier.id} data-aos="fade-up" className="flex flex-col rounded-2xl border border-ink/10 bg-paper-2 p-5">
            <p className="t-eyebrow text-dawn-deep"><span>{tier.id}</span> · <span>{tier.level}</span></p>
            <h4 className="mt-3 text-lg font-semibold leading-snug">{tier.title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-muted">{tier.description}</p>
            <p className="mt-4 text-sm font-medium">{tier.summary}</p>
            <div className="mt-auto pt-5"><ArrowLink href={`/academy#academy-tier-${tier.id}`}>Explore this tier</ArrowLink></div>
          </li>
        ))}
      </ol>
    </section>
  )}</Localized>;
}

// Prevent parent boundaries from translating this component before it renders.
AcademyCurriculum.cmsLocalizedBoundary = true;
AcademyOverview.cmsLocalizedBoundary = true;
