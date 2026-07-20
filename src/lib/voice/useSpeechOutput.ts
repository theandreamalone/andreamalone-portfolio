import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useSpeechOutput — speaks pre-authored text via speechSynthesis and
 * emits a glow level while speaking.
 *
 * Why the level is synthetic: browser speechSynthesis exposes no audio
 * stream, so there is nothing to analyse. While speaking, `level` is a
 * speech-cadence oscillator (layered sines + jitter) that reads as
 * natural voice modulation. It pulses on word boundaries where the
 * browser fires them (Chrome does; Safari is inconsistent).
 *
 * Upgrade path: if TTS moves to an API returning audio (ElevenLabs etc.),
 * play it through an <audio> element, attach the same AnalyserNode
 * pattern as useMicLevel, and pass that level instead. VoiceGlow does
 * not care where the number comes from.
 *
 * Claims-integrity note: this speaks resolved MDX block text only —
 * pre-authored, human-reviewed prose. The AI layer still emits IDs, not
 * assertions. Speaking is a render mode, not generation.
 */
/**
 * Voice selection — ranked by observed quality, not alphabet.
 * First match wins. Names are matched as substrings against the
 * device's installed voice list (voices load asynchronously).
 */
const VOICE_PREFERENCES = [
  'Google US English',        // Chrome desktop — natural, warm
  'Microsoft Aria Online',    // Edge neural — most natural of the set
  'Microsoft Jenny Online',   // Edge neural fallback
  'Samantha',                 // macOS/iOS Safari default — clear, neutral
  'Microsoft Zira',           // Windows offline fallback
];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  for (const pref of VOICE_PREFERENCES) {
    const match = voices.find((v) => v.name.includes(pref));
    if (match) return match;
  }
  // Last resort: any en-US voice, else the platform default
  return voices.find((v) => v.lang === 'en-US') ?? voices[0];
}

export function useSpeechOutput() {
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Voice list loads async; resolve once available and cache.
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const resolve = () => {
      voiceRef.current = pickVoice();
    };
    resolve();
    window.speechSynthesis.addEventListener('voiceschanged', resolve);
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', resolve);
  }, []);

  const rafRef = useRef<number>(0);
  const boundaryPulseRef = useRef(0);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
  }, []);

  const startLoop = useCallback(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      // Layered slow/fast sines ≈ syllable + phrase rhythm
      const base =
        0.35 +
        0.2 * Math.sin(t * 3.1) +
        0.15 * Math.sin(t * 7.7 + 1.3) +
        0.08 * Math.sin(t * 13.2 + 0.4);
      // Word-boundary pulse decays quickly
      boundaryPulseRef.current *= 0.9;
      const v = Math.max(0.08, Math.min(1, base + boundaryPulseRef.current));
      setLevel(v);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopLoop();
    setSpeaking(false);
  }, [stopLoop]);

  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window) || !text) return;
      window.speechSynthesis.cancel(); // never queue behind stale speech

      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 1.0;
      u.pitch = 1.0;

      u.onstart = () => {
        setSpeaking(true);
        startLoop();
      };
      u.onboundary = () => {
        boundaryPulseRef.current = 0.25; // kick the glow on each word
      };
      const end = () => {
        setSpeaking(false);
        stopLoop();
      };
      u.onend = end;
      u.onerror = end;

      window.speechSynthesis.speak(u);
    },
    [startLoop, stopLoop],
  );

  useEffect(() => cancel, [cancel]); // stop speech on unmount

  return { speaking, level, speak, cancel };
}
