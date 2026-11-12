import { Localized } from "@/components/i18n/Localized";
/** The same Dr. Willey introduction featured on Beyonn's current program page. */
export function DoctorIntroVideo() {
  return <Localized>{(
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-night ring-1 ring-paper/15">
      <iframe
        src="https://player.mux.com/Y3F012sQhPnzsbQeqwKFnbR9c2UAmoEabZR8RKe1HupU?metadata-video-title=Dentist+Trailer&video-title=Dentist+Trailer&thumbnail-time=10&preload=none"
        title="Dr. Rodney Willey introduces the OSA and TMD program"
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )}</Localized>;
}
