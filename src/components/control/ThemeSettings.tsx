"use client";
import type { CmsDocument } from "@/lib/cms/model";
import { defaultTheme, type Theme } from "@/lib/cms/model";
import { ShieldCheck } from "lucide-react";
import { Panel, type Confirmation } from "./ControlUi";
import { human } from "./FieldEditor";

export function ThemeSettings({
  document,
  update,
  setConfirm,
}: {
  document: CmsDocument;
  update: (next: CmsDocument) => void;
  setConfirm: (next: Confirmation) => void;
}) {
  function setTheme<K extends keyof Theme>(key: K, value: Theme[K]) {
    update({ ...document, theme: { ...document.theme, [key]: value } });
  }
  return (
    <div className="ctl-design-grid">
      <div className="ctl-stack">
        <Panel title="Brand & surfaces">
          <div className="ctl-color-grid">
            {(
              [
                "primary",
                "secondary",
                "accent",
                "background",
                "surface",
                "text",
                "heading",
                "muted",
                "headerBackground",
                "footerBackground",
              ] as const
            ).map((key) => (
              <label key={key} className="ctl-color">
                <input
                  type="color"
                  value={document.theme[key]}
                  onChange={(e) => setTheme(key, e.target.value)}
                />
                <span>
                  <strong>{human(key)}</strong>
                  <small>{document.theme[key].toUpperCase()}</small>
                </span>
              </label>
            ))}
          </div>
        </Panel>
        <Panel title="Hero background gradient">
          <label className="ctl-toggle">
            <span>Use a gradient in page heroes</span>
            <input
              type="checkbox"
              checked={document.theme.gradient?.enabled ?? false}
              onChange={(event) =>
                setTheme("gradient", {
                  from: document.theme.secondary,
                  to: "#13253e",
                  angle: 135,
                  ...document.theme.gradient,
                  enabled: event.target.checked,
                })
              }
            />
            <span className="ctl-switch" />
          </label>
          <div className="ctl-color-grid" style={{ marginTop: 18 }}>
            {(["from", "to"] as const).map((key) => (
              <label className="ctl-color" key={key}>
                <input
                  type="color"
                  aria-label={`Gradient ${key} color`}
                  value={
                    document.theme.gradient?.[key] ??
                    (key === "from" ? document.theme.secondary : "#13253e")
                  }
                  onChange={(event) =>
                    setTheme("gradient", {
                      enabled: true,
                      from: document.theme.secondary,
                      to: "#13253e",
                      angle: 135,
                      ...document.theme.gradient,
                      [key]: event.target.value,
                    })
                  }
                />
                <span>
                  <strong>{human(key)} color</strong>
                </span>
              </label>
            ))}
          </div>
          <label className="ctl-range">
            <span>
              Gradient angle
              <strong>{document.theme.gradient?.angle ?? 135}°</strong>
            </span>
            <input
              type="range"
              min="0"
              max="360"
              value={document.theme.gradient?.angle ?? 135}
              onChange={(event) =>
                setTheme("gradient", {
                  enabled: true,
                  from: document.theme.secondary,
                  to: "#13253e",
                  ...document.theme.gradient,
                  angle: Number(event.target.value),
                })
              }
            />
          </label>
        </Panel>
        <Panel title="Typography & detail">
          <div className="ctl-form-grid">
            {(["bodyFont", "headingFont"] as const).map((key) => (
              <label className="ctl-field" key={key}>
                <span>{human(key)}</span>
                <select
                  value={document.theme[key]}
                  onChange={(e) => setTheme(key, e.target.value)}
                >
                  {["Inter", "Montserrat", "Georgia", "system-ui"].map(
                    (font) => (
                      <option key={font}>{font}</option>
                    ),
                  )}
                </select>
              </label>
            ))}
          </div>
          {(
            [
              {
                key: "fontSize",
                min: 14,
                max: 20,
                label: "Base font size",
              },
              {
                key: "radius",
                min: 0,
                max: 32,
                label: "Card & panel corners",
              },
              {
                key: "buttonRadius",
                min: 0,
                max: 999,
                label: "Button corners",
              },
              {
                key: "spacing",
                min: 40,
                max: 120,
                label: "Section spacing",
              },
              {
                key: "buttonPadding",
                min: 12,
                max: 32,
                label: "Button padding",
              },
            ] as const
          ).map(({ key, min, max, label }) => (
            <label className="ctl-range" key={key}>
              <span>
                {label}
                <strong>{document.theme[key]} px</strong>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                value={document.theme[key]}
                onChange={(e) => setTheme(key, Number(e.target.value))}
              />
            </label>
          ))}
          <label className="ctl-toggle">
            <span>Soft shadows</span>
            <input
              type="checkbox"
              checked={document.theme.shadow}
              onChange={(e) => setTheme("shadow", e.target.checked)}
            />
            <span className="ctl-switch" />
          </label>
        </Panel>
        <button
          className="ctl-button"
          onClick={() =>
            setConfirm({
              title: "Restore the Beyonn theme?",
              body: "Your draft theme will return to the original website colors, type and spacing.",
              action: () => update({ ...document, theme: { ...defaultTheme } }),
            })
          }
        >
          Restore brand defaults
        </button>
      </div>
      <div className="ctl-theme-preview">
        <span className="ctl-mini-label">LIVE STYLE PREVIEW</span>
        <div
          style={{
            background: document.theme.background,
            color: document.theme.text,
            borderRadius: document.theme.radius,
            boxShadow: document.theme.shadow ? "0 20px 50px #13253e15" : "none",
            fontFamily:
              document.theme.bodyFont === "Georgia"
                ? "Georgia,serif"
                : "var(--font-inter),sans-serif",
            padding: 28,
          }}
        >
          <span
            style={{
              color: document.theme.primary,
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            THE BEYONN DIFFERENCE
          </span>
          <h2
            style={{
              color: document.theme.heading,
              fontFamily:
                document.theme.headingFont === "Georgia"
                  ? "Georgia,serif"
                  : "var(--font-montserrat),sans-serif",
              fontSize: document.theme.fontSize * 1.8,
              margin: "20px 0",
              lineHeight: 1.2,
            }}
          >
            Beyond expectations.
            <br />
            Built around you.
          </h2>
          <p
            style={{
              color: document.theme.muted,
              lineHeight: 1.7,
              fontSize: document.theme.fontSize,
            }}
          >
            A thoughtful system. A confident team. A better experience for every
            patient.
          </p>
          <button
            style={{
              marginTop: 24,
              padding: `12px ${document.theme.buttonPadding}px`,
              background: document.theme.primary,
              color: "#fff",
              borderRadius: document.theme.buttonRadius,
            }}
          >
            Discover Beyonn →
          </button>
          <div
            style={{
              background: document.theme.gradient?.enabled
                ? `linear-gradient(${document.theme.gradient.angle}deg,${document.theme.gradient.from},${document.theme.gradient.to})`
                : document.theme.secondary,
              color: document.theme.accent,
              padding: 20,
              borderRadius: document.theme.radius,
              marginTop: 30,
            }}
          >
            <ShieldCheck size={22} />
            <strong style={{ display: "block", marginTop: 12 }}>
              Care that goes beyond.
            </strong>
          </div>
        </div>
        <p className="ctl-help">
          Use Preview to see your full website on desktop, tablet and mobile.
        </p>
      </div>
    </div>
  );
}
