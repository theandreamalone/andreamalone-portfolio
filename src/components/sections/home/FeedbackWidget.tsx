import { useState } from "react";
import { logFeedback } from "@/lib/events";

/**
 * FeedbackWidget — Reasoning Panel spec §4 (2026-07-22).
 *
 * Same architecture as Contact.tsx (status state machine, client-side
 * length validation, fail-soft error copy), different table. Thumbs up
 * logs immediately with no form (comment: null); thumbs down opens a
 * single-field form before logging. Both ratings are logged — up gives
 * D9's tag-activation signal a positive counterweight to complaints, not
 * just down.
 */

/**
 * `view` (which UI is showing) and `status` (network state of the current
 * submit) are separate on purpose. They were briefly one enum with a
 * "down-form" member; that broke the moment a down-submit set the network
 * state to "sending" — "sending" !== "down-form", so the form itself would
 * vanish back to the thumbs prompt mid-submit instead of showing a
 * disabled "Sending…" button. TypeScript's exhaustiveness check on a
 * follow-up narrowed comparison caught it.
 */
type View = "prompt" | "form";
type Status = "idle" | "sending" | "sent" | "error";

const COMMENT_MIN = 1;
const COMMENT_MAX = 1000;

export default function FeedbackWidget({ eventId }: { eventId: string }) {
  const [view, setView] = useState<View>("prompt");
  const [status, setStatus] = useState<Status>("idle");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleUp() {
    setStatus("sending");
    const ok = await logFeedback(eventId, "up", null);
    if (!ok) {
      setStatus("error");
      setError("That didn't send. Please try again.");
      return;
    }
    setStatus("sent");
  }

  async function handleDownSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = comment.trim();
    if (trimmed.length < COMMENT_MIN || trimmed.length > COMMENT_MAX) {
      setError(`Say a bit more (up to ${COMMENT_MAX} characters).`);
      return;
    }
    setStatus("sending");
    const ok = await logFeedback(eventId, "down", trimmed);
    if (!ok) {
      setStatus("error");
      setError("That didn't send. Please try again.");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="feedback-sent" role="status">
        Thanks — noted.
      </p>
    );
  }

  return (
    <div className="feedback-widget">
      {view === "prompt" ? (
        <div className="feedback-prompt">
          <span className="feedback-label">Was this helpful?</span>
          <button
            type="button"
            className="feedback-btn"
            aria-label="Yes, this was helpful"
            onClick={handleUp}
            disabled={status === "sending"}
          >
            <ThumbIcon direction="up" />
          </button>
          <button
            type="button"
            className="feedback-btn"
            aria-label="No, this missed the mark"
            onClick={() => setView("form")}
            disabled={status === "sending"}
          >
            <ThumbIcon direction="down" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleDownSubmit} className="feedback-down-form" noValidate>
          <label htmlFor="feedback-comment" className="feedback-label">
            Tell me more about what missed the mark.
          </label>
          <textarea
            id="feedback-comment"
            className="feedback-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={COMMENT_MAX}
          />
          <button type="submit" className="feedback-submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Submit"}
          </button>
        </form>
      )}
      {error && (
        <p className="feedback-error" role="alert">
          {error}
        </p>
      )}

      <style>{`
        .feedback-widget { margin: 16px 0 0; max-width: 760px; }
        .feedback-prompt { display: flex; align-items: center; gap: 10px; }
        .feedback-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--tc-neutral-600, #9a9ca0);
        }
        [data-bs-theme="light"] .feedback-label { color: #626568; }
        .feedback-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--tc-neutral-300, #3a3b3e);
          background: none;
          color: var(--tc-neutral-700, #c4c5c7);
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }
        .feedback-btn:hover { background: var(--tc-neutral-200, #1c1d1f); color: var(--tc-neutral-900, #f2f2f3); }
        [data-bs-theme="light"] .feedback-btn { border-color: #d8d9db; color: #45484b; }
        [data-bs-theme="light"] .feedback-btn:hover { background: #f0f0f1; color: #0e0e0f; }
        .feedback-btn:disabled { opacity: 0.5; cursor: default; }

        .feedback-down-form { display: flex; flex-direction: column; gap: 8px; max-width: 420px; }
        .feedback-textarea {
          font-size: 13px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--tc-neutral-300, #3a3b3e);
          background: transparent;
          color: inherit;
          resize: vertical;
        }
        [data-bs-theme="light"] .feedback-textarea { border-color: #d8d9db; }
        .feedback-submit {
          align-self: flex-start;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 999px;
          border: none;
          background: var(--tc-neutral-900, #0e0e0f);
          color: var(--tc-neutral-050, #fff);
          cursor: pointer;
        }
        .feedback-submit:disabled { opacity: 0.6; cursor: default; }
        .feedback-error { font-size: 12px; color: #e2004a; margin: 4px 0 0; }
        .feedback-sent { font-size: 12px; font-weight: 600; color: var(--tc-neutral-600, #9a9ca0); margin: 16px 0 0; }
      `}</style>
    </div>
  );
}

function ThumbIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={direction === "down" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path
        d="M7 22h11a2 2 0 0 0 2-1.5l2-7a2 2 0 0 0-2-2.5h-6l1-5a2 2 0 0 0-2-2.3L11 5l-4 6v11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7 22H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
