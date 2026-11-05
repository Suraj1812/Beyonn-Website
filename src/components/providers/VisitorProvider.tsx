"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Visitor = "practitioner" | "patient" | null;
const KEY = "beyonn:visitor";

const Ctx = createContext<{ visitor: Visitor; setVisitor: (v: Visitor) => void }>({ visitor: null, setVisitor: () => {} });
export const useVisitor = () => useContext(Ctx);

/** Remembers whether the visitor chose the practitioner or patient path (doc §2). */
export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const [visitor, setState] = useState<Visitor>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
      if (v === "practitioner" || v === "patient") setState(v);
    } catch {}
  }, []);

  const setVisitor = useCallback((v: Visitor) => {
    setState(v);
    try {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch {}
  }, []);

  return <Ctx.Provider value={{ visitor, setVisitor }}>{children}</Ctx.Provider>;
}
