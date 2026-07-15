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

export type Confidence = 'high' | 'medium' | 'low';

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
}

// ============================================================================
// Runtime validation
// ============================================================================

export function isValidRouterResponse(x: unknown): x is RouterResponse {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  if (!Array.isArray(r.sections)) return false;
  if (!r.sections.every(isValidSectionSpec)) return false;
  if (!['high', 'medium', 'low'].includes(r.confidence as string)) return false;
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
    'Compose portfolio sections that answer the visitor question. Return sections with their record IDs. Never return text — the frontend resolves IDs to authored content.',
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
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      intent_tag: { type: 'string' },
    },
  },
} as const;
