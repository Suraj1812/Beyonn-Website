"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useVisitor } from "@/components/providers/VisitorProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { practitionerQuickAnswers, patientQuickAnswers } from "@/content/faqs";
import { cn } from "@/lib/cn";

/** Home §14: two tabs above the accordion; opens to match the visitor's choice. */
export function QuickAnswers() {
  const { visitor } = useVisitor();
  const [tab, setTab] = useState<"practitioners" | "patients">("practitioners");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the remembered visitor choice
    setTab(visitor === "patient" ? "patients" : "practitioners");
    setShowAll(false);
  }, [visitor]);

  const previewCount = 4;
  const items = tab === "patients" ? patientQuickAnswers : practitionerQuickAnswers;
  return (
    <div data-aos="fade-up">
      <div role="tablist" aria-label="Quick answers audience" className="inline-flex rounded-full bg-ink/5 p-1 max-sm:grid max-sm:grid-cols-2">
        {(["practitioners", "patients"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            id={`qa-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="qa-panel"
            onClick={() => { setTab(t); setShowAll(false); }}
            className={cn("rounded-full px-3 py-2.5 sm:px-5 text-sm font-semibold transition-colors duration-300", tab === t ? "bg-ink text-paper" : "text-muted hover:text-text")}
          >
            For {t === "practitioners" ? "Practitioners" : "Patients"}
          </button>
        ))}
      </div>
      <div id="qa-panel" role="tabpanel" aria-labelledby={`qa-tab-${tab}`} className="mt-4 border-t hairline sm:mt-8" key={tab}>
        {[items.slice(0, previewCount), items.slice(previewCount)].map((group, index) => (
          <div key={index} id={index === 1 ? "qa-more" : undefined} className={cn(index === 1 && !showAll && "hidden sm:block")}>
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
        <button type="button" aria-expanded={showAll} aria-controls="qa-more" onClick={() => setShowAll(!showAll)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-paper-2 px-4 text-sm font-semibold text-dawn-deep sm:hidden">
          {showAll ? "Show fewer questions" : `Show ${items.length - previewCount} more questions`}
          <ChevronDown className={cn("size-4 motion-safe:transition-transform", showAll && "rotate-180")} aria-hidden />
        </button>
      )}
      <div className="mt-4 sm:mt-8">
        {tab === "patients" ? <ArrowLink href="/patients#faq">More patient questions: For Patients</ArrowLink> : <ArrowLink href="/partner#faq">More practitioner questions: Partner With Us</ArrowLink>}
      </div>
    </div>
  );
}
