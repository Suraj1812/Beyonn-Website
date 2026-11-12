"use client";

import { Localized } from "@/components/i18n/Localized";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

/** Native <dialog> with focus trapping, Esc to close and scroll lock. */
export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lenis?.stop();
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) lenis?.start();
  }, [open, lenis]);

  return <Localized>{(
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"} rounded-[var(--radius-panel)] bg-paper p-0 text-text shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-fade-up`}
    >
      <div className="relative max-h-[85svh] overflow-y-auto p-7 sm:p-10" data-lenis-prevent>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-ink/5 hover:bg-ink/10" aria-label="Close">
          <X className="size-5" aria-hidden />
        </button>
        {children}
      </div>
    </dialog>
  )}</Localized>;
}
