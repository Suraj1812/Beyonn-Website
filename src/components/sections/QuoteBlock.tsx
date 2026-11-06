import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export const willeyQuote = "Don't treat an airway without understanding the joint. Don't treat the joint without understanding the airway.";

export function QuoteBlock({ quote = willeyQuote, cite = "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA", footer, tone = "dark" }: { quote?: string; cite?: string; footer?: ReactNode; tone?: "dark" | "light" }) {
  return (
    <figure className="mx-auto max-w-4xl text-center">
      <div>
        <blockquote data-aos="fade-up" className="relative font-display text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.2] tracking-[-0.015em]">
          <span className="mx-auto mb-2 block font-display text-7xl leading-none text-dawn" aria-hidden>&ldquo;</span>
          {quote}
        </blockquote>
        <figcaption data-aos="fade-up" data-aos-delay="80" className={cn("mt-6 t-eyebrow", tone === "dark" ? "text-paper/55" : "text-muted")}>
          {cite}
        </figcaption>
        {footer && (
          <div data-aos="fade-up" data-aos-delay="140" className="mt-8">
            {footer}
          </div>
        )}
      </div>
    </figure>
  );
}
