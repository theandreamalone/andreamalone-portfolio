# View Schema Contract — v1

**Status:** Locked once committed. The router tool definition, view components,
and tagging schema (plan step 5) all key off this file.
**Plan reference:** `portfolio-master-plan.md` Section 1B step 2.
**Guiding star:** `ai-orchestration-purpose.md` — record_ids and emphasis are
the payload that matters; the view is almost derivable from the evidence.
**Companion code:** `src/lib/viewContract.ts` (types must stay in sync with
this doc; this doc wins on conflict).

---

## The contract in one line

The router returns **`{ view, record_ids, emphasis }`** — IDs and enums only,
never text. The frontend resolves IDs to content it already has.

```json
{
  "view": "ai_agentic_work",
  "record_ids": ["cs:voice-ready-ai", "block:voice-ready-ai-hitl-anecdote", "cs:fault-iq"],
  "emphasis": "human_in_loop"
}
```

---

## Invariants (apply to every view)

1. **No text fields.** The router never returns prose, titles, labels, or
   summaries. Any schema change adding a free-text field is a
   claims-integrity violation by definition.
2. **`record_ids` order is meaningful.** Array order = display order
   (Level 0 personalization). The router reorders; components never re-sort.
3. **Selection is disclosure, not deletion** (Level 1). IDs omitted from
   `record_ids` are deprioritized in the UI, never made unreachable. The
   persistent "full case study" path ignores this payload entirely.
4. **`emphasis` changes salience, never meaning** (Level 2). It maps to
   visual weight in components — which fields render as chips, which blocks
   expand by default. It must never suppress caveats or alter what a
   reasonable viewer walks away believing.
5. **Unknown IDs are dropped by the resolver and logged** — never rendered as
   empty shells, never guessed at.
6. **Every payload must be renderable with zero AI calls.** Hardcoded payloads
   conforming to this contract are the D6 fallback demo.

---

## ID namespaces

| Prefix | Resolves to | Source of truth |
|--------|-------------|-----------------|
| `cs:` | Case study card/summary data by slug | Supabase (metadata) |
| `block:` | Pre-authored prose block by stable ID | Bundled MDX (`content/blocks/`, case-study section files) |
| `hl:` | Career highlight record | Supabase |
| `tm:` | Testimonial | Supabase + MDX |
| `skill:` | Skill record | Supabase |

Rule of thumb: anything that *makes a claim in sentences* must resolve to a
`block:` (MDX). Anything structured (metrics, years, tags) resolves to a
Supabase-backed ID. This is Option A enforced at the type level.

---

## The 4 v1 views

### 1. `landing_default`
Cold-load state and the router's answer to greetings/vague intent.

- **record_ids:** exactly 1 hero `block:` first, then 3 `cs:` (highlight
  reel), optionally 1 `tm:`.
- **emphasis:** `positioning` (pitch-line forward) | `breadth` (range of
  work) | `ai_focus` (AI work forward).
- **Notes:** This view rendered with a hardcoded payload **is** the static
  baseline (plan item 10). One artifact, two duties.

### 2. `ai_agentic_work`
The differentiator view. Triggered by AI/agentic/human-in-the-loop intent.

- **record_ids:** 1–3 `cs:` tagged to AI competencies, interleaved with
  supporting `block:` anecdotes/artifact captions relevant to the asked
  question. Composition varies per question — two visitors should see
  different assemblies here.
- **emphasis:** `explainability` | `human_in_loop` | `architecture` |
  `outcomes`.

### 3. `case_deep_dive`
"Tell me about X." One project, full structure.

- **record_ids:** exactly 1 `cs:` in position 0 (the subject), followed by
  its section `block:` IDs in narrative order (problem → role → decisions →
  outcome). Router may reorder/omit sections per Levels 0–1.
- **emphasis:** `process` | `decisions` | `outcomes` | `craft`.
- **Constraint:** all `block:` IDs after position 0 must belong to that case
  study. Resolver enforces; cross-study blocks are dropped and logged.

### 4. `conversational_fallback`
The long tail — oddball, personal, or unmatchable questions.

- **record_ids:** 0–2 `block:` IDs from a set of **pre-authored answer
  blocks** (e.g. "outside work," "how this site works," "contact"), plus up
  to 2 `cs:` as "you might have meant" suggestions.
- **emphasis:** `redirect` (nudge toward a structured view) | `answer`
  (the authored block is the answer).
- **Honest empty state:** if nothing matches, the router returns
  `record_ids: []` and the component renders an authored
  "I don't have content that answers that — here's what I can show you"
  block. The router **never** bridges gaps with generated text.

---

## ⚠️ One deviation to confirm

The original 8-view plan described this fallback as a "grounded text answer" —
i.e., AI-generated prose. **That is incompatible with Option A.** This
contract replaces it with pre-authored answer blocks + honest empty state.
Cost: the long tail is only as good as the answer blocks you write.
Benefit: the boundary story stays absolute — *no* generated sentence appears
anywhere on the site, including the fallback. Confirm or push back before
committing.

---

## Router response envelope (full)

```ts
interface RouterResponse {
  view: ViewName;
  record_ids: string[];      // namespaced, ordered, may be []
  emphasis: EmphasisValue;   // must be legal for the chosen view
  confidence: 'high' | 'medium' | 'low';
  // low → frontend prefers conversational_fallback or static baseline
}
```

`confidence` exists so the frontend can degrade gracefully without the router
ever guessing. It gates *which* authored content shows — it is not a license
to generate.

## Events log shape (plan item 11)

```ts
interface RoutingEvent {
  question: string;          // visitor's raw input
  response: RouterResponse;  // what the router returned
  ts: string;
  session_id: string;
}
```
