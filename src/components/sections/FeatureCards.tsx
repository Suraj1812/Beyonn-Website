import { Tilt } from "@/components/visual/Tilt";
import { cn } from "@/lib/cn";

/** Numbered point cards with a gentle 3D tilt, used across content pages. */
export function FeatureCards({ points, className }: { points: string[]; className?: string }) {
  return (
    <ul data-morph-shape="rect" className={cn("grid gap-4", className)}>
      {points.map((point, i) => (
        <li key={point} data-aos="fade-up" data-aos-delay={Math.min(i * 70, 280)}>
          <Tilt className="h-full rounded-[var(--radius-card)]" max={5}>
            <div className="flex h-full gap-4 rounded-[var(--radius-card)] border border-ink/10 bg-white p-5 shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)] sm:p-6">
              <span className="grid size-9 flex-none place-items-center rounded-lg bg-dawn/10 font-display text-sm font-bold text-dawn">{String(i + 1).padStart(2, "0")}</span>
              <p className="pt-1 leading-relaxed text-text/90">{point}</p>
            </div>
          </Tilt>
        </li>
      ))}
    </ul>
  );
}
