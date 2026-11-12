import { Localized } from "@/components/i18n/Localized";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitWords } from "@/components/visual/SplitWords";
import { cn } from "@/lib/cn";

type Props = {
  /** Kept for API compatibility; section numbers are no longer shown. */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  tone?: "light" | "dark";
};

/** Section header: a friendly pill label, then the headline and an optional lead. */
export function SectionHeading({ eyebrow, title, lead, align = "left", className, as = "h2", tone = "light" }: Props) {
  const Tag = as;
  const muted = tone === "dark" ? "text-paper/70" : "text-muted";
  return <Localized>{(
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <div data-aos="fade-up" className="mb-4">
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <Tag data-aos="words" className="t-h2">
        <SplitWords>{title}</SplitWords>
      </Tag>
      {lead && (
        <div data-aos="fade-up" data-aos-delay="120" className={cn("mt-4 t-lead max-w-2xl", muted, align === "center" && "mx-auto")}>
          {lead}
        </div>
      )}
    </div>
  )}</Localized>;
}
