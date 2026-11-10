import { cn } from "@/lib/cn";

export type PreviewField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  wide?: boolean;
};

/** Shows the proposed form without collecting or submitting information. */
export function FormPreview({ fields, submitLabel, tone = "light" }: {
  fields: PreviewField[];
  submitLabel: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const input = cn(
    "w-full cursor-not-allowed rounded-xl border px-4 py-3",
    dark ? "border-paper/15 bg-paper/[0.06]" : "border-ink/15 bg-paper-2",
  );

  return (
    <fieldset disabled className="grid min-w-0 gap-4 sm:grid-cols-2">
      <legend className={cn("mb-4 text-sm font-semibold", dark ? "text-breath" : "text-dawn-deep")}>Online submissions coming soon</legend>
      {fields.map(({ name, label, type, wide }) => (
        <label key={name} className={cn("grid gap-1.5 text-sm font-medium", (wide || type === "textarea") && "sm:col-span-2")}>
          {label}
          {type === "textarea" ? <textarea name={name} rows={4} className={input} /> : <input name={name} type={type ?? "text"} className={input} />}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button type="button" className="btn btn--dawn cursor-not-allowed opacity-60">{submitLabel}</button>
      </div>
    </fieldset>
  );
}
