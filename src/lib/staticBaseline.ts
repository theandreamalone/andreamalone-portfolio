/**
 * Static Baseline Composition — the hardcoded fallback per plan D6/D8.
 *
 * This IS the D6-mandated static baseline. Rendered by Home.tsx and served
 * whenever the router is unavailable, low-confidence, or not yet wired.
 *
 * Order and record IDs here are decided by hand — not by AI. Update this
 * file when you want to change what a cold visitor sees on `/`.
 *
 * Contract: src/lib/viewContract.ts — this must remain a valid RouterResponse.
 */

import type { RouterResponse } from '@/lib/viewContract';

export const STATIC_BASELINE: RouterResponse = {
  sections: [
    {
      kind: 'Hero',
      order: 0,
      record_ids: ['block:home-hero'],
      emphasis: 'positioning',
    },
    {
      kind: 'SkillTicker',
      order: 1,
      record_ids: [], // resolver fetches top skills when record_ids is empty
    },
    {
      kind: 'CaseStudyFeature',
      order: 2,
      record_ids: ['cs:voice-ready-ai-experience'],
      emphasis: 'ai_focus',
    },
    {
      kind: 'CaseStudyBento',
      order: 3,
      record_ids: [
        'cs:enterprise-network-operations',
        'cs:network-fault-investigation',
        'cs:executive-dashboard',
      ],
    },
    {
      kind: 'Outcomes',
      order: 4,
      record_ids: ['cs:enterprise-network-operations'],
    },
    {
      kind: 'Testimonials',
      order: 5,
      record_ids: [], // resolver fetches featured testimonials
    },
    {
      kind: 'CareerHighlights',
      order: 6,
      record_ids: [], // resolver fetches all career highlights
    },
    {
      kind: 'CTABar',
      order: 7,
      record_ids: [], // resolver fetches primary CTA
      variant: 'contact',
    },
    {
      kind: 'Contact',
      order: 8,
      record_ids: [],
    },
  ],
  confidence: 'high',
  intent_tag: 'static_baseline',
};
