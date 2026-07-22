import { AnimatePresence, motion } from "framer-motion";
import type { RouterResponse } from "@/lib/viewContract";

/**
 * ResponseComposition — Rung 2 of the response ladder (see "The response
 * ladder" in docs/codebase-ground-truth.md).
 *
 * Renders the three bounded text elements above the section cards:
 * restated_question, answer, and evidence_intro. All three are either
 * templated (restated_question), assembled only from verified case-study
 * facts (answer — see hardcodedRouter.ts's CASE_STUDY_FACTS), or a fixed
 * frontend constant (evidence_intro, kept here — NOT returned by the
 * router — specifically so it can never drift).
 *
 * Confidence gating (docs/view-schema-contract.md):
 *   >= 0.7        restated_question + answer + evidence_intro
 *   0.4 - 0.7     restated_question + "Here's the closest matching work:"
 *   < 0.4         nothing (Rung 1 behavior — sections render under no
 *                 generated text at all)
 */

const EVIDENCE_INTRO = "Selected work below shows this in practice.";
const CLOSEST_MATCH_LABEL = "Here's the closest matching work:";

const HIGH_CONFIDENCE = 0.7;
const LOW_CONFIDENCE = 0.4;

interface ResponseCompositionProps {
  response: RouterResponse;
  /** The exact question this response answers — used only to key the transition. */
  askedKey: string;
}

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function ResponseComposition({ response, askedKey }: ResponseCompositionProps) {
  const { confidence, restated_question, answer } = response;

  if (confidence < LOW_CONFIDENCE) return null;

  const showAnswer = confidence >= HIGH_CONFIDENCE && !!answer;
  const evidenceLabel = confidence >= HIGH_CONFIDENCE ? EVIDENCE_INTRO : CLOSEST_MATCH_LABEL;

  return (
    <div className="container">
      <div className="rc-wrap">
        <AnimatePresence mode="wait">
          <motion.div key={askedKey} initial="initial" animate="animate" exit="exit">
            {restated_question && (
              <motion.p
                className="rc-restated"
                variants={fadeSlide}
                transition={{ duration: 0.25 }}
              >
                {restated_question}
              </motion.p>
            )}
            {showAnswer && (
              <motion.p
                className="rc-answer"
                variants={fadeSlide}
                transition={{ duration: 0.25, delay: 0.08 }}
              >
                {answer}
              </motion.p>
            )}
            <motion.p
              className="rc-evidence"
              variants={fadeSlide}
              transition={{ duration: 0.25, delay: showAnswer ? 0.16 : 0.08 }}
            >
              {evidenceLabel}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .rc-wrap { margin: 0 0 32px; max-width: 760px; padding-top: 8px; }
        .rc-restated {
          font-style: italic;
          font-size: 14px;
          color: var(--tc-neutral-600, #9a9ca0);
          margin: 0 0 8px;
        }
        .rc-answer {
          font-size: 17px;
          font-weight: 500;
          color: var(--tc-neutral-900, #f2f2f3);
          margin: 0 0 12px;
          line-height: 1.5;
        }
        .rc-evidence {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--tc-neutral-600, #9a9ca0);
          margin: 0;
        }
        [data-bs-theme="light"] .rc-restated,
        [data-bs-theme="light"] .rc-evidence { color: #626568; }
        [data-bs-theme="light"] .rc-answer { color: #0e0e0f; }
      `}</style>
    </div>
  );
}
