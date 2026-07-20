/**
 * Hardcoded router — the D6 stand-in for the Claude Edge Function (step 7).
 *
 * Question in, RouterResponse out. Pure function, no network, no AI. This is
 * the "hardcoded routing first, validate the feel, then wire Claude" step: if
 * the contract deadline hits, the adaptive demo ships on this alone.
 *
 * When the Edge Function lands, ONLY this file's selection logic is replaced.
 * The contract, the sections, and AdaptiveHome stay exactly as they are — that
 * swap is the whole point of routing through a typed payload.
 *
 * Rules are ordered; first match wins. That ordering is a real editorial
 * decision, not an implementation detail: a question mentioning both "AI" and
 * "team" resolves to leadership, because the more specific intent should win
 * over the broader one.
 *
 * What this stub CANNOT do — and why the AI router matters (guiding star):
 *   - Intersection questions. "Have you done AI work with multiple teams?"
 *     matches the leadership rule and loses the AI dimension entirely.
 *     Keyword matching sees terms; it doesn't decompose intent.
 *   - Unknown phrasings. Anything outside the keyword lists drops to fallback
 *     even when good evidence exists.
 * Both limits are expected. Logging real questions (plan item 11) is what tells
 * us which ones matter enough to tag for.
 */

import type { RecordId, RouterResponse, SectionSpec } from '@/lib/viewContract';
import { STATIC_BASELINE } from '@/lib/staticBaseline';

/** Every published case study, in default display order. */
const ALL_CASE_STUDIES: RecordId[] = [
  'cs:voice-ready-ai-experience',
  'cs:enterprise-network-operations',
  'cs:network-fault-investigation',
  'cs:executive-dashboard',
];

/**
 * Case studies tagged `ai_agentic_work` in Supabase. Duplicated here because
 * this stub does not query — the Edge Function will read the real tags instead
 * of hardcoding them. Keep in sync with case_study_tags until then.
 */
const AI_CASE_STUDIES: RecordId[] = [
  'cs:voice-ready-ai-experience',
  'cs:executive-dashboard',
];

function section(
  kind: SectionSpec['kind'],
  order: number,
  record_ids: RecordId[] = [],
  extra: Partial<SectionSpec> = {}
): SectionSpec {
  return { kind, order, record_ids, ...extra };
}

interface Rule {
  intent: string;
  test: RegExp;
  compose: () => RouterResponse;
}

const RULES: Rule[] = [
  {
    // Deep dive — a named project beats every broader intent.
    intent: 'case_deep_dive',
    test: /\b(voice[- ]ready|enterprise network operations|network fault investigation|executive dashboard|tell me about)\b/i,
    compose: () => {
      const subject = 'cs:voice-ready-ai-experience' as RecordId;
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyFeature', 1, [subject], { emphasis: 'ai_focus' }),
          section('Outcomes', 2, [subject]),
          section('CTABar', 3, [], { variant: 'contact' }),
          section('Contact', 4),
        ],
        confidence: 'high',
        intent_tag: 'case_deep_dive',
      };
    },
  },
  {
    intent: 'leadership',
    test: /\b(lead|leads|leading|leadership|team|teams|manage|managed|manager|mentor|mentoring|cross[- ]functional|report|reports)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'leadership' }),
        section('Testimonials', 1, [], { emphasis: 'leadership' }),
        section('CareerHighlights', 2),
        section('CaseStudyBento', 3, ALL_CASE_STUDIES.slice(0, 3), {
          emphasis: 'breadth',
        }),
        section('CTABar', 4, [], { variant: 'contact' }),
        section('Contact', 5),
      ],
      confidence: 'high',
      intent_tag: 'leadership',
    }),
  },
  {
    intent: 'ai_agentic_work',
    test: /\b(ai|agentic|llm|gpt|machine learning|ml|human[- ]in[- ]the[- ]loop|explainab|voice|conversational|chatbot|assistant|automation)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'ai_focus' }),
        section('CaseStudyFeature', 1, [AI_CASE_STUDIES[0]], {
          emphasis: 'human_in_loop',
        }),
        section('CaseStudyBento', 2, AI_CASE_STUDIES, { emphasis: 'depth' }),
        section('Outcomes', 3, ['cs:enterprise-network-operations']),
        section('CTABar', 4, [], { variant: 'contact' }),
        section('Contact', 5),
      ],
      confidence: 'high',
      intent_tag: 'ai_agentic_work',
    }),
  },
  {
    intent: 'enterprise_scale',
    test: /\b(enterprise|scale|fortune|telecom|at&t|att|t[- ]mobile|ibm|directv|complex|large)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('CaseStudyBento', 1, ALL_CASE_STUDIES.slice(0, 3), {
          emphasis: 'breadth',
        }),
        section('Outcomes', 2, ['cs:enterprise-network-operations'], { emphasis: 'scale' }),
        section('CareerHighlights', 3),
        section('CTABar', 4, [], { variant: 'contact' }),
        section('Contact', 5),
      ],
      confidence: 'high',
      intent_tag: 'enterprise_scale',
    }),
  },
  {
    intent: 'how_this_works',
    test: /\b(how does this (site|page|thing)|how this site works|adaptive|personaliz|orchestrat|router|why does this)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-how-this-site-works'], {
          emphasis: 'answer',
        }),
        section('CTABar', 2, [], { variant: 'contact' }),
        section('Contact', 3),
      ],
      confidence: 'high',
      intent_tag: 'how_this_works',
    }),
  },
  {
    intent: 'personal',
    test: /\b(hobb|outside (of )?work|free time|for fun|personal|family|weekend|who are you)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-outside-work'], {
          emphasis: 'answer',
        }),
        section('CTABar', 2, [], { variant: 'contact' }),
        section('Contact', 3),
      ],
      confidence: 'medium',
      intent_tag: 'personal',
    }),
  },
  {
    intent: 'contact',
    test: /\b(contact|reach|hire|hiring|available|availability|email|get in touch)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-contact'], {
          emphasis: 'answer',
        }),
        section('Contact', 2),
      ],
      confidence: 'high',
      intent_tag: 'contact',
    }),
  },
];

/** No rule matched. Say so plainly; never bridge the gap with invented text. */
function emptyStateResponse(): RouterResponse {
  return {
    sections: [
      section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
      section('FallbackAnswer', 1, ['block:fallback-empty-state'], {
        emphasis: 'redirect',
      }),
      section('CaseStudyBento', 2, ALL_CASE_STUDIES.slice(0, 3), {
        emphasis: 'breadth',
      }),
      section('CTABar', 3, [], { variant: 'contact' }),
      section('Contact', 4),
    ],
    confidence: 'low',
    intent_tag: 'conversational_fallback',
  };
}

/**
 * Compose a response for a visitor question.
 * Empty input returns the static baseline — the cold-load state.
 */
export function route(question: string): RouterResponse {
  const q = question.trim();
  if (!q) return STATIC_BASELINE;

  const hit = RULES.find((rule) => rule.test.test(q));
  return hit ? hit.compose() : emptyStateResponse();
}

/** Chips are training wheels for visitors who don't know what to ask (D3). */
export const SUGGESTED_QUESTIONS: readonly string[] = [
  'What AI work have you shipped?',
  'Have you led teams?',
  'Tell me about the Voice-Ready AI project',
  'How does this site work?',
] as const;
