/**
 * QuestionHero — the home hero (approved template 2026-07-20).
 *
 * The question field IS the hero: submitting routes to /adaptive?q=... where
 * the page composes its answer (D3: free-text path is core; the static home
 * stays the D6 baseline — this hero is static, only the link is adaptive).
 *
 * Signature element: the focus glow on the input reuses the magenta/amber
 * audio-reactive glow from the Voice-Ready composer — the site signals
 * "I'm listening" in Andrea's own product vocabulary.
 *
 * Headshot: drop the real image at public/media/site/headshot.webp
 * (4:5 — process via the testimonials preset, 560×740) and it replaces
 * the placeholder automatically via onError fallback.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CHIPS = [
  'Show me voice UX',
  'Has she led teams?',
  'AI response architecture',
  'Just show me everything',
];

export default function QuestionHero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [imgOk, setImgOk] = useState(true);

  const ask = (question: string) => {
    const query = question.trim();
    navigate(query ? `/adaptive?q=${encodeURIComponent(query)}` : '/adaptive');
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
              <label htmlFor="qh-q" className="visually-hidden">
                Ask this site a question
              </label>
              <input
                id="qh-q"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Has she designed human-in-the-loop AI?"
                autoComplete="off"
              />
              <button type="submit">Ask</button>
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
        .qh-ask { position: relative; margin-bottom: 16px; max-width: 620px; }
        .qh-ask input {
          width: 100%;
          background: var(--tc-bg-2, #17181a);
          border: 1px solid var(--qh-line);
          border-radius: 999px;
          padding: 18px 120px 18px 24px;
          font: inherit;
          font-size: 17px;
          color: inherit;
          outline: none;
          transition: border-color .2s ease, box-shadow .3s ease;
        }
        .qh-ask input:focus {
          border-color: rgba(255,255,255,0.25);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.04),
                      0 0 44px var(--qh-glow-a),
                      0 8px 60px var(--qh-glow-b);
        }
        .qh-ask button {
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
          .qh-ask input { transition: none; }
        }
      `}</style>
    </section>
  );
}
