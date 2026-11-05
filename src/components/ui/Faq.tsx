import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export type FaqItem = { q: string; a: ReactNode };

/** Accessible accordion built on native <details>; works without JavaScript. */
export function Faq({ items, name }: { items: FaqItem[]; name?: string }) {
  return (
    <div className="border-t hairline">
      {items.map((item, i) => (
        <details key={item.q} className="acc" name={name} data-aos="fade-up" data-aos-delay={Math.min(i * 40, 240)}>
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
  );
}
