"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const screens = [
  { number: 1, title: "Welcome to Beyonn", alt: "Beyonn welcome screen with sleep checks, exam booking and treatment options" },
  { number: 2, title: "Learn about your care", alt: "Beyonn learning library with articles and videos about exams and treatment" },
  { number: 3, title: "Your care journey", alt: "Beyonn care timeline showing the exam, treatment plan, sleep study and insurance steps" },
  { number: 4, title: "Appointments and reminders", alt: "Beyonn home screen showing a sample confirmed appointment and visit reminders" },
  { number: 5, title: "Check your sleep", alt: "Beyonn sleep check questionnaire with common nighttime symptoms" },
  { number: 6, title: "Your exam details", alt: "Beyonn exam screen with sample practice details, appointment information and care team contact" },
];

const source = (number: number) => `/assets/patient-app/play-store/screen-${number}.webp`;

export function PatientAppScreenshots({ compact = false }: { compact?: boolean }) {
  const gallery = useRef<HTMLDivElement>(null);
  const galleryId = useId();
  const move = (direction: number) => {
    const el = gallery.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  if (compact) {
    return (
      <figure data-aos="fade-up" className="mx-auto w-full max-w-[32rem]">
        <div className="grid grid-cols-3 items-start gap-2 sm:gap-3">
          {[screens[0], screens[3], screens[2]].map((screen, i) => (
            <div key={screen.number} className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg" style={{ marginTop: `${i * 1.25}rem` }}>
              <Image src={source(screen.number)} alt={screen.alt} width={1080} height={1920} sizes="(min-width: 768px) 165px, 29vw" className="h-auto w-full" />
            </div>
          ))}
        </div>
      </figure>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">Swipe or browse all 6 screens</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Previous app screenshots" aria-controls={galleryId} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:bg-paper-2"><ArrowLeft className="size-4" aria-hidden /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next app screenshots" aria-controls={galleryId} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:bg-paper-2"><ArrowRight className="size-4" aria-hidden /></button>
        </div>
      </div>
      <div id={galleryId} ref={gallery} role="region" aria-label="Beyonn app screenshots from Google Play" tabIndex={0} className="grid snap-x snap-mandatory auto-cols-[75%] grid-flow-col gap-5 overflow-x-auto px-1 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[40%] lg:auto-cols-[24%]">
        {screens.map((screen) => (
          <figure key={screen.number} className="min-w-0 snap-start">
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
              <Image src={source(screen.number)} alt={screen.alt} width={1080} height={1920} sizes="(min-width: 1024px) 300px, (min-width: 640px) 40vw, 75vw" className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-center text-sm font-semibold text-ink">{screen.title}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
