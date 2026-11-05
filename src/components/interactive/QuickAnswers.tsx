"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useVisitor } from "@/components/providers/VisitorProvider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { practitionerQuickAnswers, patientQuickAnswers } from "@/content/faqs";
import { cn } from "@/lib/cn";

/** Home §14: two tabs above the accordion; opens to match the visitor's choice. */
export function QuickAnswers() {
  const { visitor } = useVisitor();
  const [tab, setTab] = useState<"practitioners" | "patients">("practitioners");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the remembered visitor choice
  useEffect(() => setTab(visitor === "patient" ? "patients" : "practitioners"), [visitor]);

  const items = tab === "patients" ? patientQuickAnswers : practitionerQuickAnswers;
  return (
    <div data-aos="fade-up">
      <div role="tablist" aria-label="Quick answers audience" className="inline-flex rounded-full bg-ink/5 p-1">
        {(["practitioners", "patients"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            id={`qa-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="qa-panel"
            onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300", tab === t ? "bg-ink text-paper" : "text-muted hover:text-text")}
          >
            For {t === "practitioners" ? "Practitioners" : "Patients"}
          </button>
        ))}
      </div>
      <div id="qa-panel" role="tabpanel" aria-labelledby={`qa-tab-${tab}`} className="mt-8 border-t hairline" key={tab}>
        {items.map((item, i) => (
          <details key={item.q} className="acc animate-fade-up" style={{ animationDelay: `${i * 30}ms` }} name="qa">
            <summary>
              <span>{item.q}</span>
              <span className="acc__icon" aria-hidden>
                <Plus className="size-4" />
              </span>
            </summary>
            <div className="acc__body">{item.a}</div>
          </details>
        ))}
      </div>
      <div className="mt-8">
        {tab === "patients" ? <ArrowLink href="/patients#faq">More patient questions: For Patients</ArrowLink> : <ArrowLink href="/partner#faq">More practitioner questions: Partner With Us</ArrowLink>}
      </div>
    </div>
  );
}
