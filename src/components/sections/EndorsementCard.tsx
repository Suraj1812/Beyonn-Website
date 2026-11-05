import Image from "next/image";
import type { Endorsement } from "@/content/endorsements";
import { cn } from "@/lib/cn";

const tones = ["bg-breath", "bg-dawn", "bg-dawn-soft", "bg-[#b9c7d9]"];

/** Quote on top, portrait rising out of a coloured semicircle below (as on beyonn.com). */
export function EndorsementCard({ person, index, className }: { person: Endorsement; index: number; className?: string }) {
  return (
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] bg-white ring-1 ring-ink/10 shadow-[0_20px_44px_-36px_rgb(19_37_62/0.55)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-36px_rgb(19_37_62/0.6)]", className)}>
      <div className="flex flex-1 flex-col p-6 pb-4 sm:p-7 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-display text-5xl leading-[0.7] text-breath" aria-hidden>
            &ldquo;
          </span>
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-semibold text-dawn">{person.field}</span>
        </div>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-text">{person.text}</p>
        <div className="mt-auto pt-6">
          <p className="font-display font-semibold leading-snug">{person.name}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted">{person.role}</p>
        </div>
      </div>
      <div className="relative mt-2 h-56 overflow-hidden">
        <div className={cn("absolute -bottom-36 left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105", tones[index % tones.length])} aria-hidden />
        <div className="absolute inset-x-0 bottom-0 top-2 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5">
          <Image src={person.image} alt={person.name} fill sizes="(min-width: 1024px) 24rem, 80vw" className="object-contain object-bottom" />
        </div>
      </div>
    </article>
  );
}
