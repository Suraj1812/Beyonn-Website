import Image from "next/image";

const screens = [
  { image: "welcome", title: "Meet your care companion", alt: "Beyonn welcome screen introducing sleep checks, exam booking, treatment and progress" },
  { image: "visit-preparation", title: "Prepare for your visit", alt: "Beyonn appointment checklist showing what to bring to an exam" },
  { image: "progress", title: "Follow your progress", alt: "Beyonn progress screen with sample snoring trends, sleep score and jaw comfort" },
];

export function PatientAppScreenshots({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <figure data-aos="fade-up" className="mx-auto w-full max-w-[32rem]">
        <div className="grid grid-cols-3 items-start gap-2 sm:gap-3">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg">
            <Image src="/assets/patient-app/welcome.webp" alt={screens[0].alt} width={780} height={1560} sizes="(min-width: 768px) 165px, 29vw" className="h-auto w-full" />
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg">
            <Image src="/assets/patient-app/home.webp" alt="Beyonn home screen with a sample appointment and visit reminders" width={780} height={1560} sizes="(min-width: 768px) 165px, 29vw" className="h-auto w-full" />
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lg">
            <Image src="/assets/patient-app/progress.webp" alt={screens[2].alt} width={780} height={1560} sizes="(min-width: 768px) 165px, 29vw" className="h-auto w-full" />
          </div>
        </div>
      </figure>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted sm:hidden">Swipe to explore the app →</p>
      <div className="grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible">
        {screens.map((screen) => (
          <figure key={screen.image} className="min-w-0 snap-center" data-aos="fade-up">
            <div className="mx-auto max-w-[19rem] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
              <Image src={`/assets/patient-app/${screen.image}.webp`} alt={screen.alt} width={780} height={1560} sizes="(min-width: 1024px) 280px, (min-width: 640px) 300px, 75vw" className="h-auto w-full" />
            </div>
            <figcaption className="mt-4 text-center font-semibold text-ink">{screen.title}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">Actual app screens · Sample data shown</p>
    </div>
  );
}
