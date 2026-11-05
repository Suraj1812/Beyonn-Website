import { cn } from "@/lib/cn";

/** Short plain-text label above a headline. No pill, no dot. */
export function Eyebrow({ children, className, tone = "light" }: { children: React.ReactNode; className?: string; tone?: "light" | "dark" }) {
  return <span className={cn("inline-block t-eyebrow", tone === "dark" ? "text-breath" : "text-dawn", className)}>{children}</span>;
}
