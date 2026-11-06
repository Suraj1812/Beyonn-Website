import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Emblem3D } from "@/components/visual/Emblem3D";

/** Closing call to action used at the end of every page. */
export function CtaBand({ eyebrow = "Next step", title, sub, actions, children }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-paper py-6 sm:py-10">
      <div className="container-x">
        <div className="spotlight relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-ink px-6 py-12 text-paper sm:px-12 sm:py-16">
          <div className="hero-glow absolute inset-0 -z-10" aria-hidden />
          {/* Beyonn half-emblem rising from the bottom-left edge */}
          <div
            data-aos="fade-up"
            data-aos-duration="1400"
            className="absolute -bottom-6 -left-10 -z-10 aspect-[4066/1180] w-[34rem] bg-paper/[0.07] [mask:url(/assets/site/beyonn-half-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-half-emblem.png)_center/contain_no-repeat] sm:w-[46rem]"
            aria-hidden
          />
          {/* rising sun + wave: a quiet nod to sleep and breath */}
          <div data-morph-shape="emblem" data-morph-hide className="absolute -right-24 top-1/2 -z-10 hidden aspect-[1600/1306] w-[30rem] -translate-y-1/2 md:block lg:w-[36rem] xl:-right-10" aria-hidden>
            <Emblem3D distance={10} className="size-full" />
          </div>
          <div data-aos="sun-rise" data-aos-duration="1500" className="absolute -bottom-24 -right-16 -z-10 size-72 rounded-full bg-dawn sm:size-96 md:hidden" aria-hidden />
          <svg className="absolute bottom-10 right-8 -z-10 w-40 text-paper/70 animate-bob sm:w-56 md:hidden" viewBox="0 0 160 30" fill="none" aria-hidden>
            <path d="M3 20c12-14 24-14 36 0s24 14 36 0 24-14 36 0 24 14 36 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="relative max-w-3xl">
            <div data-aos="fade-up">
              <Eyebrow tone="dark">{eyebrow}</Eyebrow>
            </div>
            <h2 data-aos="fade-up" data-aos-delay="60" className="mt-6 t-h2">
              {title}
            </h2>
            {sub && (
              <p data-aos="fade-up" data-aos-delay="120" className="mt-6 max-w-xl t-lead text-paper/75">
                {sub}
              </p>
            )}
            {actions && (
              <div data-aos="fade-up" data-aos-delay="180" className="mt-10 flex flex-wrap gap-3">
                {actions}
              </div>
            )}
          </div>
          {children && <div className="relative mt-12">{children}</div>}
        </div>
      </div>
    </section>
  );
}
