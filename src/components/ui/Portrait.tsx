import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  src?: string | null;
  className?: string;
  tone?: "dawn" | "breath" | "lilac";
  priority?: boolean;
  sizes?: string;
};

const tones = {
  dawn: "from-dawn/80 via-dawn-deep/40 to-night",
  breath: "from-breath/70 via-breath-deep/40 to-night",
  lilac: "from-lilac/80 via-dawn/50 to-ink",
};

/**
 * Portrait frame. Uses next/image when a photo is supplied; otherwise renders a
 * monogram composition so layouts stay intact until approved photography lands.
 */
export function Portrait({ name, src, className, tone = "dawn", priority, sizes = "(min-width: 1024px) 40vw, 90vw" }: Props) {
  const initials = name
    .replace(/^Dr\.\s*/, "")
    .split(/[\s,]+/)
    .filter((w) => /^[A-Z]/.test(w) && !/^(DDS|D\.)/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius-panel)] bg-night", className)}>
      {src ? (
        <Image src={src} alt={`Portrait of ${name}`} fill priority={priority} sizes={sizes} className="object-contain object-bottom" />
      ) : (
        <div role="img" aria-label={`Portrait of ${name}`} className={cn("absolute inset-0 bg-gradient-to-br", tones[tone])}>
          <svg className="absolute inset-0 size-full opacity-40" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <defs>
              <radialGradient id={`pg-${initials}`} cx="50%" cy="38%" r="55%">
                <stop offset="0" stopColor="#fff" stopOpacity=".55" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="190" r="190" fill={`url(#pg-${initials})`} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx="200" cy="520" r={140 + i * 46} fill="none" stroke="#fff" strokeOpacity={0.22 - i * 0.03} />
            ))}
          </svg>
          <span className="absolute inset-0 grid place-items-center font-display font-bold text-paper/90 text-[clamp(4rem,12vw,9rem)] leading-none">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
