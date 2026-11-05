import { Portrait } from "@/components/ui/Portrait";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export const willeyQuote = "Don't treat an airway without understanding the joint. Don't treat the joint without understanding the airway.";

export function QuoteBlock({ quote = willeyQuote, cite = "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA", footer, tone = "dark" }: { quote?: string; cite?: string; footer?: ReactNode; tone?: "dark" | "light" }) {
  return (
    <figure className={cn("grid items-center gap-10 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-16")}>
      <div data-aos="fade-right">
        <Portrait name="Dr. Rodney Willey" src="/assets/people/rodney-hero.webp" className="aspect-[4/5] w-40 md:w-full" tone="lilac" />
      </div>
      <div>
        <blockquote data-aos="fade-up" className="relative font-display text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.2] tracking-[-0.015em]">
          <span className="mb-2 block font-display text-7xl leading-none text-dawn" aria-hidden>&ldquo;</span>
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
