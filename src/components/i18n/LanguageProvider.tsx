"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LocalizedMetadata } from "./LocalizedMetadata";
import { detectLanguage, direction, LANGUAGE_STORAGE_KEY, supportedLanguage, translateText, type Catalog, type Language } from "@/lib/i18n/languages";

const catalogs = new Map<Language, Catalog>([["en", {}]]);
const pending = new Map<Language, Promise<Catalog>>();
const Context = createContext({
  language: "en" as Language,
  deviceLanguage: "en" as Language,
  catalog: {} as Catalog,
  loading: false,
  error: false,
  selectLanguage: (() => {}) as (language: Language, remember?: boolean) => void,
  useDeviceLanguage: (): void => {},
  retry: (): void => {},
  t: (text: string) => text,
});

async function loadCatalog(language: Language): Promise<Catalog> {
  const cached = catalogs.get(language);
  if (cached) return cached;
  let request = pending.get(language);
  if (!request) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    request = fetch(`/locales/${language}.json`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Translation unavailable");
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data) ||
        !("Language" in data) || typeof data.Language !== "string" || !data.Language.trim() ||
        !Object.values(data).every((v) => typeof v === "string" && v.trim())) throw new Error("Invalid translation catalog");
      const catalog = Object.assign(Object.create(null), data) as Catalog;
      catalogs.set(language, catalog);
      return catalog;
    }).finally(() => {
      window.clearTimeout(timeout);
      pending.delete(language);
    });
    pending.set(language, request);
  }
  return request;
}

export const useLanguage = () => useContext(Context);

/** Translations are local assets; no text or form values are sent to a translation service. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [deviceLanguage, setDeviceLanguage] = useState<Language>("en");
  const [catalog, setCatalog] = useState<Catalog>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sequence = useRef(0);
  const requested = useRef<{ language: Language; remember: boolean }>({ language: "en", remember: false });

  const selectLanguage = useCallback(async (next: Language, remember = true) => {
    if (!supportedLanguage(next)) return;
    const request = ++sequence.current;
    requested.current = { language: next, remember };
    setLoading(true);
    setError(false);
    try {
      const nextCatalog = await loadCatalog(next);
      if (request !== sequence.current) return;
      setCatalog(nextCatalog);
      setLanguage(next);
      document.documentElement.lang = next;
      document.documentElement.dir = direction(next);
      if (remember) {
        try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch {}
      }
    } catch {
      if (request === sequence.current) setError(true);
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, []);

  const useDeviceLanguage = useCallback(() => {
    try { localStorage.removeItem(LANGUAGE_STORAGE_KEY); } catch {}
    void selectLanguage(detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]), false);
  }, [selectLanguage]);

  useEffect(() => {
    const sync = () => {
      const detected = detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]);
      setDeviceLanguage(detected);
      let saved: Language | undefined;
      try { saved = supportedLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)); } catch {}
      void selectLanguage(saved ?? detected, false);
    };
    sync();
    window.addEventListener("languagechange", sync);
    const storage = (event: StorageEvent) => { if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) sync(); };
    window.addEventListener("storage", storage);
    return () => {
      sequence.current += 1;
      window.removeEventListener("languagechange", sync);
      window.removeEventListener("storage", storage);
    };
  }, [selectLanguage]);

  const t = useCallback((text: string) => translateText(text, catalog), [catalog]);
  return <Context.Provider value={{ language, deviceLanguage, catalog, loading, error, selectLanguage, useDeviceLanguage, retry: () => { void selectLanguage(requested.current.language, requested.current.remember); }, t }}><LocalizedMetadata />{children}</Context.Provider>;
}
