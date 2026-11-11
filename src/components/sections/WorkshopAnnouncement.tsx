"use client";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

const registrationUrl = "https://go.beyonn.com/dental-sleep-medicine-webinar?utm_source=website&utm_medium=homepage&utm_campaign=ws-1dec&utm_content=top-bar";

export function WorkshopAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside aria-label="Upcoming workshop" className="border-b border-ink/10 bg-[#a7dfd2] text-night">
      <div className="container-x relative grid items-center gap-x-5 gap-y-3 py-4 pr-12 sm:grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] lg:py-3">
        <span className="w-fit rounded-full bg-ink px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-white sm:col-span-2 lg:col-span-1">Free live workshop</span>
        <p className="text-sm font-semibold leading-snug lg:text-[0.92rem]">OSA + TMD Workshop with Dr. Rod Willey · Tue 1 Dec · 9 AM or 7 PM CT</p>
        <a href={registrationUrl} className="inline-flex min-h-11 w-fit items-center justify-center gap-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-night focus-visible:outline-offset-4">Reserve my seat<ArrowRight className="size-4" aria-hidden /></a>
        <button type="button" aria-label="Dismiss workshop announcement" onClick={() => setDismissed(true)} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/10 sm:top-1/2 sm:-translate-y-1/2"><X className="size-4" aria-hidden /></button>
      </div>
    </aside>
  );
}
