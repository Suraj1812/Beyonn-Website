"use client";

import { Localized } from "@/components/i18n/Localized";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const chapters = [
  { label: "During sleep", start: 0, timestamp: "0:00" },
  { label: "When breathing pauses", start: 42, timestamp: "0:42" },
  { label: "The appliance", start: 60, timestamp: "1:00" },
];

export function OralApplianceVideo({ intro }: { intro: ReactNode }) {
  const player = useRef<HTMLVideoElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const video = player.current;
    if (!video) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.25) return;
      setHasEnteredViewport(true);
      observer.disconnect();
    }, { threshold: 0.25 });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function jumpToChapter(start: number) {
    const video = player.current;
    if (!video) return;

    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      pendingSeek.current = start;
      setHasEnteredViewport(true);
      return;
    }

    video.currentTime = start;
    void video.play().catch(() => {
      // The native play control is available if the browser blocks playback.
    });
  }

  return (
    <Localized>
      <div className="grid items-center gap-y-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:grid-rows-[1fr_1fr] lg:gap-x-12 lg:gap-y-7 xl:gap-x-16">
        <div className="self-end lg:col-start-1 lg:row-start-1">{intro}</div>

        <div className="relative overflow-hidden rounded-2xl bg-night shadow-[0_20px_50px_-20px_rgb(0_0_0/0.65)] ring-1 ring-white/15 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <video
            ref={player}
            src={hasEnteredViewport ? "/api/media/oral-appliance" : undefined}
            poster={hasEnteredViewport ? "/assets/videos/oral-appliance-poster.webp" : undefined}
            className="block aspect-video w-full"
            aria-label="How an oral appliance helps"
            autoPlay
            muted
            playsInline
            controls
            preload="none"
            onLoadedMetadata={(event) => {
              if (pendingSeek.current === null) return;
              event.currentTarget.currentTime = pendingSeek.current;
              pendingSeek.current = null;
            }}
            onTimeUpdate={(event) => {
              const currentTime = event.currentTarget.currentTime;
              setActiveChapter(chapters.findLastIndex(({ start }) => currentTime >= start));
            }}
          >
            <track kind="captions" src="/assets/videos/oral-appliance-demo.en.vtt" srcLang="en" label="English" />
          </video>
          {hasEnteredViewport && (
            // Position relative to the original 16:9 frame to cover the embedded mark.
            <div className="pointer-events-none absolute left-[10.65%] top-[15.8%] aspect-square w-[12.6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f1f5f7] p-[2.2%]" dir="ltr" aria-hidden>
              <Image
                src="/icon.png"
                alt=""
                width={256}
                height={256}
                sizes="(min-width: 1240px) 60px, 9vw"
                className="size-full object-contain"
              />
            </div>
          )}
        </div>

        <ul className="divide-y divide-paper/15 border-y border-paper/15 self-start lg:col-start-1 lg:row-start-2">
          {chapters.map(({ label, start, timestamp }, index) => (
            <li key={start}>
              <button
                type="button"
                onClick={() => jumpToChapter(start)}
                aria-current={activeChapter === index ? "true" : undefined}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 px-2 py-2.5 text-start text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-breath sm:px-3",
                  activeChapter === index ? "bg-white/10 text-breath" : "text-paper",
                )}
              >
                <span className="font-mono text-xs tabular-nums text-paper/70" dir="ltr">{timestamp}</span>
                <span className="flex-1">{label}</span>
                <ArrowRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Localized>
  );
}

OralApplianceVideo.cmsLocalizedBoundary = true;
