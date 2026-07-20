import { useState } from 'react';
import './VoiceUnavailable.css';

/**
 * VoiceUnavailable — shown in place of the mic button when
 * SpeechRecognition isn't supported (Firefox, some webviews).
 *
 * Design intent: don't hide the capability — a hidden feature reads as
 * a missing feature. A muted mic with a plain-language explanation
 * signals "this site does voice; your browser doesn't." That framing
 * also serves the portfolio: the affordance itself is evidence of
 * deliberate degraded-state design.
 *
 * Accessibility: real <button> (focusable, keyboard-operable),
 * aria-disabled rather than disabled so screen readers can reach it
 * and hear the explanation. Message appears on hover AND focus, and is
 * announced via the button's accessible name.
 */
export function VoiceUnavailable() {
  const [open, setOpen] = useState(false);

  return (
    <span className="voice-unavailable">
      <button
        type="button"
        className="voice-unavailable__btn"
        aria-disabled="true"
        aria-label="Voice input isn't supported in this browser. Type your question instead."
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="voice-unavailable__icon">
          🎤
        </span>
        <span aria-hidden="true" className="voice-unavailable__slash" />
      </button>
      {open && (
        <span role="tooltip" className="voice-unavailable__tip">
          Voice input isn't supported in this browser — type your question
          instead.
        </span>
      )}
    </span>
  );
}
