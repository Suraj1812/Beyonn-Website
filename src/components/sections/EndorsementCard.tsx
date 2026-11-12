import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";
import { endorsementSource, type Endorsement } from "@/content/endorsements";
import { cn } from "@/lib/cn";

const tones = ["bg-breath", "bg-dawn", "bg-dawn-soft", "bg-[#b9c7d9]"];

/** Quote on top, portrait rising out of a coloured semicircle below (as on beyonn.com). */
export function EndorsementCard({ person, index, className }: { person: Endorsement; index: number; className?: string }) {
  return <Localized>{(
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] bg-white ring-1 ring-ink/10 shadow-[0_20px_44px_-36px_rgb(19_37_62/0.55)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-36px_rgb(19_37_62/0.6)]", className)}>
      <div className="flex flex-1 flex-col p-4 sm:p-7 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-display text-4xl sm:text-5xl leading-[0.7] text-breath" aria-hidden>
            &ldquo;
          </span>
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-semibold text-dawn">{person.field}</span>
        </div>
        <blockquote cite={endorsementSource} className="mt-2 text-sm leading-relaxed text-text sm:mt-3 sm:text-[1.05rem]">
          <p>{person.text}</p>
        </blockquote>
        <div className="mt-auto pt-3 max-sm:min-h-[4.25rem] max-sm:pl-[3.5rem] sm:pt-6">
          <p className="font-display font-semibold leading-snug max-sm:text-sm">{person.name}</p>
          <p className="mt-0.5 text-xs leading-snug sm:text-sm text-muted">{[person.role, person.practice, person.location].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="overflow-hidden max-sm:absolute max-sm:bottom-4 max-sm:left-4 max-sm:size-11 max-sm:rounded-full max-sm:bg-paper-2 sm:relative sm:mt-2 sm:h-56">
        <div className={cn("absolute -bottom-36 left-1/2 max-sm:bottom-0 max-sm:w-full aspect-square w-[85%] -translate-x-1/2 rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105", tones[index % tones.length])} aria-hidden />
        <div className="absolute inset-x-0 bottom-0 top-0 transition-transform sm:top-2 duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5">
          <Image src={person.image} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 21rem, 44px" className="object-contain object-bottom" />
        </div>
      </div>
    </article>
  )}</Localized>;
}
