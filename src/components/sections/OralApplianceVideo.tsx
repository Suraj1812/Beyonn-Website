"use client";

import { useEffect, useRef, useState } from "react";
import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";

export function OralApplianceVideo() {
  const player = useRef<HTMLVideoElement>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

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

  return (
    <Localized>
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-night ring-1 ring-ink/10">
        <video
          ref={player}
          src={hasEnteredViewport ? "/api/media/oral-appliance" : undefined}
          className="block aspect-video w-full"
          aria-label="How an oral appliance helps"
          autoPlay
          muted
          playsInline
          controls
          preload="none"
        >
          <track kind="captions" src="/assets/videos/oral-appliance-demo.en.vtt" srcLang="en" label="English" />
        </video>
        {hasEnteredViewport && (
          <Image
            src="/assets/beyonn-logo.png"
            alt=""
            width={800}
            height={164}
            sizes="(min-width: 960px) 108px, 12vw"
            className="pointer-events-none absolute left-[16.5%] top-[3.5%] h-auto w-[12%] bg-white/95 p-[0.7%]"
          />
        )}
      </div>
    </Localized>
  );
}

OralApplianceVideo.cmsLocalizedBoundary = true;
