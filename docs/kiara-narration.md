# Kiara airway narration

Generated in Kalpa Labs Console on 11 November 2026 using Kiara and kalpa-tts-1. Scripts match the three `spoken` chapters in `src/components/visual/AirwayModel.tsx`.

| File | Chapter | Duration |
| --- | --- | --- |
| kiara-airway-1.m4a | During sleep | 19.60 seconds |
| kiara-airway-2.m4a | The appliance | 14.24 seconds |
| kiara-airway-3.m4a | The airway / TMD and follow-up | 18.08 seconds |

Original WAV takes: `kalpa-kiara-2026-11-11-11-06-58.wav`, `kalpa-kiara-2026-11-11-11-09-15.wav`, `kalpa-kiara-2026-11-11-11-09-44.wav`. Web assets are AAC mono at 44.1 kHz, approximately 96 kbps, converted with macOS afconvert.

The three main chapters use these static recordings. Anatomical detail popups pause the recording at its current position and resume it when closed; they do not switch to browser speech synthesis. No Kalpa credentials or live generation requests are shipped to visitors.

Verified locally: all three audio resources load, chapter changes preserve the Listen state, switching Listen off stops playback, leaving the section disables narration, returning does not restart it, and no browser errors occurred during these checks. One audio element is reused for successive chapters. While Listen is enabled, animation and step-bar progress follow the recording’s current time and duration. Pause/resume controls both the recording and animation.

## Recorded-only playback follow-up

The narration hook no longer contains browser text-to-speech. A lifecycle harness with simulated media verified opt-in playback, audio-duration progress, pause/resume without losing position, reuse of the activated audio element across chapters, completion, scroll-exit suspension, no restart on return, hidden-tab shutdown, error handling and unmount cleanup. These are code-level media lifecycle tests, not a fresh browser playback or visual check. Browser control remains unavailable in Work settings.
