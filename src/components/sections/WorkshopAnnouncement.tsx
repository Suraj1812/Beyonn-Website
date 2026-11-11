"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, X } from "lucide-react";

const registrationUrl = "https://go.beyonn.com/dental-sleep-medicine-webinar?utm_source=website&utm_medium=homepage&utm_campaign=ws-1dec&utm_content=top-bar";

export function WorkshopAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside aria-label="Upcoming workshop" className="border-b border-dawn/15 bg-paper-2 text-ink">
      <div className="container-x grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-5">
        <span className="hidden size-11 items-center justify-center rounded-xl border border-dawn/15 bg-white text-dawn sm:flex" aria-hidden><CalendarDays className="size-5" /></span>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-dawn-deep">Free live workshop</p>
          <p className="mt-1 text-[0.82rem] font-semibold leading-relaxed lg:text-sm">OSA + TMD Workshop with Dr. Rod Willey · Tue 1 Dec · 9 AM or 7 PM CT</p>
        </div>
        <a href={registrationUrl} target="_blank" rel="noopener noreferrer" aria-label="Reserve my seat (opens in a new tab)" className="btn btn--dawn btn--sm col-span-2 justify-between sm:col-span-1 sm:justify-center">Reserve my seat<ArrowUpRight className="size-4" aria-hidden /></a>
        <button type="button" aria-label="Dismiss workshop announcement" onClick={() => setDismissed(true)} className="col-start-2 row-start-1 grid size-11 self-start place-items-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink sm:col-start-4 sm:self-center"><X className="size-4" aria-hidden /></button>
      </div>
    </aside>
  );
}
