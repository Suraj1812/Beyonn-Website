import type { ReactNode } from "react";
import Image from "next/image";
import { Emblem3D } from "@/components/visual/Emblem3D";
import { ScrollExit } from "@/components/visual/ScrollExit";
import { Tilt } from "@/components/visual/Tilt";
import { cn } from "@/lib/cn";

export type Photo = {
  src: string;
  alt: string;
  /** `contain` = transparent square cut-out portrait; `cover` = regular 3:2 photo. */
  mode?: "contain" | "cover";
  /** Optional name card pinned to the photo. */
  caption?: { name: string; role: string };
};

type Props = {
  /** Kept for API compatibility; heroes no longer show a label above the headline. */
  eyebrow?: string;
  /** Visible label above the headline (used where the approved copy specifies one). */
  kicker?: string;
  title: ReactNode;
  /** Second headline under the H1. */
  headline?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  below?: ReactNode;
  size?: "full" | "page";
  photo?: Photo;
  visual?: ReactNode;
};

/**
 * Warm, light hero: copy on the left, a person (or a calm shape study) on the right.
 * Photos are always shown at their own aspect ratio, so nothing is cropped.
 */
export function PageHero({ kicker, title, headline, sub, actions, below, size = "page", photo, visual }: Props) {
  const full = size === "full";
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,var(--color-ink)_0%,var(--color-night)_100%)] text-paper [--scribble:var(--color-breath)]">
      <div className="pointer-events-none absolute -left-48 top-16 -z-10 size-[32rem] rounded-full bg-breath/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[36rem] rounded-full bg-dawn/25 blur-3xl" aria-hidden />

      <div
        className={cn(
          "container-x grid items-center gap-6 pb-8 pt-32 sm:gap-10 sm:pb-12 sm:pt-36 lg:gap-14 lg:pb-16 lg:pt-40",
          visual || photo?.mode === "cover" ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1.1fr_0.9fr]",
        )}
      >
        <ScrollExit y={70} fade className="max-w-[42rem]">
          {kicker && (
            <p className="mb-5 t-eyebrow text-breath animate-fade-up" style={{ animationDelay: "60ms" }}>
              {kicker}
            </p>
          )}
          <h1 className={cn("animate-fade-up", full ? "t-display" : "t-h1")} style={{ animationDelay: "120ms" }}>
            {title}
          </h1>
          {headline && (
            <p className="mt-6 max-w-[38rem] font-display text-[clamp(1.35rem,2.4vw,2rem)] font-semibold leading-snug animate-fade-up" style={{ animationDelay: "170ms" }}>
              {headline}
            </p>
          )}
          {sub && (
            <div className="mt-6 max-w-[35rem] t-lead text-paper/80 animate-fade-up" style={{ animationDelay: "220ms" }}>
              {sub}
            </div>
          )}
          {actions && (
            <div className="mt-6 flex flex-wrap gap-3 animate-fade-up max-sm:[&>.btn]:w-full max-sm:[&>.btn]:justify-between sm:mt-9" style={{ animationDelay: "320ms" }}>
              {actions}
            </div>
          )}
          {below && (
            <div className="mt-12 animate-fade-up" style={{ animationDelay: "440ms" }}>
              {below}
            </div>
          )}
        </ScrollExit>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <ScrollExit y={-40} shrink={0.05}>
            {visual ?? (photo ? photo.mode === "contain" ? <CutoutPortrait photo={photo} emblem="on-dark" emblem3d /> : <FramedPhoto photo={photo} /> : <EmblemStage />)}
          </ScrollExit>
        </div>
      </div>
    </section>
  );
}

function NameCard({ caption, className }: { caption: NonNullable<Photo["caption"]>; className?: string }) {
  return (
    <div style={{ animationDelay: "950ms" }} className={cn("absolute z-10 animate-fade-up rounded-xl bg-white px-4 py-3 text-ink shadow-[0_18px_40px_-20px_rgb(19_37_62/0.45)] ring-1 ring-ink/[0.06]", className)}>
      <p className="font-display text-[0.98rem] font-semibold leading-tight">{caption.name}</p>
      <p className="mt-0.5 text-[0.8rem] text-muted">{caption.role}</p>
    </div>
  );
}

/**
 * Square transparent portrait. By default it stands in front of an accent circle; with
 * `emblem` it stands in front of an oversized Beyonn emblem that bleeds off the
 * section edge, as on beyonn.com. The full image is always shown.
 */
export function CutoutPortrait({ photo, emblem, emblem3d, compact = false }: { photo: Photo; emblem?: boolean | "on-dark"; emblem3d?: boolean; compact?: boolean }) {
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[24rem] sm:max-w-[30rem] lg:max-w-[36rem]", compact && "max-sm:aspect-[2.1] max-sm:rounded-2xl max-sm:border max-sm:border-paper/15 max-sm:bg-paper/[0.06]")}>
      {emblem ? (
        <div className={cn("pointer-events-none absolute left-1/2 top-[42%] aspect-[1600/1306] w-[150%] -translate-x-[40%] -translate-y-1/2 lg:w-[215%] lg:-translate-x-[36%]", compact && "max-sm:-right-[20%] max-sm:left-auto max-sm:top-[54%] max-sm:w-[106%] max-sm:translate-x-0 max-sm:opacity-45 max-sm:[mask-image:linear-gradient(to_right,transparent,black_43%)]")} data-morph-shape="emblem" data-morph-hide aria-hidden>
          {(() => {
            const flat = (
              <div className="size-full animate-emblem-in">
                <div
                  className={cn(
                    "size-full [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]",
                    emblem === "on-dark" ? "bg-paper/[0.08]" : "bg-ink/[0.11]",
                  )}
                />
              </div>
            );
            return emblem3d ? <Emblem3D className="size-full" fallback={flat} /> : flat;
          })()}
        </div>
      ) : (
        <>
          <div className="absolute bottom-[4%] left-1/2 aspect-square w-[80%] -translate-x-1/2 rounded-full bg-dawn animate-sun-in" aria-hidden />
          <div className="absolute bottom-[4%] left-1/2 aspect-square w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgb(255_255_255/0.35),transparent_58%)] animate-sun-in" aria-hidden />
        </>
      )}
      <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 36rem, 90vw" className={cn("object-contain [mask-image:linear-gradient(to_bottom,black_82%,transparent_99%)]", compact && "max-sm:rounded-2xl max-sm:object-right-bottom")} />
      {photo.caption && <NameCard caption={photo.caption} className={cn("bottom-[12%] left-0 sm:-left-4", compact && "max-sm:left-4 max-sm:w-[9rem] max-sm:bg-transparent max-sm:px-0 max-sm:text-paper max-sm:shadow-none max-sm:ring-0 max-sm:[&_p:last-child]:text-paper/70")} />}
    </div>
  );
}

/** Regular 3:2 photo in a soft frame with an accent block offset behind it. */
function FramedPhoto({ photo }: { photo: Photo }) {
  return (
    <div className="relative mx-auto w-full max-w-[36rem] pb-4 pr-4 lg:max-w-none">
      <div className="absolute inset-0 left-6 top-6 rounded-[var(--radius-panel)] bg-breath/70" aria-hidden />
      <Tilt className="rounded-[var(--radius-panel)]" max={4}>
        <div data-morph-shape="rect" className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2 shadow-[0_30px_60px_-35px_rgb(19_37_62/0.55)]">
          <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain" />
        </div>
      </Tilt>
      {photo.caption && <NameCard caption={photo.caption} className="-bottom-2 left-4" />}
    </div>
  );
}

/** Pages without photography get the Beyonn emblem as a 3D object (flat on mobile). */
function EmblemStage() {
  const flat = (
    <div className="size-full animate-emblem-in bg-paper/[0.12] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" />
  );
  return (
    <div data-morph-shape="emblem" data-morph-hide className="relative mx-auto aspect-[1600/1306] w-full max-w-[11rem] sm:max-w-[28rem] lg:max-w-[36rem]" aria-hidden>
      <Emblem3D className="size-full" distance={8.5} fallback={flat} />
    </div>
  );
}
