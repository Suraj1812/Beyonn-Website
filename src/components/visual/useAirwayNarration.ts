"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type NarrationOptions = {
  step: number;
  audioSrc: string;
  paused?: boolean;
  suspended: boolean;
};

/** Opt-in recorded narration. Chapter progress follows the actual audio duration. */
export function useAirwayNarration(options: NarrationOptions) {
  const { step, audioSrc, suspended, paused = false } = options;
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const speakingRef = useRef(false);
  const speakingStepRef = useRef<number | null>(null);
  const mounted = useRef(false);
  const enabledRef = useRef(false);
  const latest = useRef(options);
  const audio = useRef<HTMLAudioElement | null>(null);
  const clearEvents = useRef<(() => void) | null>(null);
  const epoch = useRef(0);
  const recordedStep = useRef<number | null>(null);
  const lastKey = useRef<string | null>(null);

  const stop = useCallback(() => {
    epoch.current += 1;
    clearEvents.current?.();
    clearEvents.current = null;
    audio.current?.pause();
    if (audio.current) audio.current.currentTime = 0;
    recordedStep.current = null;
    speakingRef.current = false;
    speakingStepRef.current = null;
    lastKey.current = null;
  }, []);

  const disable = useCallback(() => {
    stop();
    enabledRef.current = false;
    if (mounted.current) setEnabled(false);
  }, [stop]);

  const playCurrent = useCallback(() => {
    const current = latest.current;
    if (!mounted.current || !enabledRef.current || current.suspended || document.hidden) return;
    const key = `${current.step}:${current.audioSrc}`;
    if (lastKey.current === key) return;
    stop();
    lastKey.current = key;
    // Keep a single user-activated element across chapter changes on mobile.
    const recording = audio.current ?? new Audio();
    audio.current = recording;
    recording.setAttribute("src", current.audioSrc);
    recordedStep.current = current.step;
    speakingRef.current = true;
    speakingStepRef.current = current.step;
    const currentEpoch = epoch.current;
    const finish = () => {
      if (epoch.current !== currentEpoch) return;
      speakingRef.current = false;
      speakingStepRef.current = null;
    };
    const fail = () => {
      if (epoch.current === currentEpoch) disable();
    };
    recording.addEventListener("ended", finish);
    recording.addEventListener("error", fail);
    clearEvents.current = () => {
      recording.removeEventListener("ended", finish);
      recording.removeEventListener("error", fail);
    };
    if (!current.paused) void recording.play().catch(fail);
  }, [disable, stop]);

  const getRecordedProgress = useCallback(() => {
    const recording = audio.current;
    if (!recording || recordedStep.current === null) return null;
    return {
      step: recordedStep.current,
      fraction: Number.isFinite(recording.duration) && recording.duration > 0
        ? Math.min(1, recording.currentTime / recording.duration) : 0,
      ended: recording.ended,
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability is unavailable during server rendering.
    setSupported(typeof window.Audio === "function");
    const onVisibility = () => { if (document.hidden) disable(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      disable();
      audio.current?.removeAttribute("src");
      audio.current?.load();
      audio.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disable]);

  useLayoutEffect(() => {
    latest.current = { step, audioSrc, suspended, paused };
    if (suspended) disable();
    else if (enabledRef.current) playCurrent();
  }, [step, audioSrc, suspended, paused, enabled, disable, playCurrent]);

  useEffect(() => {
    if (!enabled || suspended) return;
    const recording = audio.current;
    if (paused) recording?.pause();
    else if (recording && recording.paused && !recording.ended) {
      const currentEpoch = epoch.current;
      void recording.play().catch(() => { if (epoch.current === currentEpoch) disable(); });
    }
  }, [paused, enabled, suspended, step, disable]);

  const toggle = useCallback(() => {
    if (!mounted.current) return;
    if (enabledRef.current) disable();
    else {
      enabledRef.current = true;
      setEnabled(true);
      playCurrent(); // Initial playback stays inside the enabling user gesture.
    }
  }, [disable, playCurrent]);

  return { supported, enabled, toggle, speakingRef, speakingStepRef, getRecordedProgress };
}
