"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Volume2 } from "lucide-react";
import { AirwayScene } from "./AirwayScene";
import { useAirwayNarration } from "./useAirwayNarration";
import styles from "./AirwayModel.module.css";

const steps = [
  {
    label: "During sleep",
    title: "Your airway can narrow.",
    body: "Your airway is the passage air travels through to reach your lungs. In obstructive sleep apnea, it narrows or closes repeatedly during sleep, briefly interrupting breathing.",
    spoken: "Think of the airway as the passage air takes to reach your lungs. When you fall asleep, the muscles in your throat relax. For someone with obstructive sleep apnea, that passage can narrow or close repeatedly. Breathing pauses briefly, then starts again. A sleep study helps a physician find out whether that's happening.",
  },
  {
    label: "The appliance",
    title: "The lower jaw moves forward.",
    body: "A custom appliance fits over your teeth and holds your lower jaw slightly forward during sleep. As the jaw moves, it helps create more room behind the tongue.",
    spoken: "Now look at the lower jaw in the model. The appliance fits over your teeth. It holds your lower jaw a little forward while you sleep. As your jaw moves, the tongue moves with it. That can create more space behind the tongue for air to pass.",
  },
  {
    label: "The airway",
    title: "Your provider checks the fit and results.",
    body: "TMD refers to problems affecting the jaw joints or chewing muscles. Tell your provider if you have jaw pain or stiffness so they can consider your comfort. Follow-up sleep testing checks how well the appliance works.",
    spoken: "T M D is a group of problems affecting the jaw joints or the muscles you use to chew. If your jaw hurts or feels stiff, tell your provider. They can adjust the fit and check your comfort. A follow-up sleep test helps your care team check whether the appliance is improving your breathing during sleep.",
  },
];

// Loop timeline (seconds): where each chapter starts, plus the loop's reset point.
const BOUNDS = [0, 7.84, 13.6, 22];
const progressAt = (t: number) => (t < 4 ? 0 : t < 16 ? (t - 4) / 12 : t < 22.4 ? 1 : 0);

export function AirwayModel() {
  const viewer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const anatomy = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const loopTime = useRef(0);
  const [value, setValue] = useState(0);
  const [inView, setInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "failed">("loading");
  const [inspecting, setInspecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [detailText, setDetailText] = useState<string | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const step = value >= 80 ? 2 : value >= 32 ? 1 : 0;
  const narration = useAirwayNarration({
    step,
    text: steps[step].spoken,
    suspended: !inView || !pageVisible || resetting || sceneState === "loading",
    detailText,
  });
  const { speakingRef, speakingStepRef } = narration;
  // Autoplay waits for a meaningful first view. Scroll/tab interruptions and
  // an open anatomy bubble suspend the loop without losing its position.
  const playing = hasEntered && (!reducedMotion || narration.enabled)
    && inView && pageVisible && !inspecting && !userPaused && sceneState === "ready";
  const onReady = useCallback(() => setSceneState("ready"), []);
  const onError = useCallback(() => setSceneState("failed"), []);
  const onInspectChange = useCallback((open: boolean, text?: string) => {
    setInspecting(open);
    setDetailText(open ? text ?? null : null);
  }, []);

  useEffect(() => {
    if (!playing) {
      viewer.current?.style.setProperty("--airway-visibility", "1");
      if (anatomy.current) anatomy.current.inert = false;
      // Keep the reset concealed if visibility or inspection interrupted it.
      if (loopTime.current >= 22.4) loopTime.current = 0;
      else if (loopTime.current >= 22) loopTime.current = 22;
      return;
    }
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      if (!last) last = now;
      const delta = document.hidden ? 0 : Math.min(now - last, 80);
      last = now;
      // 4s at rest, 12s advancing, 6s open, then a quiet 2s reset. The middle
      // chapter stays visible long enough to read while its anatomy changes.
      let nextTime = (loopTime.current + delta / 1000) % 24;
      // Give the spoken explanation time to finish before the next chapter.
      const spokenStep = speakingStepRef.current;
      if (speakingRef.current && spokenStep !== null) {
        const boundary = [7.84, 13.6, 22][spokenStep];
        if (loopTime.current < boundary && nextTime >= boundary) nextTime = boundary - 0.001;
      }
      loopTime.current = nextTime;
      const t = loopTime.current;
      const isResetting = t >= 22;
      setResetting(isResetting);
      if (anatomy.current) anatomy.current.inert = isResetting;
      progress.current = progressAt(t);
      const chapter = t < BOUNDS[1] ? 0 : t < BOUNDS[2] ? 1 : 2;
      const fraction = Math.min(1, (t - BOUNDS[chapter]) / (BOUNDS[chapter + 1] - BOUNDS[chapter]));
      viewer.current?.style.setProperty("--chapter-progress", fraction.toFixed(3));
      const opacity = !isResetting ? 1 : t < 22.4 ? 1 - (t - 22) / 0.4 : t < 23.5 ? 0 : (t - 23.5) / 0.5;
      viewer.current?.style.setProperty("--airway-visibility", String(opacity));
      setValue(Math.floor(progress.current * 100));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, speakingRef, speakingStepRef]);

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    onMotion();
    onVisibility();
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.intersectionRatio >= 0.3) setHasEntered(true);
    }, { threshold: [0, 0.3], rootMargin: "-80px 0px 0px" });
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  // Jump straight to a chapter (from the step buttons).
  const jump = (i: number) => {
    loopTime.current = BOUNDS[i] + (i === 0 ? 0 : 0.01);
    progress.current = progressAt(loopTime.current);
    viewer.current?.style.setProperty("--chapter-progress", "0");
    viewer.current?.style.setProperty("--airway-visibility", "1");
    setResetting(false);
    setValue(Math.floor(progress.current * 100));
  };

  return (
    <div ref={viewer} className={styles.viewer} data-airway-state={step} data-autoplay="true" data-playback={playing ? "playing" : "paused"}>
      <div className={styles.figure}>
        <div ref={stage} className={styles.stage}>
          <div ref={anatomy} className={styles.anatomy}>
            <AirwayScene progress={progress} value={value} paused={!playing} labelsVisible onReady={onReady} onError={onError} onInspectChange={onInspectChange} />
            {sceneState !== "ready" && <div className={styles.fallback}><AnatomyFallback open={step > 0} /><span className={styles.loading}>{sceneState === "loading" ? "Preparing your 3D view…" : "Simplified anatomy view"}</span></div>}
          </div>
        </div>
      </div>
      <div className={styles.story}>
        <div className={styles.storyBody}>
          <div className={styles.storyCopy} key={step}>
            <h3>{steps[step].title}</h3>
            <p className={styles.description}>{steps[step].body}</p>
          </div>
        </div>

        <ol className={styles.steps} aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s.label}>
              <button type="button" className={styles.stepButton} onClick={() => jump(i)} aria-current={i === step ? "step" : undefined} data-state={i < step ? "done" : i === step ? "active" : "next"}>
                <span className={styles.stepText}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </span>
                <span className={styles.stepBar} aria-hidden><span /></span>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.controls}>
          <button type="button" className={styles.iconButton} onClick={() => setUserPaused((v) => !v)} aria-label={userPaused ? "Play the animation" : "Pause the animation"}>
            {userPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
          </button>
          {narration.supported && sceneState !== "loading" && (
            <button type="button" className={styles.soundButton} onClick={narration.toggle} aria-pressed={narration.enabled} aria-label={narration.enabled ? "Turn off spoken explanation" : "Listen to the explanation"}>
              <span className={styles.soundIcon}>{narration.enabled ? <Volume2 size={15} aria-hidden /> : <Headphones size={15} aria-hidden />}</span>
              <span className={styles.soundLabel}>{narration.enabled ? "Listening" : "Listen"}</span>
              <span className={styles.soundWaves} aria-hidden data-active={narration.enabled}><span /><span /><span /><span /></span>
            </button>
          )}
          <span className={styles.hint}>Tap a part to learn more</span>
        </div>
      </div>
      <p className="sr-only">The animation repeats while this section is visible. As the lower jaw and tongue move forward, the space behind the tongue increases. Click an anatomical part to learn its role, or use the focused part labels with your keyboard. Opening an explanation stops the animation while you read. Listen enables spoken explanations.</p>
    </div>
  );
}

/** Retains an understandable explanation when a device cannot create a WebGL context. */
function AnatomyFallback({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 520 440" role="img" aria-label="Simplified side view of the airway, tongue, and jaw" className={styles.fallbackImage}>
      <defs><linearGradient id="airway-fallback-skin" x1="0" x2="1"><stop stopColor="#bc8f7c" /><stop offset="1" stopColor="#f2d8c7" /></linearGradient><linearGradient id="airway-fallback-tongue" x1="0" y1="0" x2="0.6" y2="1"><stop stopColor="#e3a593" /><stop offset="1" stopColor="#9d4d55" /></linearGradient></defs>
      <path d="M164 30C265-12 365 30 369 112L392 167 419 193Q426 204 410 210L392 216 401 236 391 250Q413 293 376 310C338 323 325 353 323 412H180Q180 358 151 286C111 192 111 91 164 30Z" fill="url(#airway-fallback-skin)" opacity=".9" />
      <path d="M167 69C223 17 345 41 348 115L358 161 276 177 235 222 235 410H205L207 222Q176 176 167 69" fill="#132e3b" />
      <path d="M386 188Q320 162 270 190Q242 209 244 269L244 410" fill="none" stroke="#81d6dc" strokeWidth={open ? 17 : 6} opacity=".6" />
      <g transform={open ? "translate(15 0)" : "translate(0 0)"}><path d="M378 254C369 218 305 206 273 239C248 264 249 295 272 309C309 329 373 301 378 254" fill="url(#airway-fallback-tongue)" /><path d="M262 198L274 283Q286 319 374 305L383 285" fill="none" stroke="#e9dfca" strokeWidth="13" strokeLinecap="round" /></g>
      <path d="M280 207L386 208 389 231" stroke="#eee9d8" strokeWidth="12" fill="none" />
      {[0,1,2,3,4,5].map((i) => <rect key={i} x={171 + i * 2} y={220 + i * 30} width="28" height="22" rx="6" fill="#d5cfbb" />)}
    </svg>
  );
}
