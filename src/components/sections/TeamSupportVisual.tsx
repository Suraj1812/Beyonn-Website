"use client";

import Image from "next/image";
import { Localized } from "@/components/i18n/Localized";

/** Custom editorial artwork based on the team’s supplied portrait references. */
export function TeamSupportVisual() {
  return <Localized>{(
    <div data-team-visual className="mx-auto w-full max-w-[21rem] sm:max-w-[30rem] lg:max-w-[34rem]">
      <div className="relative aspect-[3/2]">
        <Image
          src="/assets/team/team-at-work-v3.webp"
          alt="Illustration of a clinical team collaborating"
          fill
          preload
          sizes="(min-width: 1024px) 544px, (min-width: 640px) 480px, 336px"
          className="object-contain"
        />
      </div>
    </div>
  )}</Localized>;
}

// Prevent parent boundaries from translating this component before it renders.
TeamSupportVisual.cmsLocalizedBoundary = true;
