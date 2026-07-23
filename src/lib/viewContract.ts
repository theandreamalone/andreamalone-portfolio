/**
 * View Schema Contract — v2 (sections model)
 *
 * Source of truth: docs/view-schema-contract.md — that doc wins on conflict.
 * Consumed by: section components (props), Edge Function router (tool schema),
 * resolver (ID validation), events logging.
 *
 * Claims-integrity invariant, enforced here by construction:
 * the router payload contains IDs and enums only — no free-text fields.
 * Do not add string fields that could carry prose.
 *
 * v1 (views-as-templates) retired 2026-07-13.
 */

// ============================================================================
// Section kinds — the v1 portfolio section vocabulary
// ============================================================================

export const SECTION_KINDS = [
  'Hero',
  'SkillTicker',
  'CaseStudyBento',
  'CaseStudyFeature',
  'Testimonials',
  'CareerHighlights',
  'Outcomes',
  'CTABar',
  'CaseStudyArchive',
  'FallbackAnswer',
  'Contact',
] as const;

export type SectionKind = (typeof SECTION_KINDS)[number];

/**
 * Legal emphasis values per section. Level 2: salience only, never meaning.
 * Sections without entries below take no emphasis.
 */
export const EMPHASIS_BY_SECTION = {
  Hero: ['positioning', 'ai_focus', 'leadership'],
  CaseStudyBento: ['breadth', 'depth', 'ai_focus'],
  CaseStudyFeature: ['ai_focus', 'human_in_loop', 'explainability', 'architecture'],
  Testimonials: ['leadership', 'collaboration'],
  Outcomes: ['scale', 'impact'],
  FallbackAnswer: ['answer', 'redirect'],
} as const satisfies Partial<Record<SectionKind, readonly string[]>>;

/**
 * Legal variant values per section. Layout options within a section kind.
 */
export const VARIANT_BY_SECTION = {
  CaseStudyBento: ['default', 'compact'],
  CTABar: ['contact', 'resume', 'case-studies', 'external'],
} as const satisfies Partial<Record<SectionKind, readonly string[]>>;

// ============================================================================
// Record ID namespaces
// ============================================================================

export type CaseStudyId = `cs:${string}`;
export type BlockId = `block:${string}`;
export type HighlightId = `hl:${string}`;
export type TestimonialId = `tm:${string}`;
export type SkillId = `skill:${string}`;
export type CTAId = `cta:${string}`;
export type OutcomeId = `outcome:${string}`;

export type RecordId =
  | CaseStudyId
  | BlockId
  | HighlightId
  | TestimonialId
  | SkillId
  | CTAId
  | OutcomeId;

const ID_PATTERN = /^(cs|block|hl|tm|skill|cta|outcome):[a-z0-9][a-z0-9-]*$/;

export function isRecordId(x: unknown): x is RecordId {
  return typeof x === 'string' && ID_PATTERN.test(x);
}

// ============================================================================
// Router response envelope
// ============================================================================

/**
 * 0–1. Was a 'high' | 'medium' | 'low' string enum pre-Rung-2 (2026-07-21) —
 * widened to a number so confidence can gate the Rung 2 text fields at
 * specific thresholds (0.4, 0.7) instead of three coarse buckets. See
 * "The response ladder" in docs/codebase-ground-truth.md.
 */
export type Confidence = number;

export interface SectionSpec {
  kind: SectionKind;
  order: number;
  record_ids: RecordId[];
  emphasis?: string;
  variant?: string;
}

export interface RouterResponse {
  sections: SectionSpec[];
  confidence: Confidence;
  /** Metadata for events log. NOT a layout directive. */
  intent_tag?: string;
  /**
   * Rung 2 (2026-07-21) — the ONE sanctioned exception to "IDs and enums
   * only." Both fields are bounded template output, never free generation:
   * see view-schema-contract.md Invariant 1 and codebase-ground-truth.md's
   * "response ladder" for the exact rules. Do not add further free-text
   * fields without amending that invariant explicitly — it is not a
   * precedent for open-ended prose.
   */
  /** 1 sentence, <=160 chars. Template: "You're asking {intent_frame}." */
  restated_question?: string;
  /** 1-3 sentences, <=380 chars. Facts must all appear in selected blocks' frontmatter. */
  answer?: string;
  /**
   * Reasoning Panel / events-log feature (2026-07-22). Both fields are
   * router-computed, never model-authored free text: `hil_triggered` is a
   * deterministic rule over intent_tag/confidence (see hardcodedRouter.ts's
   * computeHilTriggered), and `reasoning` is synthesized from the response's
   * own real fields (matched intent, sections selected, confidence/HIL
   * outcome) — not a narrative the model writes about itself. In Phase 2
   * (real Edge Function), `reasoning` instead comes from the function's own
   * instrumented classify/score/compose stages. Neither belongs in
   * ROUTER_TOOL_SCHEMA below — that schema is Claude's own tool-call output;
   * these are computed after/around it.
   */
  /** Whether this response should be flagged for Andrea's manual follow-up. */
  hil_triggered: boolean;
  /** Ordered, real stage descriptions — 3 lines. Never decorative filler. */
  reasoning: string[];
}

// ============================================================================
// Runtime validation
// ============================================================================

const RESTATED_QUESTION_MAX = 160;
const ANSWER_MAX = 380;

export function isValidRouterResponse(x: unknown): x is RouterResponse {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  if (!Array.isArray(r.sections)) return false;
  if (!r.sections.every(isValidSectionSpec)) return false;
  if (typeof r.confidence !== 'number' || r.confidence < 0 || r.confidence > 1) return false;
  if (r.restated_question !== undefined) {
    if (typeof r.restated_question !== 'string' || r.restated_question.length > RESTATED_QUESTION_MAX) return false;
  }
  if (r.answer !== undefined) {
    if (typeof r.answer !== 'string' || r.answer.length > ANSWER_MAX) return false;
  }
  if (typeof r.hil_triggered !== 'boolean') return false;
  if (!Array.isArray(r.reasoning) || !r.reasoning.every((line) => typeof line === 'string')) return false;
  return true;
}

export function isValidSectionSpec(x: unknown): x is SectionSpec {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  if (!SECTION_KINDS.includes(s.kind as SectionKind)) return false;
  if (typeof s.order !== 'number') return false;
  if (!Array.isArray(s.record_ids)) return false;
  if (!s.record_ids.every(isRecordId)) return false;
  if (s.emphasis !== undefined && typeof s.emphasis !== 'string') return false;
  if (s.variant !== undefined && typeof s.variant !== 'string') return false;

  // Per-kind legality checks
  if (s.emphasis) {
    const legal = (EMPHASIS_BY_SECTION as Record<string, readonly string[]>)[s.kind as string];
    if (legal && !legal.includes(s.emphasis as string)) return false;
  }
  if (s.variant) {
    const legal = (VARIANT_BY_SECTION as Record<string, readonly string[]>)[s.kind as string];
    if (legal && !legal.includes(s.variant as string)) return false;
  }
  return true;
}

// ============================================================================
// Edge Function tool schema (for Claude structured outputs, step 7)
// ============================================================================

export const ROUTER_TOOL_SCHEMA = {
  name: 'compose_sections',
  description:
    'Compose portfolio sections that answer the visitor question, plus a bounded restatement and answer. Sections carry record IDs only, resolved to authored content by the frontend. restated_question and answer are templated from pre-authored scaffolds and verified frontmatter only — never free generation (see the response ladder, Rung 2).',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['sections', 'confidence'],
    properties: {
      sections: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'order', 'record_ids'],
          properties: {
            kind: { type: 'string', enum: [...SECTION_KINDS] },
            order: { type: 'integer', minimum: 0 },
            record_ids: {
              type: 'array',
              items: { type: 'string', pattern: ID_PATTERN.source },
            },
            emphasis: { type: 'string' },
            variant: { type: 'string' },
          },
        },
      },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      intent_tag: { type: 'string' },
      restated_question: { type: 'string', maxLength: 160 },
      answer: { type: 'string', maxLength: 380 },
    },
  },
} as const;
