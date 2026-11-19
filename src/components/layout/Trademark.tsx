import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Keep the trademark attached to the wordmark, including during animations. */
export function Trademark({ children, className, light = false }: { children: ReactNode; className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex", className)} translate="no" style={{ alignItems: "flex-start", gap: 2, flexShrink: 0, color: light ? "#ffffff" : "#3177bf" }}>
      {children}
      <sup aria-hidden="true" style={{ position: "static", fontFamily: "Arial, sans-serif", fontSize: 9, fontWeight: 500, lineHeight: 1, flexShrink: 0 }}>™</sup>
    </span>
  );
}
