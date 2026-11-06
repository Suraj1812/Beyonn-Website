"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export type MailtoField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  autoComplete?: string;
  wide?: boolean;
};

/**
 * Form with visible labels that submits by opening an email to the Beyonn team
 * with every field in the body. There is no form backend, so nothing is stored
 * or sent by the website itself.
 */
export function MailtoForm({
  fields,
  subject,
  submitLabel,
  confirmation,
  tone = "light",
  className,
}: {
  fields: MailtoField[];
  subject: string;
  submitLabel: string;
  confirmation?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = fields.map((f) => `${f.label}: ${String(data.get(f.name) ?? "").trim()}`).join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const dark = tone === "dark";
  const input = cn(
    "w-full rounded-xl border px-4 py-3 outline-none transition-colors",
    dark ? "border-paper/15 bg-paper/[0.06] text-paper focus:border-breath" : "border-ink/15 bg-white text-text focus:border-dawn",
  );

  return (
    <form onSubmit={submit} className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {fields.map((f) => (
        <label key={f.name} className={cn("grid gap-1.5", (f.wide || f.type === "textarea") && "sm:col-span-2")}>
          <span className={cn("text-sm font-medium", dark ? "text-paper/80" : "text-text/80")}>
            {f.label}
          </span>
          {f.type === "textarea" ? (
            <textarea name={f.name} required={f.required} rows={4} className={input} />
          ) : (
            <input name={f.name} type={f.type ?? "text"} required={f.required} autoComplete={f.autoComplete} className={input} />
          )}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn--dawn">
          <span>{submitLabel}</span>
        </button>
        {sent && confirmation && (
          <p role="status" className={cn("mt-4", dark ? "text-paper/80" : "text-text/80")}>
            {confirmation}
          </p>
        )}
      </div>
    </form>
  );
}
