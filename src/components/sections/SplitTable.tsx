import { cn } from "@/lib/cn";

/** Two-column comparison rows, e.g. "Your team's job" → "How Beyonn equips them". */
export function SplitTable({
  head,
  rows,
  tone = "light",
  highlightRight = true,
}: {
  head: [string, string];
  rows: [string, string][];
  tone?: "light" | "dark";
  highlightRight?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-card)] border", tone === "dark" ? "border-paper/12" : "border-ink/10 bg-white")}>
      <div className={cn("hidden grid-cols-[1fr_1.5fr] gap-8 px-6 py-3.5 t-eyebrow md:grid", tone === "dark" ? "bg-paper/[0.04] text-paper/55" : "bg-paper-2/60 text-muted")}>
        <span>{head[0]}</span>
        <span>{head[1]}</span>
      </div>
      {rows.map(([a, b], i) => (
        <div
          key={a}
          data-aos="fade-up"
          data-aos-delay={Math.min(i * 50, 300)}
          className={cn("grid gap-2 border-t px-6 py-4 md:grid-cols-[1fr_1.5fr] md:gap-8", tone === "dark" ? "border-paper/10" : "border-ink/8")}
        >
          <div className="flex items-start gap-3 font-semibold">
            <span className={cn("grid size-7 flex-none place-items-center rounded-full text-xs font-bold", tone === "dark" ? "bg-dawn text-white" : "bg-dawn/15 text-dawn-deep")}>{String(i + 1).padStart(2, "0")}</span>
            <span>{a}</span>
          </div>
          <p className={cn("leading-relaxed", highlightRight ? "" : "opacity-70", tone === "dark" ? "text-paper/75" : "text-text/80")}>
            <span className="t-eyebrow mr-2 opacity-50 md:hidden">{head[1]}:</span>
            {b}
          </p>
        </div>
      ))}
    </div>
  );
}
