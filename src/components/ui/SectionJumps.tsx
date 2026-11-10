import { ArrowDown, MoveHorizontal } from "lucide-react";

export function SectionJumps({ links }: { links: { id: string; label: string }[] }) {
  if (links.length < 2) return null;

  return (
    <nav aria-label="On this page" className="border-b border-ink/10 bg-paper-2 md:hidden">
      <div className="container-x flex items-center justify-between pt-4">
        <p className="t-eyebrow text-muted">On this page</p>
        <MoveHorizontal className="size-4 text-dawn-deep" aria-hidden />
      </div>
      <ul className="flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-3 pt-2 [scroll-padding-inline:var(--gutter)]">
        {links.map(({ id, label }) => (
          <li key={id} className="flex-none snap-start">
            <a href={`#${id}`} className="flex min-h-11 items-center gap-2 rounded-full border border-ink/12 bg-white px-4 text-sm font-semibold text-ink transition-colors active:bg-dawn/10 focus-visible:-outline-offset-2">
              {label}
              <ArrowDown className="size-3.5 text-dawn-deep" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
