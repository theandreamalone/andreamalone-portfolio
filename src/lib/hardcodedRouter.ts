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
 * decision, not an implementation detail: a question mentioning both AI
 * pattern vocabulary and a general AI keyword resolves to the more specific
 * pattern intent, because the more specific intent should win over the
 * broader one.
 *
 * Rung 2 (2026-07-21): every response now also composes `restated_question`
 * (templated from intent_tag via intentFrames.ts — never paraphrased) and
 * `answer` (assembled ONLY from the verified facts in CASE_STUDY_FACTS below,
 * which mirror the case studies' own published frontmatter — title,
 * client_name_public, and outcome metrics; nothing invented). See "The
 * response ladder" in docs/codebase-ground-truth.md and docs/intent-tags-v1.md.
 * `confidence` is now a 0-1 number instead of a 'high'|'medium'|'low' enum —
 * see viewContract.ts.
 *
 * Intent taxonomy migration (2026-07-21): this file previously emitted
 * case_deep_dive/leadership/ai_agentic_work/enterprise_scale as intent_tag
 * values — an ad-hoc set that collided with the reserved scoring-label list
 * in the master plan (§1D). Rewritten to classify into the v1 10-tag set
 * (docs/intent-tags-v1.md). `contact` and `how_this_works` remain as two
 * small utility intents outside that taxonomy — each already has a single
 * authored FallbackAnswer block that fully answers the question, so they
 * compose their own restated_question directly instead of via the generic
 * intent_frame map, and skip `answer` (the section below IS the answer).
 * `personal` no longer gets a dedicated rule — see docs/intent-tags-v1.md's
 * migration note for why.
 *
 * What this stub CANNOT do — and why the AI router matters (guiding star):
 *   - Intersection questions. "Have you done AI work with multiple teams?"
 *     matches one rule and loses the other dimension entirely. Keyword
 *     matching sees terms; it doesn't decompose intent.
 *   - Unknown phrasings, including named projects this stub doesn't
 *     recognize (e.g. "Tell me about Dynamo AI"). Anything outside the
 *     keyword lists drops to a broader intent or the final fallback even
 *     when good evidence exists.
 * Both limits are expected. Logging real questions (plan item 11) is what tells
 * us which ones matter enough to tag for.
 */

import type { RecordId, RouterResponse, SectionSpec } from '@/lib/viewContract';
import { STATIC_BASELINE } from '@/lib/staticBaseline';
import { restatedQuestionFor, INTENT_LABELS, type IntentTag } from '@/lib/intentFrames';

/** Every published case study, in default display order. */
const ALL_CASE_STUDIES: RecordId[] = [
  'cs:voice-ready-ai-experience',
  'cs:enterprise-network-operations',
  'cs:network-fault-investigation',
  'cs:ai-ops-dashboard',
];

/**
 * Case studies tagged `ai_agentic_work` in Supabase. Duplicated here because
 * this stub does not query — the Edge Function will read the real tags instead
 * of hardcoding them. Keep in sync with case_study_tags until then.
 *
 * (2026-07-21: fixed a stale `cs:executive-dashboard` reference here and in
 * ALL_CASE_STUDIES above — that case study was renamed to `ai-ops-dashboard`;
 * the old slug was silently dropping the card on every rule that used it.)
 */
const AI_CASE_STUDIES: RecordId[] = [
  'cs:voice-ready-ai-experience',
  'cs:ai-ops-dashboard',
];

/**
 * Verified, frontmatter-sourced facts for Rung 2 answer composition — every
 * value here is copied from the case study's own published MDX frontmatter
 * or its Supabase outcomes rows, never invented. `answer` template functions
 * below may ONLY use these fields; if a question's evidence isn't strong
 * enough to support a direct claim from this table, the compose() falls
 * back to the fixed string "Here's the closest matching work." rather than
 * stretch a thin fact into a claim (per the router prompt rule: "If the
 * frontmatter cannot support a direct answer, emit exactly...").
 */
interface CaseStudyFacts {
  title: string;
  org: string; // client_name_public — the disclosure-safe name, never the real one
  descriptor: string; // drawn from short_description, near-verbatim
  metric?: string; // an outcomes-table fact, only where one exists
}

const CASE_STUDY_FACTS: Record<string, CaseStudyFacts> = {
  'voice-ready-ai-experience': {
    title: 'Voice-Ready AI Experience',
    org: 'a Fortune 100 telecommunications company',
    descriptor: 'a full voice interaction system for an AI network-operations assistant',
  },
  'enterprise-network-operations': {
    title: 'Enterprise Network Operations Platform — Network Ops Design Audit',
    org: 'a Fortune 100 telecommunications company',
    descriptor: 'a platform-level design audit and IA rework across a 54-screen enterprise network-operations platform',
    metric: '-38% task completion time across the 54 audited screens',
  },
  'network-fault-investigation': {
    title: 'Network Fault Investigation Dashboard',
    org: 'a Fortune 100 telecommunications company',
    descriptor: 'a network-operations module connecting outage detection, diagnostics, and responder actions into one investigation path',
  },
  'ai-ops-dashboard': {
    title: 'AI Role-Adaptive Operations Dashboard',
    org: 'a Fortune 100 telecommunications company',
    descriptor: 'a role-adaptive AI operations dashboard giving executives and engineers different depths of the same incident information',
  },
};

const CLOSEST_MATCH_FALLBACK = "Here's the closest matching work.";

function answerFrom(slug: keyof typeof CASE_STUDY_FACTS, verb = 'designed'): string {
  const facts = CASE_STUDY_FACTS[slug];
  return `Yes — she ${verb} ${facts.descriptor} for ${facts.org}.`;
}

function section(
  kind: SectionSpec['kind'],
  order: number,
  record_ids: RecordId[] = [],
  extra: Partial<SectionSpec> = {}
): SectionSpec {
  return { kind, order, record_ids, ...extra };
}

/**
 * `hil_triggered` and `reasoning` are computed centrally in route() from the
 * rest of the response (see composeReasoning/computeHilTriggered below), not
 * authored per rule — so a rule's compose() returns everything BUT those two
 * fields, and route() fills them in once, after the fact, for every branch
 * including emptyStateResponse() and STATIC_BASELINE.
 */
type ComposedResponse = Omit<RouterResponse, 'hil_triggered' | 'reasoning'>;

interface Rule {
  intent: string;
  test: RegExp;
  compose: () => ComposedResponse;
}

/** Named-project detection, checked first — a named project beats every broader intent. */
const PROJECT_PATTERNS: { test: RegExp; slug: keyof typeof CASE_STUDY_FACTS }[] = [
  { test: /\bvoice[- ]ready\b/i, slug: 'voice-ready-ai-experience' },
  { test: /\benterprise network operations\b/i, slug: 'enterprise-network-operations' },
  { test: /\bnetwork fault investigation\b/i, slug: 'network-fault-investigation' },
  { test: /\b(ai[- ]?ops dashboard|executive dashboard|role[- ]adaptive)\b/i, slug: 'ai-ops-dashboard' },
];

function specificProjectRule(): Rule {
  return {
    intent: 'specific_project',
    test: /\b(voice[- ]ready|enterprise network operations|network fault investigation|ai[- ]?ops dashboard|executive dashboard|role[- ]adaptive|tell me about)\b/i,
    compose: () => {
      const q = lastQuestion;
      const match = PROJECT_PATTERNS.find((p) => p.test.test(q));
      const slug = match?.slug ?? 'voice-ready-ai-experience';
      const subject = `cs:${slug}` as RecordId;
      const tag: IntentTag = 'specific_project';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyFeature', 1, [subject], { emphasis: 'ai_focus' }),
          section('Outcomes', 2, [subject]),
          section('CTABar', 3, [], { variant: 'contact' }),
          section('Contact', 4),
        ],
        confidence: 0.9,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: answerFrom(slug),
      };
    },
  };
}

/**
 * The rule table closes over `lastQuestion` so specific_project's compose()
 * can tell which named project matched without re-threading the question
 * through every compose() signature. Set once per route() call, below.
 */
let lastQuestion = '';

const RULES: Rule[] = [
  specificProjectRule(),
  {
    // Pattern-vocabulary AI questions — more specific than the general AI
    // rule below, so it must be checked first.
    intent: 'ai_design_patterns',
    test: /\bhuman[- ]in[- ]the[- ]loop\b|\btrust and transparency\b|\bagentic\b|\bexplainab\w*|\bai (trust|transparency)\b|\bdesign patterns?\b/i,
    compose: () => {
      const tag: IntentTag = 'ai_design_patterns';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'ai_focus' }),
          section('CaseStudyFeature', 1, [AI_CASE_STUDIES[0]], { emphasis: 'human_in_loop' }),
          section('CaseStudyBento', 2, AI_CASE_STUDIES, { emphasis: 'depth' }),
          section('CTABar', 3, [], { variant: 'contact' }),
          section('Contact', 4),
        ],
        confidence: 0.75,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: `Yes — "${CASE_STUDY_FACTS['voice-ready-ai-experience'].title}" is tagged as agentic AI work, built for ${CASE_STUDY_FACTS['voice-ready-ai-experience'].org}.`,
      };
    },
  },
  {
    intent: 'accessibility',
    test: /\baccessib\w*|\bwcag\b|\ba11y\b|\bscreen reader\b|\baria[- ]?label\w*/i,
    compose: () => {
      const tag: IntentTag = 'accessibility';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyBento', 1, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
          section('CTABar', 2, [], { variant: 'contact' }),
          section('Contact', 3),
        ],
        confidence: 0.55,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        // No case study frontmatter names accessibility/WCAG work directly —
        // composing a claim here would outrun the metadata, so this stays
        // at medium confidence and skips a direct answer (see AdaptiveHome
        // gating: 0.4-0.7 renders restatement + closest-match line only).
      };
    },
  },
  {
    intent: 'evaluation_rigor',
    test: /\bheuristic\w*|\bevaluat\w*|\bdesign audit\w*|\busability test\w*|\bmeasure success\b/i,
    compose: () => {
      const tag: IntentTag = 'evaluation_rigor';
      const subject = 'cs:enterprise-network-operations' as RecordId;
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyFeature', 1, [subject], { emphasis: 'architecture' }),
          section('Outcomes', 2, [subject]),
          section('CTABar', 3, [], { variant: 'contact' }),
          section('Contact', 4),
        ],
        confidence: 0.85,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: `Yes — her ${CASE_STUDY_FACTS['enterprise-network-operations'].title} work produced ${CASE_STUDY_FACTS['enterprise-network-operations'].metric}.`,
      };
    },
  },
  {
    intent: 'technical_capability',
    test: /\b(code|coding|react|figma|technical(ly)?|develop(er)?|front[- ]?end|html|css|javascript|typescript)\b/i,
    compose: () => {
      const tag: IntentTag = 'technical_capability';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('SkillTicker', 1),
          section('CaseStudyBento', 2, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
          section('CTABar', 3, [], { variant: 'contact' }),
          section('Contact', 4),
        ],
        confidence: 0.5,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        // Tooling depth lives in the skills table, not case study
        // frontmatter — no verified case-study fact backs a direct claim
        // here, so this skips `answer` rather than guess.
      };
    },
  },
  {
    intent: 'enterprise_experience',
    test: /\b(enterprise|fortune|telecom|at&t|att|t[- ]mobile|ibm|directv)\b|\bcompan\w*/i,
    compose: () => {
      const tag: IntentTag = 'enterprise_experience';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyBento', 1, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
          section('Outcomes', 2, ['cs:enterprise-network-operations'], { emphasis: 'scale' }),
          section('CareerHighlights', 3),
          section('CTABar', 4, [], { variant: 'contact' }),
          section('Contact', 5),
        ],
        confidence: 0.85,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: `Yes — her recent work spans multiple engagements for ${CASE_STUDY_FACTS['enterprise-network-operations'].org}, including ${CASE_STUDY_FACTS['enterprise-network-operations'].title} and ${CASE_STUDY_FACTS['voice-ready-ai-experience'].title}.`,
      };
    },
  },
  {
    intent: 'process_collaboration',
    // Folds the pre-Rung-2 "leadership" rule's keywords in here — team,
    // mentor, and stakeholder questions are process/collaboration questions,
    // not a separate scoring-label intent (leadership stays deferred, §1D).
    test: /\bprocess\w*|\bcollaborat\w*|\bstakeholder\w*|\bworkflow\w*|\b(lead|leads|leading|leadership|team|teams|manage|managed|manager|mentor|mentoring|cross[- ]functional|report|reports)\b/i,
    compose: () => {
      const tag: IntentTag = 'process_collaboration';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'leadership' }),
          section('Testimonials', 1, [], { emphasis: 'leadership' }),
          section('CareerHighlights', 2),
          section('CaseStudyBento', 3, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
          section('CTABar', 4, [], { variant: 'contact' }),
          section('Contact', 5),
        ],
        confidence: 0.6,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        // "How she works" isn't a case-study frontmatter fact — the
        // testimonials and career highlights sections carry this evidence
        // instead of a composed claim.
      };
    },
  },
  {
    intent: 'ai_product_experience',
    test: /\b(ai|artificial intelligence|llm|gpt|machine learning|\bml\b|voice|conversational|chatbot|assistant|automation)\b/i,
    compose: () => {
      const tag: IntentTag = 'ai_product_experience';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'ai_focus' }),
          section('CaseStudyFeature', 1, [AI_CASE_STUDIES[0]], { emphasis: 'human_in_loop' }),
          section('CaseStudyBento', 2, AI_CASE_STUDIES, { emphasis: 'depth' }),
          section('Outcomes', 3, ['cs:enterprise-network-operations']),
          section('CTABar', 4, [], { variant: 'contact' }),
          section('Contact', 5),
        ],
        confidence: 0.9,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: answerFrom('voice-ready-ai-experience'),
      };
    },
  },
  {
    // Utility intent, outside the v1 taxonomy — see file header.
    intent: 'how_this_works',
    test: /\b(how does this (site|page|thing)|how this site works|adaptive|personaliz|orchestrat|router|why does this)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-how-this-site-works'], { emphasis: 'answer' }),
        section('CTABar', 2, [], { variant: 'contact' }),
        section('Contact', 3),
      ],
      confidence: 0.95,
      intent_tag: 'how_this_works',
      restated_question: "You're asking how this site works.",
    }),
  },
  {
    // Utility intent, outside the v1 taxonomy — see file header. Narrowed
    // 2026-07-21 to drop bare "hire"/"hiring": docs/intent-tags-v1.md's
    // general_overview example is literally "Why should we hire her?",
    // which is a pitch question, not a request for contact info.
    intent: 'contact',
    test: /\b(contact|reach (you|out)|email (me|her|andrea)|get in touch|available for (hire|work)|availability)\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-contact'], { emphasis: 'answer' }),
        section('Contact', 2),
      ],
      confidence: 0.95,
      intent_tag: 'contact',
      restated_question: "You're asking how to get in touch.",
    }),
  },
  {
    // Explicit out-of-scope detection — see docs/intent-tags-v1.md's
    // definition ("salary, availability, references, personal questions,
    // off-topic"). Checked before general_overview so a personal-question
    // phrasing doesn't get mistaken for a broad-but-in-scope one.
    intent: 'out_of_scope',
    test: /\bsalary\b|\bcompensation\b|\breferences?\b|\bhobb\w*|\boutside (of )?work\b|\bfree time\b|\bfor fun\b|\bpersonal life\b|\bfamily\b|\bweekend\b|\bwho are you\b/i,
    compose: () => ({
      sections: [
        section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
        section('FallbackAnswer', 1, ['block:fallback-empty-state'], { emphasis: 'redirect' }),
        section('CTABar', 2, [], { variant: 'contact' }),
        section('Contact', 3),
      ],
      confidence: 0,
      intent_tag: 'out_of_scope',
    }),
  },
  {
    intent: 'general_overview',
    test: /\b(who is andrea|best work|why (should we )?hire|overview|show me everything|strongest work)\b/i,
    compose: () => {
      const tag: IntentTag = 'general_overview';
      return {
        sections: [
          section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
          section('CaseStudyFeature', 1, ['cs:voice-ready-ai-experience'], { emphasis: 'ai_focus' }),
          section('CaseStudyBento', 2, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
          section('Testimonials', 3),
          section('CTABar', 4, [], { variant: 'contact' }),
          section('Contact', 5),
        ],
        confidence: 0.7,
        intent_tag: tag,
        restated_question: restatedQuestionFor(tag),
        answer: `Selected work spans systems like ${CASE_STUDY_FACTS['voice-ready-ai-experience'].title} and ${CASE_STUDY_FACTS['enterprise-network-operations'].title}, both built for ${CASE_STUDY_FACTS['voice-ready-ai-experience'].org}.`,
      };
    },
  },
];

/**
 * No rule matched. Say so plainly; never bridge the gap with invented text.
 * Per docs/intent-tags-v1.md, an unmatched question is out_of_scope, not a
 * third catch-all tag — general_overview and out_of_scope are the only two.
 */
function emptyStateResponse(): ComposedResponse {
  return {
    sections: [
      section('Hero', 0, ['block:home-hero'], { emphasis: 'positioning' }),
      section('FallbackAnswer', 1, ['block:fallback-empty-state'], { emphasis: 'redirect' }),
      section('CaseStudyBento', 2, ALL_CASE_STUDIES.slice(0, 3), { emphasis: 'breadth' }),
      section('CTABar', 3, [], { variant: 'contact' }),
      section('Contact', 4),
    ],
    confidence: 0,
    intent_tag: 'out_of_scope',
  };
}

/**
 * HIL trigger rule (Reasoning Panel spec §5, 2026-07-22). 0.5 is not an
 * arbitrary midpoint — it's the floor of the lowest confidence any real
 * (non-out_of_scope) rule above emits (technical_capability, 0.5), found by
 * reading every rule's confidence value above. `confidence < FLOOR` (strict)
 * means that lowest legitimate match still clears the floor and does NOT
 * trigger HIL; anything weaker than the weakest real match does.
 * `out_of_scope` always triggers regardless of its confidence value.
 */
const HIL_CONFIDENCE_FLOOR = 0.5;

function computeHilTriggered(intentTag: string | undefined, confidence: number): boolean {
  return intentTag === 'out_of_scope' || confidence < HIL_CONFIDENCE_FLOOR;
}

/** cs:{slug} -> title, for composeReasoning's "selected from X" line. */
const CASE_STUDY_TITLES: Record<string, string> = Object.fromEntries(
  Object.entries(CASE_STUDY_FACTS).map(([slug, facts]) => [`cs:${slug}`, facts.title])
);

/** "X" / "X and Y" / "X, Y, and Z" — plain join() reads as "X and Y and Z" at 3+. */
function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Synthesizes the Reasoning Panel's 3 lines from the response's own real
 * fields — matched intent, sections actually selected, confidence/HIL
 * outcome. Not hand-authored per rule (13 near-identical arrays would drift
 * from the rules they describe); computed once, here, so it can never say
 * something the response didn't actually do.
 */
function composeReasoning(res: ComposedResponse & { hil_triggered: boolean }): string[] {
  const tag = res.intent_tag ?? 'general_overview';
  const label = INTENT_LABELS[tag] ?? tag.replace(/_/g, ' ');

  const csIds = res.sections.flatMap((s) => s.record_ids).filter((id) => id.startsWith('cs:'));
  const csNames = [...new Set(csIds.map((id) => CASE_STUDY_TITLES[id] ?? id))];
  const sectionCount = res.sections.length;

  const line1 = `Matched your question to ${label}`;
  const line2 = csNames.length
    ? `Selected ${sectionCount} section${sectionCount === 1 ? '' : 's'} from ${listJoin(csNames)}`
    : `Selected ${sectionCount} section${sectionCount === 1 ? '' : 's'} to answer this`;
  const line3 = `Confidence ${Math.round(res.confidence * 100)}% — ${
    res.hil_triggered ? "routed to a human — Andrea will follow up" : 'no human follow-up needed'
  }`;

  return [line1, line2, line3];
}

/**
 * Compose a response for a visitor question.
 * Empty input returns the static baseline — the cold-load state.
 */
export function route(question: string): RouterResponse {
  const q = question.trim();
  if (!q) return STATIC_BASELINE;

  lastQuestion = q;
  const hit = RULES.find((rule) => rule.test.test(q));
  const base = hit ? hit.compose() : emptyStateResponse();
  const hil_triggered = computeHilTriggered(base.intent_tag, base.confidence);
  const withHil = { ...base, hil_triggered };
  return { ...withHil, reasoning: composeReasoning(withHil) };
}

/** Chips are training wheels for visitors who don't know what to ask (D3). */
export const SUGGESTED_QUESTIONS: readonly string[] = [
  'What AI work have you shipped?',
  'Have you led teams?',
  'Tell me about the Voice-Ready AI project',
  'How does this site work?',
] as const;
