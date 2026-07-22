/**
 * intentFrames.ts — the v1 intent tag set and their `intent_frame` phrases.
 *
 * Doc: docs/intent-tags-v1.md (that doc explains the taxonomy; this file is
 * what the router actually imports). Rung 2 of the response ladder
 * (docs/codebase-ground-truth.md) — `restated_question` is ALWAYS exactly
 * `"You're asking {intent_frame}."` with the frame slotted in verbatim,
 * never paraphrased.
 *
 * `out_of_scope` intentionally has no frame — TypeScript enforces every
 * OTHER tag has one via the Record type below, and restatedQuestionFor()
 * throws if ever called with 'out_of_scope' (it must never be rendered).
 */

export const INTENT_TAGS = [
  'ai_product_experience',
  'ai_design_patterns',
  'accessibility',
  'evaluation_rigor',
  'enterprise_experience',
  'specific_project',
  'technical_capability',
  'process_collaboration',
  'general_overview',
  'out_of_scope',
] as const;

export type IntentTag = (typeof INTENT_TAGS)[number];

type FramedIntentTag = Exclude<IntentTag, 'out_of_scope'>;

/** Seed map — paste-ready per docs/intent-tags-v1.md. */
export const INTENT_FRAMES: Record<FramedIntentTag, string> = {
  ai_product_experience: "about Andrea's experience designing AI products",
  ai_design_patterns:
    "about the AI design patterns Andrea has worked with — trust, transparency, human-in-the-loop",
  accessibility: "about Andrea's accessibility work",
  evaluation_rigor: 'how Andrea evaluates and improves the products she designs',
  enterprise_experience: "about Andrea's enterprise and Fortune 100 experience",
  specific_project: "about a specific project of Andrea's",
  technical_capability: "about Andrea's technical and tooling capabilities",
  process_collaboration: 'how Andrea works — her process and collaboration style',
  general_overview: "for an overview of Andrea's strongest work",
};

/**
 * Slots the authored intent_frame into the fixed restatement template.
 * Never call with 'out_of_scope' — that tag renders no restatement at all
 * (confidence 0 short-circuits before this is reached in the router).
 */
export function restatedQuestionFor(tag: FramedIntentTag): string {
  const frame = INTENT_FRAMES[tag];
  if (!frame) {
    // Guardrail (docs/intent-tags-v1.md #3): a missing mapping must fail
    // loudly, never improvise a phrase.
    throw new Error(`[intentFrames] missing intent_frame mapping for tag "${tag}"`);
  }
  return `You're asking ${frame}.`;
}
