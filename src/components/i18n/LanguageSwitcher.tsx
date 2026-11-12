"use client";

import { Languages, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { languages, type Language } from "@/lib/i18n/languages";
import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { language, deviceLanguage, selectLanguage, useDeviceLanguage, loading, error, retry, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLSelectElement>(null);
  const id = useId();
  const current = languages.find((item) => item.code === language)!;

  useEffect(() => {
    if (!open) return;
    picker.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0" translate="no" data-language-switcher="" onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} data-language-trigger="" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id} aria-label={`${t("Language")}: ${current.name}`} className="flex min-h-11 items-center gap-1.5 rounded-full border border-ink/15 px-3 text-sm font-medium hover:bg-ink/[0.06]">
        <Languages className="size-4" aria-hidden />
        <span className="hidden 2xl:inline" lang={language}>{current.name}</span>
        <span className="uppercase 2xl:hidden">{language}</span>
      </button>
      {open && (
        <section id={id} aria-label={t("Choose your language")} className="absolute end-0 top-full z-[80] mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-ink/15 bg-paper p-4 text-ink shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <label htmlFor={`${id}-select`} className="font-semibold">{t("Choose your language")}</label>
            <button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-ink/5"><X className="size-4" aria-hidden /></button>
          </div>
          <select ref={picker} id={`${id}-select`} value={language} onChange={(event) => selectLanguage(event.target.value as Language)} className="min-h-11 w-full rounded-lg border border-ink/25 bg-white px-3 text-base text-ink">
            {languages.map((item) => <option key={item.code} value={item.code} lang={item.code}>{item.name} · {item.english}</option>)}
          </select>
          <div className="mt-3 flex flex-wrap gap-2">
            {language !== "en" && <button type="button" onClick={() => selectLanguage("en")} className="min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-white">English</button>}
            {deviceLanguage !== "en" && language !== deviceLanguage && <button type="button" onClick={() => selectLanguage(deviceLanguage)} className="min-h-11 rounded-full border border-ink/20 px-4 text-sm font-medium" lang={deviceLanguage}>{languages.find((item) => item.code === deviceLanguage)?.name}</button>}
            <button type="button" onClick={useDeviceLanguage} className="min-h-11 rounded-full border border-ink/20 px-4 text-sm font-medium">{t("Use device language")}</button>
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">{loading ? t("Loading translation…") : error ? t("Translation could not be loaded. Please try again.") : ""}</p>
          {error && <button type="button" onClick={retry} className="mt-1 min-h-11 text-sm font-semibold underline">{t("Retry")}</button>}
        </section>
      )}
    </div>
  );
}
