/**
 * View Schema Contract — v1 (types)
 *
 * Source of truth: docs/view-schema-contract.md — that doc wins on conflict.
 * Consumed by: view components (props), Edge Function router (tool schema),
 * resolver (ID validation), events logging.
 *
 * Claims-integrity invariant, enforced here by construction:
 * the router payload contains IDs and enums only — no free-text fields.
 * Do not add string fields that could carry prose.
 */

export const VIEW_NAMES = [
  'landing_default',
  'ai_agentic_work',
  'case_deep_dive',
  'conversational_fallback',
] as const;

export type ViewName = (typeof VIEW_NAMES)[number];

/** Legal emphasis values per view. Level 2: salience only, never meaning. */
export const EMPHASIS_BY_VIEW = {
  landing_default: ['positioning', 'breadth', 'ai_focus'],
  ai_agentic_work: ['explainability', 'human_in_loop', 'architecture', 'outcomes'],
  case_deep_dive: ['process', 'decisions', 'outcomes', 'craft'],
  conversational_fallback: ['redirect', 'answer'],
} as const satisfies Record<ViewName, readonly string[]>;

export type EmphasisFor<V extends ViewName> = (typeof EMPHASIS_BY_VIEW)[V][number];
export type EmphasisValue = EmphasisFor<ViewName>;

/** ID namespaces. Anything claim-bearing must be a BlockId (MDX-resolved). */
export type CaseStudyId = `cs:${string}`;      // Supabase metadata by slug
export type BlockId = `block:${string}`;       // bundled MDX prose block
export type HighlightId = `hl:${string}`;      // Supabase career highlight
export type TestimonialId = `tm:${string}`;
export type SkillId = `skill:${string}`;

export type RecordId =
  | CaseStudyId
  | BlockId
  | HighlightId
  | TestimonialId
  | SkillId;

export type Confidence = 'high' | 'medium' | 'low';

/**
 * The complete router payload. Array order of record_ids = display order
 * (Level 0). Omission = deprioritization, never unreachability (Level 1).
 */
export interface RouterResponse<V extends ViewName = ViewName> {
  view: V;
  record_ids: RecordId[]; // may be [] (honest empty state in fallback view)
  emphasis: EmphasisFor<V>;
  confidence: Confidence; // low → frontend prefers fallback/static baseline
}

/** Runtime guard — use at the Edge Function boundary and in the resolver. */
export function isValidRouterResponse(x: unknown): x is RouterResponse {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  if (!VIEW_NAMES.includes(r.view as ViewName)) return false;
  if (!Array.isArray(r.record_ids)) return false;
  if (!r.record_ids.every(isRecordId)) return false;
  const legal = EMPHASIS_BY_VIEW[r.view as ViewName] as readonly string[];
  if (!legal.includes(r.emphasis as string)) return false;
  if (!['high', 'medium', 'low'].includes(r.confidence as string)) return false;
  return true;
}

const ID_PATTERN = /^(cs|block|hl|tm|skill):[a-z0-9][a-z0-9-]*$/;

export function isRecordId(x: unknown): x is RecordId {
  return typeof x === 'string' && ID_PATTERN.test(x);
}

/**
 * View-specific structural rules the resolver enforces after type validation.
 * Violations: drop the offending IDs, log, render what remains.
 * - landing_default: position 0 must be a block: (hero); expect 3 cs: after.
 * - case_deep_dive: position 0 must be a cs:; all subsequent block: IDs must
 *   belong to that case study (registry lookup).
 * - conversational_fallback: block: IDs must come from the authored
 *   answer-block set; empty record_ids renders the authored empty state.
 */

/** JSON Schema for the Edge Function's Claude tool definition. */
export const ROUTER_TOOL_SCHEMA = {
  name: 'compose_view',
  description:
    'Select which view answers the visitor question and which evidence records populate it. Return IDs only — never text.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['view', 'record_ids', 'emphasis', 'confidence'],
    properties: {
      view: { type: 'string', enum: [...VIEW_NAMES] },
      record_ids: {
        type: 'array',
        items: { type: 'string', pattern: ID_PATTERN.source },
      },
      emphasis: { type: 'string' }, // per-view legality enforced in code
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    },
  },
} as const;
