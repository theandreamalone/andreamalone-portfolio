import { useEffect, useRef } from 'react';
import './VoiceGlow.css';

export type VoiceMode = 'idle' | 'user-speaking' | 'ai-speaking';

interface VoiceGlowProps {
  mode: VoiceMode;
  /** 0..1 amplitude — mic level or synthetic TTS cadence */
  level: number;
  /** Wraps your input/orb/avatar — glow renders behind it */
  children?: React.ReactNode;
}

/**
 * VoiceGlow — audio-reactive glow ring.
 *
 * Design decisions:
 * - Level writes to a CSS custom property via ref, NOT React state on
 *   every frame — no re-render churn at 60fps.
 * - Two hues so state is legible without motion: user = cool, AI = warm.
 *   A visually hidden live region announces state for screen readers
 *   (state never communicated by color alone).
 * - prefers-reduced-motion: glow becomes a static ring at fixed
 *   intensity per state; amplitude animation is disabled in CSS.
 */
export function VoiceGlow({ mode, level, children }: VoiceGlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty('--voice-level', String(level));
  }, [level]);

  const label =
    mode === 'user-speaking'
      ? 'Listening'
      : mode === 'ai-speaking'
        ? 'Speaking'
        : '';

  return (
    <div ref={ref} className={`voice-glow voice-glow--${mode}`}>
      <div className="voice-glow__ring" aria-hidden="true" />
      <div className="voice-glow__content">{children}</div>
      <span className="voice-glow__sr" role="status" aria-live="polite">
        {label}
      </span>
    </div>
  );
}
