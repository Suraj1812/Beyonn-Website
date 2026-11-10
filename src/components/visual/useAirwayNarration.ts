"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type NarrationOptions = {
  step: number;
  text: string;
  suspended: boolean;
  detailText?: string | null;
};

/** Prefer an English natural voice when one is installed; the browser remains the fallback. */
function englishVoice(voices: SpeechSynthesisVoice[]) {
  const novelty = /\b(?:grandma|grandpa|albert|boing|bahh|bells|bubbles|cellos|deranged|hysterical|trinoids|whisper|zarvox|wobble|giggle|jester|good\s?news|bad\s?news|pipe\s?organ)\b/i;
  const score = (voice: SpeechSynthesisVoice) => {
    // Quality tiers dominate local/default flags: a compact installed voice
    // should not displace an available natural or online English voice.
    const quality = /natural|neural|premium|enhanced/i.test(voice.name) ? 1000
      : /\bgoogle\b|\bmicrosoft\b.*\bonline\b/i.test(voice.name) ? 500
      : /\bsamantha\b/i.test(voice.name) ? 100 : 50;
    return quality + (voice.default ? 5 : 0) + (voice.localService ? 2 : 0);
  };
  return voices.filter((voice) => /^en(?:[-_]|$)/i.test(voice.lang) && !novelty.test(voice.name))
    .sort((a, b) => score(b) - score(a))[0];
}

/** Opt-in narration. Ref updates let the animation wait for speech without a render per word. */
export function useAirwayNarration(options: NarrationOptions) {
  const { step, text, suspended, detailText } = options;
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const speakingRef = useRef(false);
  const speakingStepRef = useRef<number | null>(null);
  const mounted = useRef(false);
  const enabledRef = useRef(false);
  const latest = useRef(options);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const lastKey = useRef<string | null>(null);
  const watchdog = useRef<number | null>(null);

  const stop = useCallback((resetKey = true) => {
    const previous = utterance.current;
    // Invalidate handlers before cancel(), which may synchronously emit an error.
    utterance.current = null;
    if (previous) {
      previous.onend = previous.onerror = null;
    }
    if (watchdog.current !== null) {
      window.clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    speakingRef.current = false;
    speakingStepRef.current = null;
    if (resetKey) lastKey.current = null;
    if (previous) {
      try { synthesis.current?.cancel(); } catch { /* The device may have lost its speech service. */ }
    }
  }, []);

  const speakCurrent = useCallback(() => {
    const engine = synthesis.current;
    const current = latest.current;
    if (!mounted.current || !enabledRef.current || !engine || current.suspended || document.hidden) return;
    const detail = current.detailText?.trim();
    const content = detail || current.text.trim();
    if (!content) { stop(); return; }
    const key = detail ? `detail:${detail}` : `step:${current.step}:${content}`;
    // Also retain the key after completion, so ordinary parent renders do not repeat a chapter.
    if (lastKey.current === key) return;
    stop(false);
    lastKey.current = key;

    try {
      const speech = new window.SpeechSynthesisUtterance(content);
      try { voices.current = engine.getVoices(); } catch { /* Use the last voice list or the default. */ }
      const voice = englishVoice(voices.current);
      if (voice) speech.voice = voice;
      speech.lang = voice?.lang || "en-US";
      speech.rate = 0.91;
      speech.pitch = 1;
      speech.volume = 1;
      utterance.current = speech;
      // Set these before speak(): the caller can safely hold the chapter boundary immediately.
      speakingRef.current = true;
      speakingStepRef.current = detail ? null : current.step;

      const finish = () => {
        if (utterance.current !== speech) return;
        utterance.current = null;
        speech.onend = speech.onerror = null;
        if (watchdog.current !== null) window.clearTimeout(watchdog.current);
        watchdog.current = null;
        speakingRef.current = false;
        speakingStepRef.current = null;
      };
      speech.onend = finish;
      speech.onerror = (event) => {
        if (utterance.current !== speech) return;
        finish();
        // A browser can expose the API but refuse audio; let the user explicitly retry.
        if (mounted.current && event.error !== "interrupted" && event.error !== "canceled") {
          enabledRef.current = false;
          setEnabled(false);
        }
      };
      const words = content.split(/\s+/).length;
      watchdog.current = window.setTimeout(() => {
        if (utterance.current === speech) stop(false);
      }, Math.min(60000, Math.max(15000, words * 650 + 8000)));
      if (engine.paused) engine.resume();
      engine.speak(speech);
    } catch {
      stop(false);
      if (mounted.current) {
        enabledRef.current = false;
        setEnabled(false);
      }
    }
  }, [stop]);

  useEffect(() => {
    mounted.current = true;
    const available = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability is unavailable during server rendering.
    setSupported(available);
    if (!available) return () => { mounted.current = false; };
    const engine = window.speechSynthesis;
    synthesis.current = engine;
    const refreshVoices = () => {
      try { voices.current = engine.getVoices(); } catch { voices.current = []; }
      // Late voice discovery improves the next utterance without interrupting one already playing.
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else speakCurrent();
    };
    refreshVoices();
    engine.addEventListener("voiceschanged", refreshVoices);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      enabledRef.current = false;
      stop();
      synthesis.current = null;
      engine.removeEventListener("voiceschanged", refreshVoices);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [speakCurrent, stop]);

  useLayoutEffect(() => {
    latest.current = { step, text, suspended, detailText };
    if (suspended) stop();
    else if (enabledRef.current) speakCurrent();
  }, [step, text, suspended, detailText, enabled, speakCurrent, stop]);

  const toggle = useCallback(() => {
    if (!mounted.current || !synthesis.current) return;
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) speakCurrent(); // Keep initial speech inside the enabling user gesture.
    else stop();
  }, [speakCurrent, stop]);

  return { supported, enabled, toggle, speakingRef, speakingStepRef };
}
