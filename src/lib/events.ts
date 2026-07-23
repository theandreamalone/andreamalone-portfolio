/**
 * events.ts — Phase 1 client-side event + feedback logging (Reasoning Panel
 * spec, 2026-07-22). See §1 (SQL, run manually in the Supabase SQL editor —
 * schema isn't version-controlled in-repo, same known gap as every other
 * table) and §4 (this flow) in the implementation spec.
 *
 * Boundary note: this logs visitor questions + composed *responses*
 * (runtime output), not authored portfolio content. Option A ("prose never
 * enters the DB") governs authored content; it does not apply here.
 *
 * Phase 2 (real Edge Function): the event write moves server-side
 * (`service_role`), keyed by an `event_id` the function still returns in its
 * payload so feedback can reference it the same way. This module's public
 * shape (logEvent returns an id synchronously, logFeedback awaits) doesn't
 * change — only where the row actually gets written.
 */

import { supabase } from '@/lib/supabaseClient';
import { EVIDENCE_INTRO } from '@/components/sections/home/ResponseComposition';
import type { RouterResponse } from '@/lib/viewContract';

const SESSION_KEY = 'portfolio_session_id';

/** One session id per browser session — generated once, held in sessionStorage. */
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface LogEventParams {
  question: string;
  response: RouterResponse;
  /** Wall-clock time from ask() to composed response, in ms. */
  latencyMs: number;
  /** No runtime audience-selection UI exists yet — always null for now. */
  audience?: string | null;
}

/**
 * Logs one composed answer. The id is generated up front and returned
 * synchronously — that's what lets a feedback row reference this event
 * without a select round-trip under insert-only RLS (see spec §1's note on
 * `events.id`). The insert itself is fire-and-forget: a failed log must
 * never block rendering (static baseline is non-negotiable), so this never
 * throws — a failure just warns to console, e.g. before Andrea has run the
 * `events`/`feedback` migration, every call warns exactly this way.
 */
export function logEvent({ question, response, latencyMs, audience = null }: LogEventParams): string {
  const eventId = crypto.randomUUID();

  supabase
    .from('events')
    .insert({
      id: eventId,
      session_id: getSessionId(),
      audience,
      question,
      intent_tag: response.intent_tag ?? null,
      confidence: response.confidence,
      hil_triggered: response.hil_triggered,
      sections: response.sections,
      response: {
        restated_question: response.restated_question ?? null,
        answer: response.answer ?? null,
        evidence_intro: EVIDENCE_INTRO,
      },
      latency_ms: latencyMs,
    })
    .then(({ error }) => {
      if (error) console.warn('[events] log insert failed (has the events/feedback SQL been run yet?)', error);
    });

  return eventId;
}

export type FeedbackRating = 'up' | 'down';

/**
 * Logs feedback on a previously-logged event. Unlike logEvent, this IS
 * awaited by callers — thumbs up/down has real UI-facing status (snackbar
 * on success, inline error on failure), same pattern as Contact.tsx.
 */
export async function logFeedback(
  eventId: string,
  rating: FeedbackRating,
  comment: string | null
): Promise<boolean> {
  const { error } = await supabase.from('feedback').insert({
    event_id: eventId,
    rating,
    comment,
  });
  if (error) {
    console.warn('[events] feedback insert failed', error);
    return false;
  }
  return true;
}
