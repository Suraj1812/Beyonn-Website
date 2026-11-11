import { Button } from "@/components/ui/Button";
import { workshopContent } from "@/content/workshop";
import { CalendarDays, Clock } from "lucide-react";

export function WorkshopSignup() {
  return (
    <div className="relative">
      <span className="inline-flex rounded-full bg-breath/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-breath ring-1 ring-breath/25">
        Free · Live online
      </span>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">Reserve your seat</h3>

      <div className="mt-4 grid gap-2 rounded-xl border border-paper/15 bg-paper/[0.05] p-4 text-sm text-paper/85">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4 flex-none text-breath" aria-hidden />
          <time dateTime="2026-12-01">Tuesday, December 1, 2026</time>
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 flex-none text-breath" aria-hidden />
          <span>
            <time dateTime="2026-12-01T09:00:00-06:00">9:00 AM</time> or{" "}
            <time dateTime="2026-12-01T19:00:00-06:00">7:00 PM</time> CST
          </span>
        </p>
      </div>

      <div className="mt-5"><Button href={workshopContent.registrationUrl} variant="dawn" className="w-full justify-between" target="_blank" rel="noopener noreferrer">{workshopContent.cta}</Button></div>
      <p className="mt-3 text-center text-xs leading-relaxed text-paper/60">{workshopContent.microcopy}</p>
    </div>
  );
}
