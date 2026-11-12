import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";

/**
 * First-visit intro on a navy curtain: the Beyonn emblem draws itself from
 * scratch (two pens trace the left and right rings at the same time, revealing
 * the real logo along its curves), the wordmark fades up, a mint line fills,
 * then the curtain lifts.
 *
 * How the drawing works: the emblem's shape comes from a CSS mask (the logo
 * file, inlined so it is sharp on the first frame). Inside it, an SVG mask made
 * of two thick circular strokes grows around each ring centre (stroke-dashoffset),
 * so the logo appears exactly as if it were being drawn.
 * Pure CSS/SVG, plays on every full page load (client-side navigation uses the
 * lighter route curtain instead). Hidden for reduced motion.
 */
export function Intro() {
  // Ring centres and pen size in the emblem file's own coordinates (1600 x 1306).
  const cy = 731;
  const r = 368;
  const pen = 440;
  return <Localized>{(
    <div className="intro" aria-hidden>
      <div className="intro__inner">
        <div className="intro__emblem">
          <svg viewBox="0 0 1600 1306" className="size-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="intro-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#72cfb7" />
                <stop offset="1" stopColor="#c5daf2" />
              </linearGradient>
              <mask id="intro-draw" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1306">
                <circle className="intro__pen" cx="592" cy={cy} r={r} pathLength={1} fill="none" stroke="#fff" strokeWidth={pen} transform={`rotate(-90 592 ${cy})`} />
                <circle className="intro__pen" cx="1008" cy={cy} r={r} pathLength={1} fill="none" stroke="#fff" strokeWidth={pen} transform={`translate(2016 0) scale(-1 1) rotate(-90 1008 ${cy})`} />
              </mask>
            </defs>
            <rect width="1600" height="1306" fill="url(#intro-g)" mask="url(#intro-draw)" />
          </svg>
        </div>
        <Image src="/assets/beyonn-logo.png" alt="" width={800} height={164} priority className="intro__word h-auto w-40 brightness-0 invert" />
        <div className="intro__bar">
          <span />
        </div>
      </div>
    </div>
  )}</Localized>;
}
