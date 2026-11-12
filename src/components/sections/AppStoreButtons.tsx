import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

function AppleBadge() {
  return <Localized>{<Image src="/assets/store-badges/app-store.svg" alt="Download on the App Store" width={120} height={40} unoptimized className="h-11 w-[132px] sm:h-13 sm:w-[156px]" />}</Localized>;
}

function PlayBadge() {
  return <Localized>{(
    <span className="relative block h-11 w-[148px] overflow-hidden sm:h-13 sm:w-[175px]">
      <Image src="/assets/store-badges/google-play.png" alt="Get it on Google Play" width={646} height={250} unoptimized className="absolute max-w-none" style={{ width: "114.54%", height: "148.81%", left: "-7.27%", top: "-24.4%" }} />
    </span>
  )}</Localized>;
}

export function AppStoreButtons({ dark = false }: { dark?: boolean }) {
  const focus = "inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dawn";
  return <Localized>{(
    <div className="flex flex-wrap items-start gap-3 sm:gap-4">
      <div>
        {site.app.appStore ? (
          <a href={site.app.appStore} target="_blank" rel="noopener noreferrer" aria-label="Download Beyonn on the App Store" className={focus}><AppleBadge /></a>
        ) : (
          <button type="button" disabled aria-label="App Store — coming soon" className="inline-flex cursor-not-allowed rounded-lg"><AppleBadge /></button>
        )}
        {!site.app.appStore && <p className={cn("mt-1 text-center text-xs", dark ? "text-paper/70" : "text-muted")}>Coming soon</p>}
      </div>
      <a href={site.app.googlePlay} target="_blank" rel="noopener noreferrer" aria-label="Download Beyonn on Google Play" className={focus}><PlayBadge /></a>
    </div>
  )}</Localized>;
}
