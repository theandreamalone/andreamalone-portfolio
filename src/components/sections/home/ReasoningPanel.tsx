import { useId, useState } from "react";

/**
 * ReasoningPanel + HilBanner — Reasoning Panel spec §3 (2026-07-22).
 *
 * Phase 1: reasoning[] comes from hardcodedRouter.ts's composeReasoning(),
 * synthesized from the real response (matched intent, sections selected,
 * confidence/HIL outcome) — never decorative filler. Phase 2 swaps the
 * *source* to real streamed stage markers from the Edge Function; this
 * component's contract doesn't change (see viewContract.ts's RouterResponse
 * doc comment on hil_triggered/reasoning).
 *
 * Expand/collapse uses CSS grid-template-rows (0fr -> 1fr), not a JS
 * animation library — honors prefers-reduced-motion for free via a plain
 * media query, no framer-motion/GSAP branch to maintain for one disclosure
 * widget.
 */

export interface ReasoningPanelProps {
  /** Human-readable, from INTENT_LABELS — NOT the raw snake_case tag. */
  intentLabel: string;
  confidence: number;
  reasoning: string[];
  sectionCount: number;
  hilTriggered: boolean;
}

const HIL_BANNER_COPY = "This one's routed to a human — Andrea will follow up.";

export function HilBanner({ hilTriggered }: { hilTriggered: boolean }) {
  if (!hilTriggered) return null;
  // The <style> tag must be a SIBLING of the role="status" div, never a
  // descendant — textContent (and what a screen reader announces for a live
  // region) concatenates every descendant text node, including the raw CSS
  // text inside a nested <style>. Caught by reading the rendered
  // accessibility-tree text during verification, not by sight (a <style>
  // tag renders no visible text, so this was invisible on screen).
  return (
    <>
      <div className="hil-banner" role="status">
        {HIL_BANNER_COPY}
      </div>
      <style>{`
        .hil-banner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 999px;
          margin: 0 0 12px;
          background: rgba(226, 0, 116, 0.12);
          color: #e20074;
        }
        [data-bs-theme="light"] .hil-banner { background: rgba(226, 0, 116, 0.08); }
      `}</style>
    </>
  );
}

export default function ReasoningPanel({
  intentLabel,
  confidence,
  reasoning,
  sectionCount,
  hilTriggered,
}: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <div className="reasoning-panel">
      <button
        type="button"
        className="reasoning-trigger"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`reasoning-caret${open ? " is-open" : ""}`} aria-hidden="true" />
        Why this answer
      </button>

      <div id={regionId} className={`reasoning-region${open ? " is-open" : ""}`}>
        <div className="reasoning-region-inner">
          <dl className="reasoning-facts">
            <div className="reasoning-fact">
              <dt>Matched to</dt>
              <dd>{intentLabel}</dd>
            </div>
            <div className="reasoning-fact">
              <dt>Confidence</dt>
              <dd>{Math.round(confidence * 100)}%</dd>
            </div>
            <div className="reasoning-fact">
              <dt>Sections</dt>
              <dd>{sectionCount} matched</dd>
            </div>
          </dl>
          <ol className="reasoning-steps">
            {reasoning.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      </div>

      <style>{`
        .reasoning-panel { margin: 0 0 24px; max-width: 760px; }
        .reasoning-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--tc-neutral-600, #9a9ca0);
          cursor: pointer;
        }
        .reasoning-trigger:hover { color: var(--tc-neutral-900, #f2f2f3); }
        [data-bs-theme="light"] .reasoning-trigger { color: #626568; }
        [data-bs-theme="light"] .reasoning-trigger:hover { color: #0e0e0f; }

        .reasoning-caret {
          width: 8px;
          height: 8px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(-45deg);
          transition: transform 0.15s ease;
        }
        .reasoning-caret.is-open { transform: rotate(45deg); }

        /* Grid-rows disclosure: 0fr collapsed, 1fr open. No fixed height to
           measure, no JS animation loop — the grid track itself animates. */
        .reasoning-region {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.25s ease;
        }
        .reasoning-region.is-open { grid-template-rows: 1fr; }
        .reasoning-region-inner { overflow: hidden; min-height: 0; }

        @media (prefers-reduced-motion: reduce) {
          .reasoning-region { transition: none; }
          .reasoning-caret { transition: none; }
        }

        .reasoning-facts {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 24px;
          margin: 12px 0 10px;
          padding: 0;
        }
        .reasoning-fact { margin: 0; }
        .reasoning-fact dt {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--tc-neutral-600, #9a9ca0);
          margin: 0 0 2px;
        }
        .reasoning-fact dd {
          font-size: 13px;
          font-weight: 500;
          color: var(--tc-neutral-900, #f2f2f3);
          margin: 0;
        }
        [data-bs-theme="light"] .reasoning-fact dt { color: #626568; }
        [data-bs-theme="light"] .reasoning-fact dd { color: #0e0e0f; }

        .reasoning-steps {
          margin: 0 0 4px;
          padding-left: 18px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--tc-neutral-700, #c4c5c7);
        }
        [data-bs-theme="light"] .reasoning-steps { color: #45484b; }
      `}</style>
    </div>
  );
}
