"use client";

import { Localized } from "@/components/i18n/Localized";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useVisitor } from "@/components/providers/VisitorProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { practitionerQuickAnswers, patientQuickAnswers } from "@/content/faqs";
import { cn } from "@/lib/cn";

/** Home questions follow the selected audience; practitioners are the default. */
export function QuickAnswers() {
  const { visitor } = useVisitor();
  const audience = visitor === "patient" ? "patients" : "practitioners";
  return <Localized>{<AudienceAnswers key={audience} audience={audience} />}</Localized>;
}

function AudienceAnswers({ audience }: { audience: "patients" | "practitioners" }) {
  const [showAll, setShowAll] = useState(false);
  const previewCount = 4;
  const items = audience === "patients" ? patientQuickAnswers : practitionerQuickAnswers;
  return <Localized>{(
    <div data-aos="fade-up">
      <p className="t-eyebrow text-dawn-deep">{audience === "patients" ? "For Patients" : "For Practitioners"}</p>
      <div id="qa-panel" className="mt-4 border-t hairline">
        {[items.slice(0, previewCount), items.slice(previewCount)].map((group, index) => (
          <div key={index} id={index === 1 ? "qa-more" : undefined} className={cn(index === 1 && !showAll && "hidden")}>
            {group.map((item, i) => (
              <details key={item.q} className="acc animate-fade-up max-sm:[&>summary]:min-h-12 max-sm:[&>summary]:gap-2 max-sm:[&>summary]:py-2 max-sm:[&>summary]:text-sm" style={{ animationDelay: `${(i + index * previewCount) * 30}ms` }} name="qa">
                <summary>
                  <span>{item.q}</span>
                  <span className="acc__icon max-sm:size-7" aria-hidden>
                    <Plus className="size-4" />
                  </span>
                </summary>
                <div className="acc__body max-sm:text-sm">{item.a}</div>
              </details>
            ))}
          </div>
        ))}
      </div>
      {items.length > previewCount && (
        <button type="button" aria-expanded={showAll} aria-controls="qa-more" onClick={() => setShowAll(!showAll)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-paper-2 px-4 text-sm font-semibold text-dawn-deep">
          {showAll ? "Show fewer questions" : `See more (${items.length - previewCount})`}
          <ChevronDown className={cn("size-4 motion-safe:transition-transform", showAll && "rotate-180")} aria-hidden />
        </button>
      )}
      <div className="mt-4 sm:mt-8">
        {audience === "patients" ? <ArrowLink href="/patients#faq">More patient questions: For Patients</ArrowLink> : <ArrowLink href="/partner#faq">More practitioner questions: Partner With Us</ArrowLink>}
      </div>
    </div>
  )}</Localized>;
}
