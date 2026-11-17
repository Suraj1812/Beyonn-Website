"use client";

import { Localized } from "@/components/i18n/Localized";
import type { PageSection } from "@/content/pages";

/** Keep the mission statement and its explanation together in one reading column. */
export function TeamMission({ section }: { section: PageSection }) {
  return <Localized>{(
    <section data-team-mission aria-labelledby="team-mission-heading" className="bg-paper py-10 text-ink sm:py-12">
      <div className="container-x">
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)] lg:gap-12">
          <div data-aos="fade-up" className="flex items-center gap-3 self-start lg:pt-2">
            <span className="h-px w-8 shrink-0 bg-breath-deep" aria-hidden />
            <p className="t-eyebrow text-dawn-deep">{section.eyebrow}</p>
          </div>
          <div className="max-w-4xl border-s-2 border-breath/70 ps-5 sm:ps-8">
            <h2 id="team-mission-heading" data-aos="fade-up" data-aos-delay="60" className="max-w-[28ch] font-display text-[clamp(1.8rem,3.1vw,2.8rem)] font-semibold leading-[1.15] tracking-tight">
              {section.title}
            </h2>
            <p data-aos="fade-up" data-aos-delay="120" className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted sm:text-lg">
              {section.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  )}</Localized>;
}

// Prevent parent boundaries from translating this component before it renders.
TeamMission.cmsLocalizedBoundary = true;
