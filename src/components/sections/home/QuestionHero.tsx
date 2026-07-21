/**
 * QuestionHero — the home hero (approved template 2026-07-20).
 *
 * The question field IS the hero: submitting routes to /adaptive?q=... where
 * the page composes its answer (D3: free-text path is core; the static home
 * stays the D6 baseline — this hero is static, only the link is adaptive).
 *
 * Voice: the mic button feeds the same ask() path as typing (pattern copied
 * from AdaptiveHome — useVoiceInput + useMicLevel). While listening, the
 * magenta/amber glow is forced on and audio-reactive via --qh-level, so the
 * glow genuinely signals "I'm listening" instead of being a focus style only.
 * Unsupported browsers get VoiceUnavailable (visible degraded state, not a
 * hidden feature).
 *
 * Headshot: drop the real image at public/media/site/headshot.webp
 * (4:5 — process via the testimonials preset, 560×740) and it replaces
 * the placeholder automatically via onError fallback.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceUnavailable } from '@/components/VoiceUnavailable';
import WaveformIcon from '@/components/icons/WaveformIcon';
import { useMicLevel } from '@/lib/voice/useMicLevel';
import { useVoiceInput } from '@/lib/voice/useVoiceInput';

const CHIPS = [
  'Show me voice UX',
  'Has she led teams?',
  'AI response architecture',
  'Just show me everything',
];

/** Endpointing pause between a final voice transcript and auto-submit. */
const VOICE_SUBMIT_DEBOUNCE_MS = 900;

export default function QuestionHero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [imgOk, setImgOk] = useState(true);

  const mic = useMicLevel();

  const ask = (question: string) => {
    const query = question.trim();
    navigate(query ? `/adaptive?q=${encodeURIComponent(query)}` : '/adaptive');
  };

  const voice = useVoiceInput((finalText) => {
    setQ(finalText);
    mic.stop();
    window.setTimeout(() => ask(finalText), VOICE_SUBMIT_DEBOUNCE_MS);
  });

  const startVoice = () => {
    voice.start();
    mic.start();
  };

  const stopVoice = () => {
    voice.stop();
    mic.stop();
  };

  return (
    <section className="question-hero sec-padding">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-7">
            <p className="qh-eyebrow">
              <strong>Andrea Malone</strong> · Lead AI Product Designer
            </p>
            <h1 className="qh-title">
              I design AI-native interfaces that adapt to intent without
              sacrificing trust.
            </h1>
            <p className="qh-support">
              This page is one of them. Ask what you came to find out, and it
              composes its answer from sixteen years of shipped evidence.
            </p>

            <form
              className="qh-ask"
              onSubmit={(e) => {
                e.preventDefault();
                ask(q);
              }}
            >
              <label htmlFor="qh-q" className="qh-label">
                Ask this site a question
              </label>
              <div
                className={`qh-field${voice.listening ? ' is-listening' : ''}`}
                style={{ '--qh-level': mic.level } as React.CSSProperties}
              >
                <input
                  id="qh-q"
                  type="text"
                  value={voice.interim || q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Has she designed human-in-the-loop AI?"
                  autoComplete="off"
                />
                {voice.supported ? (
                  <button
                    type="button"
                    className="qh-mic"
                    onClick={voice.listening ? stopVoice : startVoice}
                    aria-pressed={voice.listening}
                    aria-label={voice.listening ? 'Stop listening' : 'Ask by voice'}
                  >
                    {voice.listening ? '◼' : <WaveformIcon />}
                  </button>
                ) : (
                  <span className="qh-mic qh-mic-unavailable">
                    <VoiceUnavailable />
                  </span>
                )}
                <button type="submit" className="qh-submit">Ask</button>
              </div>
              <span className="qh-sr" role="status" aria-live="polite">
                {voice.listening ? 'Listening' : ''}
              </span>
            </form>

            <div className="qh-chips" aria-label="Example questions">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="qh-chip"
                  onClick={() => ask(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <p className="qh-boundary">
              The AI selects from written evidence — it never writes a word.
            </p>
          </div>

          <div className="col-lg-5">
            <div className="qh-portrait">
              {imgOk ? (
                <img
                  src="/media/site/headshot.webp"
                  alt="Andrea Malone"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <span className="qh-portrait-placeholder">
                  Headshot placeholder
                  <br />
                  4:5 · public/media/site/headshot.webp
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .question-hero {
          --qh-line: rgba(255,255,255,0.1);
          --qh-chip: rgba(255,255,255,0.06);
          --qh-glow-a: rgba(226,0,116,0.35);
          --qh-glow-b: rgba(255,176,32,0.28);
        }
        .qh-eyebrow {
          font-size: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--tc-neutral-600, #9a9ca0);
          margin-bottom: 20px;
        }
        .qh-eyebrow strong { font-weight: 600; }
        .qh-title {
          font-size: clamp(34px, 4.6vw, 56px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        .qh-support {
          font-size: 18px;
          line-height: 1.6;
          color: var(--tc-neutral-600, #9a9ca0);
          max-width: 46ch;
          margin-bottom: 36px;
        }
        .qh-ask { margin-bottom: 16px; max-width: 620px; }
        .qh-label {
          display: block;
          font-size: 14px;
          color: var(--tc-neutral-600, #9a9ca0);
          margin-bottom: 12px;
        }
        .qh-field { position: relative; }
        .qh-field input {
          width: 100%;
          background: var(--tc-bg-2, #17181a);
          border: 1px solid var(--qh-line);
          border-radius: 999px;
          padding: 18px 168px 18px 24px;
          font: inherit;
          font-size: 17px;
          color: inherit;
          outline: none;
          transition: border-color .2s ease, box-shadow .3s ease;
        }
        .qh-field input:focus,
        .qh-field.is-listening input {
          border-color: rgba(255,255,255,0.25);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.04),
                      0 0 calc(32px + 40px * var(--qh-level, 0)) var(--qh-glow-a),
                      0 8px calc(48px + 48px * var(--qh-level, 0)) var(--qh-glow-b);
        }
        .qh-field { --qh-level: 0; }
        .qh-submit {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          border-radius: 999px;
          padding: 12px 24px;
          font: inherit;
          font-size: 15px;
          font-weight: 600;
          background: var(--tc-neutral-0, #fff);
          color: var(--tc-neutral-1000, #0f1011);
          cursor: pointer;
        }
        .qh-mic {
          position: absolute;
          right: 100px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--qh-line);
          border-radius: 999px;
          background: transparent;
          color: inherit;
          font-size: 16px;
          cursor: pointer;
          transition: border-color .15s ease;
        }
        .qh-mic:hover { border-color: rgba(255,255,255,0.3); }
        .qh-mic[aria-pressed="true"] {
          border-color: var(--qh-glow-a);
          background: rgba(226,0,116,0.12);
        }
        .qh-mic-unavailable { border: 0; background: transparent; }
        .qh-sr {
          position: absolute;
          width: 1px; height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .qh-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
        .qh-chip {
          border: 1px solid var(--qh-line);
          background: var(--qh-chip);
          color: var(--tc-neutral-600, #9a9ca0);
          border-radius: 999px;
          padding: 9px 16px;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: color .15s ease, border-color .15s ease;
        }
        .qh-chip:hover { color: inherit; border-color: rgba(255,255,255,0.3); }
        .qh-boundary {
          font-size: 14px;
          color: var(--tc-neutral-600, #9a9ca0);
        }
        .qh-boundary::before {
          content: "";
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--qh-glow-a), var(--qh-glow-b));
          margin-right: 9px;
          vertical-align: 1px;
        }
        .qh-portrait {
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--qh-line);
          background:
            radial-gradient(120% 90% at 70% 10%, rgba(226,0,116,0.12), transparent 60%),
            radial-gradient(120% 90% at 20% 100%, rgba(255,176,32,0.10), transparent 60%),
            var(--tc-bg-2, #17181a);
          display: grid;
          place-items: center;
          max-width: 420px;
          margin-inline: auto;
        }
        .qh-portrait img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .qh-portrait-placeholder {
          color: var(--tc-neutral-600, #9a9ca0);
          font-size: 14px;
          text-align: center;
          line-height: 1.5;
        }
        @media (prefers-reduced-motion: reduce) {
          .qh-field input { transition: none; }
          .qh-field.is-listening input {
            box-shadow: 0 0 0 4px rgba(255,255,255,0.04),
                        0 0 44px var(--qh-glow-a),
                        0 8px 60px var(--qh-glow-b);
          }
        }
      `}</style>
    </section>
  );
}
