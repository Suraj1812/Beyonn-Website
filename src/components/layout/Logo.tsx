import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = { className?: string; size?: "nav" | "md" | "lg"; tone?: "badge" | "light" | "plain"; priority?: boolean };

const width = { nav: "w-[7.25rem] sm:w-[8rem] xl:w-[8.75rem]", md: "w-40", lg: "w-48" };

/**
 * Beyonn wordmark. `plain` is the original blue for light surfaces, `light`
 * renders it in white for teal surfaces, `badge` puts the blue on a white pill.
 */
export function Logo({ className, size = "md", tone = "badge", priority }: Props) {
  const img = (
    <Image
      src="/assets/beyonn-logo.png"
      alt="Beyonn"
      width={800}
      height={164}
      priority={priority}
      className={cn("h-auto", width[size], tone === "light" && "brightness-0 invert")}
    />
  );
  if (tone !== "badge") return <Localized>{<span className={cn("inline-flex items-center", className)}>{img}</span>}</Localized>;
  return <Localized>{<span className={cn("inline-flex items-center rounded-full bg-white px-3 py-1.5", className)}>{img}</span>}</Localized>;
}
