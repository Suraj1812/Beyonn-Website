"use client";
import { createDefaultDocument, type Json } from "@/lib/cms/model";
import { pageSection } from "./ControlUi";
const collectionTemplates = createDefaultDocument().data;
const arrayTemplates: Record<string, Json> = {
  sections: pageSection,
  actions: { label: "Learn more", href: "/contact" },
  links: { label: "Learn more", href: "/contact" },
  faq: { q: "Your question?", a: "Your answer." },
  cards: { title: "Card heading", text: "Your supporting text" },
  columns: { title: "Column heading", items: ["Your first item"] },
  steps: { title: "Step heading", text: "Explain this step" },
  stats: { value: "100+", label: "Your statistic" },
  rows: ["Feature", "Benefit"],
  body: "Your paragraph.",
};
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
export const human = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
function blank(value: Json): Json {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, blank(v)]),
    );
  return "";
}
export function FieldEditor({
  value,
  onChange,
  name = "Content",
  depth = 0,
  template = collectionTemplates[name],
}: {
  value: Json;
  onChange: (next: Json) => void;
  name?: string;
  depth?: number;
  template?: Json;
}) {
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  if (typeof value === "boolean")
    return (
      <label className="ctl-toggle">
        <span>{human(name)}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="ctl-switch" />
      </label>
    );
  if (name === "widget" && typeof value === "string")
    return (
      <label className="ctl-field">
        <span>Interactive component</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {[
            "airway-model",
            "discovery-booking",
            "founder-video",
            "walkthrough-video",
            "patient-video",
            "patient-stories",
            "patient-blogs",
            "app-preview",
            "workshop-preview",
            "quick-check",
            "team",
            "team-mission",
            "academy-curriculum",
            "ladder",
            "testimonials",
            "register-form",
            "referral-form",
            "app-download",
            "countries",
            "portal-signin",
            "partner-signin",
          ].map((w) => (
            <option key={w} value={w}>
              {human(w)}
            </option>
          ))}
        </select>
      </label>
    );
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null
  ) {
    const text = value ?? "";
    const isLong =
      typeof text === "string" &&
      (text.length > 95 ||
        /^(body|description|excerpt|sub|text|a|p)$/i.test(name));
    return (
      <label className="ctl-field">
        <span>{human(name)}</span>
        {isLong ? (
          <textarea
            rows={Math.min(7, Math.max(3, Math.ceil(String(text).length / 90)))}
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type={typeof text === "number" ? "number" : "text"}
            value={text}
            onChange={(e) =>
              onChange(
                typeof text === "number"
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
          />
        )}
      </label>
    );
  }
  if (Array.isArray(value)) {
    const move = (i: number, step: number) => {
      const next = [...value];
      [next[i], next[i + step]] = [next[i + step], next[i]];
      onChange(next);
    };
    return (
      <div className="ctl-array">
        <div className="ctl-array-title">
          <strong>
            {human(name)} <span className="ctl-count">{value.length}</span>
          </strong>
          <button
            className="ctl-button ctl-small"
            onClick={() =>
              onChange([
                ...value,
                value.length
                  ? blank(value[0])
                  : structuredClone(
                      Array.isArray(template) && template.length
                        ? template[0]
                        : (arrayTemplates[name] ?? "Your new item"),
                    ),
              ])
            }
          >
            <Plus size={14} />
            Add item
          </button>
        </div>
        {value.map((item, i) => (
          <details
            key={i}
            className="ctl-details"
            open={typeof item !== "object" || item === null ? true : undefined}
          >
            <summary>
              {typeof item === "object" && item && !Array.isArray(item)
                ? String(
                    item.title ||
                      item.label ||
                      item.name ||
                      item.q ||
                      `Item ${i + 1}`,
                  )
                : `Item ${i + 1}`}
            </summary>
            <div className="ctl-details-body">
              <FieldEditor
                value={item}
                template={Array.isArray(template) ? template[0] : undefined}
                name={
                  typeof item === "object"
                    ? "Fields"
                    : `${human(name)} ${i + 1}`
                }
                depth={depth + 1}
                onChange={(next) =>
                  onChange(value.map((v, j) => (i === j ? next : v)))
                }
              />
              <div className="ctl-item-tools">
                <button
                  aria-label={`Move item ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  aria-label={`Move item ${i + 1} down`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  aria-label={`Duplicate item ${i + 1}`}
                  onClick={() =>
                    onChange([
                      ...value.slice(0, i + 1),
                      structuredClone(item),
                      ...value.slice(i + 1),
                    ])
                  }
                >
                  <Copy size={15} />
                </button>
                <button
                  aria-label={`Delete item ${i + 1}`}
                  className="ctl-danger-text"
                  onClick={() => setPendingDelete(i)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {pendingDelete === i && (
                <div className="ctl-confirm-inline">
                  Remove this item from the draft?
                  <button
                    onClick={() => {
                      onChange(value.filter((_, j) => j !== i));
                      setPendingDelete(null);
                    }}
                  >
                    Remove item
                  </button>
                  <button onClick={() => setPendingDelete(null)}>
                    Keep item
                  </button>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    );
  }
  const extras: Record<string, Json> = {
    enabled: true,
    dark: false,
    image: "/assets/site/staff-onboarding.jpg",
    imageAlt: "Beyonn team working together",
    points: ["Your first point"],
    list: ["Your first list item"],
    cards: [{ title: "Card heading", text: "Your supporting text" }],
    columns: [{ title: "Column heading", items: ["Your first item"] }],
    table: {
      head: ["Feature", "Benefit"],
      rows: [["Your feature", "Your benefit"]],
      variant: "compare",
    },
    steps: [{ title: "Step heading", text: "Explain this step" }],
    stats: [{ value: "100+", label: "Your statistic" }],
    quote: { text: "Your quotation", cite: "Author" },
    pull: "A statement worth remembering.",
    aside: { title: "Worth knowing", items: ["A useful detail"] },
    callout: {
      text: "Take the next step",
      action: { label: "Get in touch", href: "/contact" },
    },
    tagline: "Your supporting line.",
    lines: ["A short supporting line"],
    links: [{ label: "Learn more", href: "/contact" }],
    faq: [{ q: "Your question?", a: "Your answer." }],
    widget: "team",
  };
  const isSection =
    !("sections" in value) &&
    "title" in value &&
    ("body" in value || "id" in value);
  return (
    <div className={depth === 0 ? "ctl-fields" : "ctl-fields ctl-nested"}>
      {Object.entries(value).map(([key, child]) =>
        typeof child === "object" && child !== null ? (
          <details
            className="ctl-details"
            key={key}
            open={
              depth === 0 && Object.keys(value).length < 5 ? true : undefined
            }
          >
            <summary>
              {human(key)}
              {Array.isArray(child) && (
                <span className="ctl-count">{child.length}</span>
              )}
            </summary>
            <div className="ctl-details-body">
              <FieldEditor
                name={key}
                value={child}
                template={
                  template &&
                  !Array.isArray(template) &&
                  typeof template === "object"
                    ? template[key]
                    : undefined
                }
                depth={depth + 1}
                onChange={(v) => onChange({ ...value, [key]: v })}
              />
            </div>
          </details>
        ) : (
          <FieldEditor
            key={key}
            name={key}
            value={child}
            template={
              template &&
              !Array.isArray(template) &&
              typeof template === "object"
                ? template[key]
                : undefined
            }
            depth={depth + 1}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ),
      )}
      {isSection && (
        <label className="ctl-field">
          <span>Add a content block</span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value)
                onChange({
                  ...value,
                  [e.target.value]: structuredClone(extras[e.target.value]),
                });
            }}
          >
            <option value="">Choose a field or component…</option>
            {Object.keys(extras)
              .filter((key) => !(key in value))
              .map((key) => (
                <option key={key} value={key}>
                  {human(key)}
                </option>
              ))}
          </select>
        </label>
      )}
    </div>
  );
}
