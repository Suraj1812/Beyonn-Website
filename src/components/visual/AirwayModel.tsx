"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const steps = [
  {
    kicker: "At night",
    title: "The jaw and tongue relax backward.",
    body: "During sleep the muscles let go. The lower jaw drops back, the tongue follows it, and the airway behind the tongue narrows or closes. Breathing stops and starts all night. That is obstructive sleep apnea.",
  },
  {
    kicker: "The appliance",
    title: "A custom oral appliance holds the jaw forward.",
    body: "Two thin, custom-fitted trays are worn while sleeping. They hold the lower jaw a few millimetres forward, and because the tongue is attached to the jaw, it comes forward too.",
  },
  {
    kicker: "The result",
    title: "The airway opens, and the joint is planned for.",
    body: "Air can move freely again. The jaw joint (TMJ) is part of the same system, so the forward position is set with the joint in mind. One patient, two conditions, treated together.",
  },
];

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Head silhouette in side view. `dx` moves the lips and chin with the jaw. */
function profile(dx: number) {
  const f = (x: number, k = 1) => (x + dx * k).toFixed(1);
  return `M128 36 C230 -4 392 8 446 72 C474 104 480 146 477 172 C476 188 488 200 498 216 L528 262 C535 273 527 283 512 285 C500 287 493 292 496 302 C507 308 511 316 506 324 C${f(510)} 332 ${f(511)} 342 ${f(503)} 350 C${f(494)} 357 ${f(487)} 364 ${f(491)} 378 C${f(500)} 400 ${f(497)} 422 ${f(476)} 434 C${f(444)} 448 ${f(404, 0.6)} 452 372 458 C342 470 322 500 318 560 L148 560 C150 486 122 424 102 362 C72 280 62 118 128 36 Z`;
}

/** Live breathing trace: smooth when the airway is open, flat pauses when it is not. */
function wave(t: number, open: number) {
  let d = "M0 20";
  for (let x = 0; x <= 240; x += 4) {
    const phase = t * 1.6 + x * 0.05;
    const breath = Math.sin(phase);
    // Collapsed: long flat pauses (apneas) broken by gasps.
    const gate = open + (1 - open) * smoothstep(0.55, 0.95, Math.sin(phase * 0.23) * 0.5 + 0.5);
    const amp = 4 + 11 * open;
    d += ` L${x} ${(20 - breath * amp * gate).toFixed(1)}`;
  }
  return d;
}

/**
 * Scroll-driven anatomy explainer: a side-view (sagittal) cross-section of the
 * head showing the nasal airway, soft palate, tongue, lower jaw, TMJ and spine.
 * As you scroll, the airway starts narrowed, the appliance appears, the jaw and
 * tongue move forward and air flows freely. Layers shift with the cursor for
 * depth. Drawn in SVG, so it is crisp at any size and light to run.
 */
export function AirwayModel() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const target = useRef(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const root = svg.current;
    const el = section.current;
    const box = stage.current;
    if (!root || !el || !box) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = <T extends Element>(id: string) => root.querySelector(`[data-part="${id}"]`) as T | null;
    const head = q<SVGPathElement>("head");
    const jaw = q<SVGGElement>("jaw");
    const palate = q<SVGGElement>("soft-palate");
    const back = q<SVGGElement>("back");
    const front = q<SVGGElement>("front");
    const trays = root.querySelectorAll<SVGElement>("[data-part='tray']");
    const flowTop = q<SVGPathElement>("flow-top");
    const flowLow = q<SVGPathElement>("flow-low");
    const flowLowG = q<SVGGElement>("flow-low-g");
    const block = q<SVGGElement>("block");
    const tmj = q<SVGGElement>("tmj");
    const trace = q<SVGPathElement>("trace");
    const labels = root.querySelectorAll<SVGGElement>("[data-label]");

    // The illustration and the card stack are one pinned panel, so progress is
    // simply how far we are through the section's scroll distance.
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pin = el.firstElementChild as HTMLElement | null;
      const top = pin ? parseFloat(getComputedStyle(pin).top) || 0 : 0;
      const travel = Math.max(1, r.height - (pin?.offsetHeight ?? window.innerHeight));
      const p = clamp((top - r.top) / travel);
      target.current = p;
      setStep(p > 0.62 ? 2 : p > 0.28 ? 1 : 0);
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      pointer.tx = clamp((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = clamp((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };

    let p = target.current;
    let offset = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      p += (target.current - p) * (still ? 1 : 0.09);
      const fit = smoothstep(0.22, 0.45, p);
      const open = smoothstep(0.36, 0.66, p);
      const joint = smoothstep(0.68, 0.88, p);
      const jx = -30 * (1 - open);

      head?.setAttribute("d", profile(jx));
      jaw?.setAttribute("transform", `translate(${jx.toFixed(2)} ${(4 * (1 - open)).toFixed(2)}) rotate(${(3 * (1 - open)).toFixed(2)} 262 214)`);
      palate?.setAttribute("transform", `rotate(${(9 * (1 - open)).toFixed(2)} 336 244)`);
      flowLowG?.setAttribute("transform", `translate(${(jx * 0.45).toFixed(2)} 0)`);
      trays.forEach((tr) => (tr.style.opacity = String(fit)));
      if (block) block.style.opacity = String((1 - open) * (1 - smoothstep(0.3, 0.42, p) * 0.4));
      if (tmj) {
        tmj.style.opacity = String(0.15 + joint * 0.85);
        tmj.setAttribute("transform", `translate(${(jx * 0.6).toFixed(2)} 0)`);
      }

      // airflow
      const speed = still ? 0 : 0.35 + 0.9 * open;
      offset -= speed;
      flowTop?.setAttribute("stroke-dashoffset", offset.toFixed(1));
      flowLow?.setAttribute("stroke-dashoffset", offset.toFixed(1));
      if (flowTop) flowTop.style.opacity = String(0.35 + 0.65 * open);
      if (flowLow) flowLow.style.opacity = String(open);
      trace?.setAttribute("d", wave(still ? 0 : t, open));

      labels.forEach((l) => {
        const when = Number(l.dataset.label);
        const show = when === 1 ? fit : when === 2 ? joint : 1;
        l.style.opacity = String(show);
      });

      // depth parallax
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      back?.setAttribute("transform", `translate(${(-pointer.x * 6).toFixed(2)} ${(-pointer.y * 4).toFixed(2)})`);
      front?.setAttribute("transform", `translate(${(pointer.x * 7).toFixed(2)} ${(pointer.y * 5).toFixed(2)})`);
      root.style.transform = `perspective(1400px) rotateY(${(pointer.x * 5).toFixed(2)}deg) rotateX(${(-pointer.y * 3.5).toFixed(2)}deg)`;
    };

    let raf = 0;
    let onScreen = false;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 16) return;
      last = now;
      draw(now);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (onScreen && !document.hidden && !still) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      run();
    });
    io.observe(el);

    let sraf = 0;
    const onScroll = () => {
      cancelAnimationFrame(sraf);
      sraf = requestAnimationFrame(() => {
        measure();
        if (still) draw(performance.now());
      });
    };
    const onVis = () => run();
    measure();
    draw(performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onVis);
    if (!still) {
      box.addEventListener("pointermove", onPointer, { passive: true });
      box.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      box.removeEventListener("pointermove", onPointer);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const status = step >= 2 ? { label: "Airway open", dot: "bg-breath-deep" } : step === 1 ? { label: "Appliance fitted", dot: "bg-dawn" } : { label: "Airway narrowed", dot: "bg-[#d4544f]" };

  return (
    <div ref={section} className="relative">
      {/* Pinned panel: the illustration and the stacking cards */}
      <div className="sticky top-16 z-0 flex flex-col gap-3 lg:top-24 lg:grid lg:h-[calc(100svh-8rem)] lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:gap-12">
        <div ref={stage} className="relative h-[42svh] flex-none overflow-hidden lg:h-full rounded-[var(--radius-panel)] bg-[radial-gradient(110%_80%_at_55%_45%,#ffffff_0%,#eef4fb_62%,#e3ecf7_100%)] ring-1 ring-ink/[0.07]">
          {/* faint grid, like a clinical lightbox */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(19_37_62/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(19_37_62/0.05)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden />

          <div className="absolute inset-x-1 bottom-14 top-10 [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] sm:inset-x-4 sm:bottom-16 sm:top-12">
            <svg ref={svg} viewBox="-40 30 760 520" className="h-full w-full overflow-visible will-change-transform" role="img" aria-label="Side view of the head showing the airway, tongue and jaw. An oral appliance moves the lower jaw forward and the airway behind the tongue opens.">
              <defs>
                <radialGradient id="aw-skin" cx="58%" cy="42%" r="70%">
                  <stop offset="0" stopColor="#fbe9df" />
                  <stop offset="0.7" stopColor="#f2d2c2" />
                  <stop offset="1" stopColor="#e7bba8" />
                </radialGradient>
                <linearGradient id="aw-tongue" x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0" stopColor="#f4b2a8" />
                  <stop offset="0.55" stopColor="#e48d8b" />
                  <stop offset="1" stopColor="#cf7079" />
                </linearGradient>
                <linearGradient id="aw-tissue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f1b7a8" />
                  <stop offset="1" stopColor="#dd8f86" />
                </linearGradient>
                <linearGradient id="aw-bone" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fffdf8" />
                  <stop offset="1" stopColor="#eadfcc" />
                </linearGradient>
                <linearGradient id="aw-air" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e6f4fc" />
                  <stop offset="1" stopColor="#cbe5f5" />
                </linearGradient>
                <linearGradient id="aw-tray" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#7fb2e6" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#3177bf" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="aw-flow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3177bf" />
                  <stop offset="1" stopColor="#0b9a78" />
                </linearGradient>
                <clipPath id="aw-clip">
                  <path d={profile(0)} />
                </clipPath>
                <filter id="aw-soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#13253e" floodOpacity="0.16" />
                </filter>
              </defs>

              {/* Head silhouette (the jaw part of the outline moves) */}
              <path data-part="head" d={profile(-30)} fill="url(#aw-skin)" stroke="#d9a690" strokeWidth="1.5" filter="url(#aw-soft)" />
              <path d="M150 74 C220 34 360 34 420 86 C448 112 452 150 430 172 C380 196 300 192 220 196 C170 198 132 176 126 136 C122 108 132 88 150 74 Z" fill="#fff" opacity="0.28" />

              {/* Back layer: spine and back of the throat */}
              <g clipPath="url(#aw-clip)">
              <g data-part="back">
                {Array.from({ length: 7 }, (_, i) => (
                  <rect key={i} x={150 - i * 3} y={262 + i * 42} width={54} height={34} rx={9} fill="url(#aw-bone)" stroke="#d8c8ae" strokeWidth="1.2" />
                ))}
                <path d="M162 246 C170 226 196 222 208 236 L206 256 L160 258 Z" fill="url(#aw-bone)" stroke="#d8c8ae" strokeWidth="1.2" />
                {/* skull base */}
                <path d="M120 200 C170 214 222 210 262 196" fill="none" stroke="#d8c8ae" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
              </g>

              </g>
              {/* Airway (air spaces) */}
              <g>
                <path d="M300 200 C330 182 400 172 470 186 C488 196 500 214 505 236 C470 238 400 236 330 238 C310 236 296 222 300 200 Z" fill="url(#aw-air)" />
                <path d="M318 210 C286 206 252 214 240 244 C232 268 234 300 234 340 L232 560 L300 560 C298 500 296 450 300 410 C310 360 322 300 336 250 C340 228 336 212 318 210 Z" fill="url(#aw-air)" />
                {/* nasal turbinates */}
                <path d="M338 198 C372 190 412 190 446 198" stroke="url(#aw-tissue)" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M344 216 C380 210 420 210 458 218" stroke="url(#aw-tissue)" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>

              {/* Airflow, upper path (nose to throat) */}
              <path data-part="flow-top" d="M516 282 C500 236 462 206 400 205 C342 205 300 212 272 236 C258 252 256 290 257 330" fill="none" stroke="url(#aw-flow)" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="1.5 13" />

              {/* Lower jaw, tongue and chin: all move together */}
              <g data-part="jaw" transform="translate(-30 4) rotate(3 262 214)">
                {/* ramus (side of the jaw, seen through) */}
                <path d="M252 208 C264 198 282 206 280 222 C276 262 282 332 292 382 C300 414 326 430 364 433 L452 430 L456 446 L360 450 C316 448 284 428 276 392 C266 340 262 270 252 208 Z" fill="url(#aw-bone)" opacity="0.45" stroke="#cdbb9e" strokeWidth="1" />
                <circle cx="262" cy="214" r="13" fill="url(#aw-bone)" stroke="#cdbb9e" strokeWidth="1.2" />
                {/* tongue */}
                <path d="M476 326 C470 300 440 272 400 266 C360 260 322 268 300 296 C284 318 280 352 286 384 C290 404 300 414 314 420 C360 430 420 412 452 384 C470 368 478 346 476 326 Z" fill="url(#aw-tongue)" stroke="#c9656f" strokeWidth="1" />
                {/* muscle fibres fanning from the chin */}
                <g stroke="#fff" strokeOpacity="0.22" strokeWidth="2" fill="none" strokeLinecap="round">
                  <path d="M452 392 C420 350 400 310 392 272" />
                  <path d="M450 394 C410 360 370 320 340 282" />
                  <path d="M448 396 C400 372 340 350 300 318" />
                  <path d="M446 398 C400 390 340 384 296 372" />
                </g>
                <path d="M450 310 C420 284 370 278 330 296" stroke="#f6c3bd" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
                {/* epiglottis */}
                <path d="M308 416 C296 422 288 434 286 448 C294 442 302 434 314 424 Z" fill="url(#aw-tissue)" />
                {/* chin bone */}
                <path d="M470 352 C486 360 492 392 484 418 C476 436 452 440 438 428 C430 410 440 380 452 362 Z" fill="url(#aw-bone)" stroke="#d8c8ae" strokeWidth="1.2" />
                {/* lower incisor */}
                <path d="M486 314 C492 316 492 326 488 340 L476 364 C470 362 468 356 470 348 L480 318 C481 315 483 314 486 314 Z" fill="#fff" stroke="#e0d4c2" strokeWidth="1.2" />
                {/* lower tray */}
                <path data-part="tray" d="M478 306 C492 304 500 314 496 334 L484 368 C474 372 464 366 464 356 L474 318 C475 311 476 307 478 306 Z" fill="url(#aw-tray)" stroke="#3177bf" strokeWidth="1.5" style={{ opacity: 0 }} />
                <g data-label="0">
                  <circle cx="404" cy="346" r="3.5" fill="#13253e" />
                  <path d="M404 346 L560 400 L700 400" fill="none" stroke="#13253e" strokeWidth="1" opacity="0.45" />
                  <text x="700" y="392" textAnchor="end" className="fill-ink text-[21px] font-semibold">Tongue</text>
                </g>
                <g data-label="0">
                  <circle cx="462" cy="414" r="3.5" fill="#13253e" />
                  <path d="M462 414 L560 470 L700 470" fill="none" stroke="#13253e" strokeWidth="1" opacity="0.45" />
                  <text x="700" y="462" textAnchor="end" className="fill-ink text-[21px] font-semibold">Lower jaw</text>
                </g>
              </g>

              {/* Fixed upper structures */}
              <g data-part="soft-palate" transform="rotate(9 336 244)">
                <path d="M336 240 C318 246 300 262 292 286 C288 302 296 310 304 302 C316 290 328 270 344 252 Z" fill="url(#aw-tissue)" />
              </g>
              <path d="M330 238 C400 234 460 236 500 242 L498 253 C460 249 400 249 332 251 Z" fill="url(#aw-bone)" stroke="#d8c8ae" strokeWidth="1.2" />
              {/* upper incisor */}
              <path d="M488 252 C498 260 504 290 500 318 C497 325 490 325 487 318 C483 296 483 270 484 254 Z" fill="#fff" stroke="#e0d4c2" strokeWidth="1.2" />
              {/* upper tray */}
              <path data-part="tray" d="M478 248 C496 244 508 258 508 284 C508 306 506 324 498 330 C488 332 482 326 480 318 C476 296 474 268 478 248 Z" fill="url(#aw-tray)" stroke="#3177bf" strokeWidth="1.5" style={{ opacity: 0 }} />

              {/* Airflow, lower path (throat to lungs): only once the airway is open */}
              <g data-part="flow-low-g" transform="translate(-13.5 0)">
                <path data-part="flow-low" d="M257 330 C257 400 259 470 262 556" fill="none" stroke="url(#aw-flow)" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="1.5 13" style={{ opacity: 0 }} />
              </g>

              {/* Blockage marker */}
              <g data-part="block">
                <circle cx="246" cy="350" r="22" fill="#d4544f" opacity="0.14" className="motion-safe:animate-ping [transform-box:fill-box] [transform-origin:center]" />
                <circle cx="246" cy="350" r="12" fill="#d4544f" opacity="0.28" />
                <path d="M239 343 L253 357 M253 343 L239 357" stroke="#d4544f" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* TMJ highlight */}
              <g data-part="tmj" style={{ opacity: 0.15 }}>
                <circle cx="262" cy="214" r="26" fill="none" stroke="#0b9a78" strokeWidth="2.5" strokeDasharray="4 5" />
                <circle cx="262" cy="214" r="34" fill="#72cfb7" opacity="0.18" />
              </g>

              {/* Front layer: labels on the fixed side */}
              <g data-part="front">
                <g data-label="0">
                  <circle cx="246" cy="300" r="3.5" fill="#13253e" />
                  <path d="M246 300 L100 300 L-30 300" fill="none" stroke="#13253e" strokeWidth="1" opacity="0.45" />
                  <text x="-30" y="292" className="fill-ink text-[21px] font-semibold">Airway</text>
                </g>
                <g data-label="0">
                  <circle cx="306" cy="282" r="3.5" fill="#13253e" />
                  <path d="M306 282 L200 120 L-30 120" fill="none" stroke="#13253e" strokeWidth="1" opacity="0.45" />
                  <text x="-30" y="112" className="fill-ink text-[21px] font-semibold">Soft palate</text>
                </g>
                <g data-label="2" style={{ opacity: 0 }}>
                  <path d="M240 200 L120 60 L-30 60" fill="none" stroke="#0b9a78" strokeWidth="1.2" />
                  <text x="-30" y="52" className="fill-breath-deep text-[21px] font-semibold">Jaw joint (TMJ)</text>
                </g>
                <g data-label="1" style={{ opacity: 0 }}>
                  <circle cx="506" cy="282" r="3.5" fill="#3177bf" />
                  <path d="M506 282 L600 230 L700 230" fill="none" stroke="#3177bf" strokeWidth="1.2" />
                  <text x="700" y="222" textAnchor="end" className="fill-dawn text-[21px] font-semibold">Oral appliance</text>
                </g>
              </g>
            </svg>
          </div>

          {/* Status pill */}
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm ring-1 ring-ink/[0.06] sm:left-5 sm:top-5">
            <span className={cn("relative size-2 rounded-full transition-colors duration-500", status.dot)} />
            {status.label}
          </div>

          {/* Breathing monitor */}
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl bg-white/85 px-3 py-2 shadow-sm ring-1 ring-ink/[0.06] backdrop-blur-sm sm:bottom-5 sm:left-5 sm:right-5 sm:px-4">
            <span className="flex-none text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">Airflow</span>
            <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="h-7 min-w-0 flex-1" aria-hidden>
              <path d="M0 20 H240" stroke="rgb(19 37 62 / 0.08)" strokeWidth="1" />
              <path data-part="trace" d="M0 20 H240" fill="none" stroke={step >= 2 ? "#0b9a78" : step === 1 ? "#3177bf" : "#d4544f"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ transition: "stroke 0.5s" }} vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="hidden flex-none gap-1 sm:flex" aria-hidden>
              {steps.map((s, i) => (
                <span key={s.kicker} className={cn("h-1.5 w-5 rounded-full transition-colors duration-500", i <= step ? "bg-dawn" : "bg-ink/10")} />
              ))}
            </span>
          </div>
        </div>

        {/* Cards slide up and stack on each other inside the pinned panel */}
        <div className="relative grid">
          {steps.map((s, i) => (
            <div
              key={s.kicker}
              aria-hidden={i > step}
              className={cn(
                "origin-top self-start [grid-area:1/1] rounded-[var(--radius-card)] p-5 lg:p-8 shadow-[0_20px_44px_-28px_rgb(19_37_62/0.5)] ring-1 ring-ink/[0.07]",
                i < step ? "bg-paper-2" : "bg-white",
                i > step && "pointer-events-none opacity-0",
              )}
              style={{
                marginTop: `${i * 0.75}rem`,
                zIndex: i,
                transition: "transform 700ms var(--ease-out-expo), opacity 220ms linear, background-color 500ms ease",
                transform: i > step ? "translate3d(0, 115%, 0)" : `translate3d(0,0,0) scale(${1 - (step - i) * 0.04})`,
              }}
            >
              <StepCopy s={s} i={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll distance while the panel is pinned */}
      <div className="h-[150svh] lg:h-[180svh]" aria-hidden />

    </div>
  );
}

function StepCopy({ s, i }: { s: (typeof steps)[number]; i: number }) {
  return (
    <>
      <p className="t-eyebrow text-dawn">
        <span style={{ fontVariantNumeric: "tabular-nums" }}>0{i + 1}</span>
        <span className="mx-2 text-ink/30">·</span>
        {s.kicker}
      </p>
      <h3 className="mt-2.5 font-display text-[clamp(1.2rem,2vw,1.7rem)] font-semibold leading-snug text-ink lg:mt-3">{s.title}</h3>
      <p className="mt-2.5 text-[0.9rem] leading-relaxed text-muted lg:mt-3 lg:text-[0.98rem]">{s.body}</p>
    </>
  );
}
