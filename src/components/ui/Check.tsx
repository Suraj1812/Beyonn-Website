import { Check as CheckIcon, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function CheckList({ items, tone = "dawn", negative, className }: { items: React.ReactNode[]; tone?: "dawn" | "breath"; negative?: boolean; className?: string }) {
  return (
    <ul className={cn("grid gap-3.5", className)}>
      {items.map((item, i) => (
        <li key={i} data-aos="fade-up" data-aos-delay={Math.min(i * 70, 350)} className="flex gap-3.5 leading-relaxed">
          <span
            className={cn(
              "mt-0.5 grid size-6 flex-none place-items-center rounded-full",
              negative ? "bg-current/10" : tone === "dawn" ? "bg-dawn text-white" : "bg-breath text-ink",
            )}
            aria-hidden
          >
            {negative ? <X className="size-3.5" /> : <CheckIcon className="size-3.5" strokeWidth={2.6} />}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
