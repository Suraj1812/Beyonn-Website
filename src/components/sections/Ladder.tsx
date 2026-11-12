import { Localized } from "@/components/i18n/Localized";
import { Tilt } from "@/components/visual/Tilt";
import { cn } from "@/lib/cn";

export type Tier = { name: string; level: string; text: string };

export const certificationTiers = {
  home: [
    { name: "Certified Provider", level: "Foundation", text: "Trained, certified and listed in the directory." },
    { name: "Advanced Provider", level: "Growth", text: "More complex cases and higher placement in patient routing." },
    { name: "Centre of Excellence", level: "Elite", text: "Beyonn's top tier, featured first to patients in your area." },
  ],
  academy: [
    { name: "Certified Provider", level: "Foundation", text: "Complete the core training and get listed in the Beyonn provider directory." },
    { name: "Advanced Provider", level: "Growth", text: "Take on more complex cases and get higher placement when patients search." },
    { name: "Centre of Excellence", level: "Elite", text: "Beyonn's top tier, featured first to patients in your area." },
  ],
} satisfies Record<string, Tier[]>;

/** Growth path shown as an ascending ladder. */
export function Ladder({ tiers, tone = "light", compact = false }: { tiers: Tier[]; tone?: "light" | "dark"; compact?: boolean }) {
  return <Localized>{(
    <ol data-morph-shape="rect" className="grid gap-4 md:grid-cols-3">
      {tiers.map((t, i) => (
        <li key={t.name} data-aos="fade-up" data-aos-delay={i * 120} className="h-full">
          <Tilt className="h-full rounded-[var(--radius-card)]" max={5}>
            <div
              className={cn(
                "card relative flex h-full flex-col justify-between overflow-hidden p-7",
                compact && "max-md:p-4",
                tone === "dark" ? "bg-paper/[0.05]" : "bg-white",
              )}
            >
              <div
                data-aos="grow-up"
                data-aos-duration="1200"
                data-aos-delay={200 + i * 150}
                className="absolute inset-x-0 bottom-0 -z-0 bg-gradient-to-t from-dawn/30 to-transparent"
                style={{ height: `${35 + i * 25}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between">
                <span className="t-eyebrow opacity-60">Step 0{i + 1}</span>
                <span className="rounded-full bg-dawn px-3 py-1 text-xs font-semibold text-white">{t.level}</span>
              </div>
              <div className={cn("relative mt-6", compact && "max-md:mt-3")}>
                <h3 className="t-h3">{t.name}</h3>
                <p className={cn("mt-3 leading-relaxed opacity-70", compact && "max-md:mt-1 max-md:text-sm")}>{t.text}</p>
              </div>
            </div>
          </Tilt>
        </li>
      ))}
    </ol>
  )}</Localized>;
}
