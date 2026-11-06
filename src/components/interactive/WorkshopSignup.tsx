"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock, Monitor } from "lucide-react";

const roles = ["Dentist", "ENT", "Sleep physician", "Nurse practitioner", "Practice team member", "Other"];

/** Text field with a label that rests inside the box and floats up on focus or input. */
function Field({ name, label, type = "text", required, autoComplete, className = "" }: { name: string; label: string; type?: string; required?: boolean; autoComplete?: string; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer h-14 w-full rounded-xl bg-paper/[0.05] px-4 pb-1.5 pt-5 text-[0.97rem] text-paper outline-none ring-1 ring-inset ring-paper/12 transition-[background-color,box-shadow] duration-200 hover:bg-paper/[0.07] focus:bg-paper/[0.08] focus:ring-2 focus:ring-breath/70 focus:shadow-[0_0_0_4px_rgb(114_207_183/0.12)]"
      />
      <span className="pointer-events-none absolute left-4 top-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-paper/50 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[0.68rem] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-breath">
        {label}
        {required && <span className="text-breath"> *</span>}
      </span>
    </label>
  );
}

/**
 * Home §9 workshop card: an event "ticket" (free, online, one hour, hosted by
 * Dr. Willey), the next-session details, and the doc's registration form (name,
 * email, mobile, role). There is no booking backend yet, so submitting opens an
 * email to the Beyonn team with the details filled in.
 */
export function WorkshopSignup() {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = [["Name", "name"], ["Email", "email"], ["Mobile", "mobile"], ["Role", "role"]].map(([label, k]) => `${label}: ${f.get(k) ?? ""}`).join("\n");
    window.location.href = `mailto:info@beyonn.com?subject=${encodeURIComponent("Free workshop seat request")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="relative">
      {/* Ticket header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-breath/12 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-breath ring-1 ring-breath/25">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-breath opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-breath" />
            </span>
            Free · Online · 60 min
          </span>
          <h3 className="mt-4 font-display text-[1.6rem] font-semibold leading-tight tracking-tight">Reserve your seat</h3>
        </div>
        <div className="flex flex-none items-center gap-3 rounded-full bg-paper/[0.05] py-1.5 pl-1.5 pr-4 ring-1 ring-paper/10">
          <span className="grid size-10 place-items-center rounded-full bg-[linear-gradient(160deg,var(--color-dawn),var(--color-breath))]" aria-hidden>
            <span className="block aspect-[1600/1306] w-6 bg-paper [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" />
          </span>
          <span className="hidden text-xs leading-tight sm:block">
            <span className="block text-paper/50">Hosted by</span>
            <span className="block font-semibold">Dr. Rodney Willey</span>
          </span>
        </div>
      </div>

      {/* Next session */}
      <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-dashed border-paper/15 py-4 text-sm">
        <div className="sr-only">Next session</div>
        {[
          { icon: CalendarDays, k: "Date", v: "Date to be announced" },
          { icon: Clock, k: "Time", v: "ET / CT / PT" },
          { icon: Monitor, k: "Where", v: "Online" },
        ].map(({ icon: Icon, k, v }, i) => (
          <div key={k} className="flex items-center gap-2">
            {i > 0 && <span className="mr-3 hidden h-4 w-px bg-paper/15 sm:block" aria-hidden />}
            <Icon className="size-4 text-breath" aria-hidden />
            <dt className="sr-only">{k}</dt>
            <dd className="text-paper/85">{v}</dd>
          </div>
        ))}
      </dl>

      {sent ? (
        <div className="mt-7 flex animate-fade-up items-start gap-4 rounded-2xl bg-breath/10 p-5 ring-1 ring-breath/25" role="status">
          <span className="grid size-10 flex-none place-items-center rounded-full bg-breath text-ink">
            <Check className="size-5" strokeWidth={3} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">You&apos;re nearly in.</p>
            <p className="mt-1 text-sm leading-relaxed text-paper/70">Your email app has opened with your details. Send it and the Beyonn team will confirm your seat and the joining link.</p>
            <button type="button" onClick={() => setSent(false)} className="mt-3 text-sm font-semibold text-breath hover:underline">
              Edit my details
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 grid gap-3 sm:grid-cols-2">
          <Field name="name" label="Name" required autoComplete="name" className="sm:col-span-2" />
          <Field name="email" label="Email" type="email" required autoComplete="email" />
          <Field name="mobile" label="Mobile" type="tel" autoComplete="tel" />

          <label className="relative block sm:col-span-2">
            <select
              name="role"
              required
              defaultValue=""
              className="peer h-14 w-full cursor-pointer appearance-none rounded-xl bg-paper/[0.05] px-4 pb-1.5 pt-5 pr-11 text-[0.97rem] text-paper outline-none ring-1 ring-inset ring-paper/12 transition-[background-color,box-shadow] duration-200 hover:bg-paper/[0.07] focus:bg-paper/[0.08] focus:ring-2 focus:ring-breath/70 focus:shadow-[0_0_0_4px_rgb(114_207_183/0.12)] invalid:text-paper/45"
            >
              <option value="" disabled>
                Choose your role
              </option>
              {roles.map((r) => (
                <option key={r} value={r} className="bg-night text-paper">
                  {r}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-4 top-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-paper/50 transition-colors peer-focus:text-breath">
              Role <span className="text-breath">*</span>
            </span>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-paper/55 transition-transform duration-200 peer-focus:rotate-180 peer-focus:text-breath" aria-hidden />
          </label>

          <button
            type="submit"
            className="group mt-3 inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-[linear-gradient(100deg,var(--color-dawn),#3f8fd6_55%,#4fb6a6)] font-semibold text-white shadow-[0_18px_40px_-18px_rgb(49_119_191/0.9)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-16px_rgb(49_119_191/1)] active:translate-y-0 sm:col-span-2"
          >
            Reserve My Free Seat
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </button>
          <p className="text-center text-xs text-paper/45 sm:col-span-2">Free, with no obligation. The team will email you the joining link.</p>
        </form>
      )}
    </div>
  );
}
