import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useMicLevel — real-time mic amplitude (0..1) via Web Audio AnalyserNode.
 * Drives the user-speaking glow. Call start() when listening begins,
 * stop() when it ends. Releases the mic stream on stop/unmount.
 */
export function useMicLevel() {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setActive(false);
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (audioCtxRef.current) return; // already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256; // small — we only need coarse amplitude
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        // RMS of frequency bins → perceptually decent loudness proxy
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length) / 255;
        // Gate the noise floor, expand the useful range
        const gated = Math.max(0, rms - 0.06) / 0.5;
        setLevel(Math.min(1, gated));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setActive(true);
    } catch {
      // Mic denied or unavailable — glow simply won't react; caller
      // falls back to a non-reactive listening state.
      stop();
    }
  }, [stop]);

  useEffect(() => stop, [stop]); // cleanup on unmount

  return { level, active, start, stop };
}
