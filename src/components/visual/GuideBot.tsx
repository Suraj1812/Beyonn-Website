"use client";

import { Localized } from "@/components/i18n/Localized";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, X, ArrowUpRight } from "lucide-react";

export function GuideBot() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return <Localized>{(
    <div ref={root} className="fixed bottom-4 right-4 z-40">
      {open && <section id={id} aria-label="Beyonn guide" className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-ink/10 bg-white p-5 text-ink shadow-xl">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">We’re here to help.</h2><button type="button" aria-label="Close guide" className="grid size-11 place-items-center" onClick={() => { setOpen(false); button.current?.focus(); }}><X className="size-5" /></button></div>
        <p className="mt-1 text-sm text-muted">Choose your next step.</p>
        <nav aria-label="Beyonn guide shortcuts" className="mt-3 divide-y divide-ink/10">
          {[["Explore the program", "/the-beyonn-system"], ["Find patient care", "/patients"], ["Join a Workshop", "/workshop#register"], ["Contact the team", "/contact"]].map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between gap-3 text-sm font-medium">{label}<ArrowUpRight className="size-4" aria-hidden /></Link>)}
        </nav>
      </section>}
      <button ref={button} type="button" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={open ? "Close Beyonn guide" : "Open Beyonn guide"} onClick={() => setOpen(!open)} className="ml-auto flex min-h-12 items-center gap-2 rounded-full border border-paper/20 bg-ink px-4 text-sm font-medium text-white shadow-lg">
        <MessageCircle className="size-5 text-breath" aria-hidden /><span>{open ? "Close" : "We’re here to help."}</span>
      </button>
    </div>
  )}</Localized>;
}
