-- =============================================================================
-- events + feedback tables — router logging for the adaptive UI
-- =============================================================================
--
-- Status:   Applied to Supabase (2026-07-23). This file reflects the schema
--           as it actually ended up — not a script to re-run.
-- Purpose:  Bridge doc. The repo has no migration system. This file is the
--           source of truth for these two tables' shape until real
--           migrations exist. Prevents the same drift that cost the missing
--           page / section / component columns.
-- Owner:    Andrea Malone
-- Depends:  gen_random_uuid() — enabled by default on Supabase.
--
-- History: the tables that ended up live predated this doc and both SQL
-- drafts that led to it — created by an earlier/parallel pass, not from
-- either script run in this session. Reconciling against that pre-existing
-- state surfaced two real bugs, both fixed before this file was written:
--   1. `events.response` didn't exist at all — every real insert from the
--      app would have failed once the schema-cache issue (below) cleared.
--   2. `events.intent_tag` had a leftover CHECK constraint enumerating the
--      OLD pre-Rung-2 tag set (leadership/ai_agentic_work/enterprise_scale/
--      case_deep_dive) and rejected every tag the current router actually
--      emits — a 100% silent logging failure for every real question asked.
--      Dropped outright rather than updated to a new enum: this system's
--      whole design (docs/intent-tags-v1.md) is that the tag set evolves
--      from real usage data (D9), so hard-gating the column against a fixed
--      list works against its own purpose.
-- Also: immediately after any DDL here, PostgREST's schema cache can lag —
-- if the app reports "Could not find the table/column ... in the schema
-- cache" right after a change that should have fixed it, run
-- `notify pgrst, 'reload schema';` rather than assuming the DDL failed.
--
-- Referenced by:
--   * Edge Function router — writes events via service_role (phase 2)
--   * AdaptiveHome flow    — client generates event_id, writes event (phase 1)
--   * Feedback form        — POST with event_id FK, mirrors contact form
--
-- Boundary note: Logging visitor questions + composed responses does NOT
-- violate Option A. "Prose never enters the DB" governs authored portfolio
-- content, not runtime analytics. Composed answers are runtime output; the
-- authored prose lives in MDX and reaches the visitor via blockRegistry.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- events — one row per router invocation
-- -----------------------------------------------------------------------------

create table if not exists events (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  session_id     uuid,
  audience       text,
  question       text,
  intent_tag     text,
  confidence     numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  hil_triggered  boolean default false,
  sections       jsonb,   -- SectionSpec[] from RouterResponse
  response       jsonb,   -- { restated_question, answer, evidence_intro }
  latency_ms     integer
);

alter table events add constraint events_question_check
  check (question is null or char_length(question) <= 2000);

comment on table events is
  'Router invocation log. One row per question. Client generates id in phase 1 (though the column also has a default for direct/dashboard inserts); Edge Function writes with service_role in phase 2.';

comment on column events.session_id is
  'Client-generated UUID grouping questions from the same browser session. Not a FK — no sessions table by design.';

comment on column events.hil_triggered is
  'True when the response fell below the confidence floor and surfaced the human-in-the-loop banner.';

comment on column events.sections is
  'The SectionSpec[] the router returned — kind, order, record_ids, emphasis, variant.';

create index if not exists events_created_at_desc on events (created_at desc);
create index if not exists events_session_id      on events (session_id);
create index if not exists events_intent_tag      on events (intent_tag);


-- -----------------------------------------------------------------------------
-- feedback — thumbs up/down + optional comment
-- -----------------------------------------------------------------------------

create table if not exists feedback (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  rating      text not null check (rating in ('up', 'down')),
  comment     text check (comment is null or char_length(comment) <= 2000),
  created_at  timestamptz default now()
);

comment on table feedback is
  'Rating per event. Down ratings collect free-text via a single-question form; up ratings write with a null comment.';

create index if not exists feedback_event_id on feedback (event_id);


-- -----------------------------------------------------------------------------
-- RLS — anon insert-only. Never selectable from the client.
-- -----------------------------------------------------------------------------

alter table events   enable row level security;
alter table feedback enable row level security;

create policy "events: anon insert" on events
  for insert to anon
  with check (true);   -- length constraint is now a table CHECK, not RLS —
                        -- so it still holds once phase 2's service_role
                        -- writes bypass RLS entirely.

create policy "feedback: anon insert" on feedback
  for insert to anon
  with check (true);

-- No select / update / delete policies. Deliberate.
-- Edge Function reads via service_role, which bypasses RLS.
-- Analytics / dashboards read from the Supabase dashboard or a future admin
-- tool authenticated as service_role — never from the browser client.
