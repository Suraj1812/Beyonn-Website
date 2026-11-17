import type { Json } from "@/lib/cms/model";
import type { ReactNode } from "react";
export type Confirmation = { title: string; body: string; action: () => void };
export const dateLabel = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
export const pageSection: Json = {
  id: "new-section",
  eyebrow: "A new chapter",
  title: "Your section heading",
  body: "Share something meaningful with your visitors.",
  enabled: true,
};
export function Panel({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="ctl-panel">
      {title && (
        <div className="ctl-panel-heading">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
