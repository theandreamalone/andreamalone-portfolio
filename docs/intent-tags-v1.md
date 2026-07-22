# Intent Tags — v1

_Date: 2026-07-21. Companion to the response ladder (`codebase-ground-truth.md`,
"The response ladder"). Implements Rung 2 — templated answer composition._

Source of truth for the id → `intent_frame` map. The map itself is seeded in code at
`src/lib/intentFrames.ts` — this doc explains it; that file is what the router imports.

## Conventions

- Tag ids: snake_case (matches existing convention: `enterprise_scale`, etc.)
- `intent_frame` completes the template `"You're asking {intent_frame}."` — authored
  here, never paraphrased by the model.
- The router must map every question to exactly one tag. `general_overview` and
  `out_of_scope` are the catch-alls; the router never invents a new tag.

## v1 tags (10)

### 1. `ai_product_experience`
The core question. "Has she designed AI products?" / "What AI work has she done?" /
"Any experience with chatbots or assistants?"
**intent_frame:** "about Andrea's experience designing AI products"

### 2. `ai_design_patterns`
Pattern-vocabulary questions from sophisticated readers. "Has she worked with
human-in-the-loop patterns?" / "How does she handle AI trust and transparency?" /
"Agentic UX experience?"
**intent_frame:** "about the AI design patterns Andrea has worked with — trust, transparency, human-in-the-loop"

### 3. `accessibility`
"What's her accessibility experience?" / "Does she do WCAG work?" / "A11y annotations?"
**intent_frame:** "about Andrea's accessibility work"

### 4. `evaluation_rigor`
Process and quality questions. "How does she evaluate her designs?" / "Does she do
heuristic evaluations?" / "How does she measure success?"
**intent_frame:** "how Andrea evaluates and improves the products she designs"

### 5. `enterprise_experience`
Company/scale credibility. "Has she worked at large companies?" / "Fortune 500
experience?" / "Tell me about her AT&T work." (Note: distinct from the deferred
`enterprise_scale` scoring label — this is a v1 routing intent, answering "where has
she worked," not a competency score.)
**intent_frame:** "about Andrea's enterprise and Fortune 100 experience"

### 6. `specific_project`
Visitor names a project. "Tell me about Dynamo AI." / "What's the DIVA project?" /
"The healthcare app?"
**intent_frame:** "about a specific project of Andrea's"

### 7. `technical_capability`
Build/code questions. "Can she code?" / "Does she work with React?" / "How technical
is she?" / "What's her Figma depth?"
**intent_frame:** "about Andrea's technical and tooling capabilities"

### 8. `process_collaboration`
How-she-works questions. "What's her design process?" / "How does she work with
engineers?" / "How does she handle stakeholders?"
**intent_frame:** "how Andrea works — her process and collaboration style"

### 9. `general_overview`
Catch-all for broad or vague-but-in-scope questions. "Who is Andrea?" / "Show me her
best work." / "Why should we hire her?"
**intent_frame:** "for an overview of Andrea's strongest work"

### 10. `out_of_scope`
Anything unanswerable from the corpus: salary, availability, references, personal
questions, off-topic. Router returns this tag with `confidence: 0` → frontend renders
the static fallback plus a pointer to the contact path. No answer is composed.
**intent_frame:** _(none — never rendered)_

## Seed map (paste-ready)

```json
{
  "ai_product_experience": "about Andrea's experience designing AI products",
  "ai_design_patterns": "about the AI design patterns Andrea has worked with — trust, transparency, human-in-the-loop",
  "accessibility": "about Andrea's accessibility work",
  "evaluation_rigor": "how Andrea evaluates and improves the products she designs",
  "enterprise_experience": "about Andrea's enterprise and Fortune 100 experience",
  "specific_project": "about a specific project of Andrea's",
  "technical_capability": "about Andrea's technical and tooling capabilities",
  "process_collaboration": "how Andrea works — her process and collaboration style",
  "general_overview": "for an overview of Andrea's strongest work"
}
```

## Reserved (deferred per master-plan §1D — do not score in v1)

`enterprise_scale`, `leadership`, `design_systems`, `competency_map` — these are
scoring labels, not routing intents. Listed here only so no one re-mints them as v1
routing tags with different semantics. When they activate (per D9, driven by events
log), they get their own intent_frame phrases at that time.

**Migration note (2026-07-21):** `hardcodedRouter.ts` previously emitted
`case_deep_dive`, `leadership`, `ai_agentic_work`, and `enterprise_scale` as its
`intent_tag` values — an ad-hoc set that predates this doc and collides with the
reserved list above. It has been rewritten to classify into the v1 tag set below.
`leadership`-flavored questions (team, manage, mentor) now route to
`process_collaboration`; `ai_agentic_work` split into `ai_product_experience` and
`ai_design_patterns`; `case_deep_dive` renamed `specific_project`;
`enterprise_scale` renamed `enterprise_experience`. `contact` and `how_this_works`
are kept as two small utility intents outside the v1 taxonomy — each already has a
single authored `FallbackAnswer` block that fully answers the question, so they
compose their own restatement directly rather than through the generic
intent_frame lookup. `personal` (hobbies/outside-work questions) now maps to
`out_of_scope` per its explicit definition above ("personal questions") — this is a
deliberate behavior change from the prior Rung-1 stub, which showed a dedicated
`fallback-outside-work` block at medium confidence. That block stays in the tree,
deprecated in place, in case this gets revisited.

## Router prompt addition

```
Classify the question into exactly one of these intent tags:
ai_product_experience, ai_design_patterns, accessibility, evaluation_rigor,
enterprise_experience, specific_project, technical_capability,
process_collaboration, general_overview, out_of_scope.

If the question spans multiple intents, choose the one the visitor most needs
answered first; do not attempt multi-intent decomposition (deferred per §1D).
If the question cannot be answered from the portfolio corpus, use out_of_scope
with confidence 0.
```

This prompt text is for step 7 (wiring the real Claude Edge Function router) — the
hardcoded stand-in (`hardcodedRouter.ts`) classifies via keyword rules instead, but
targets the same closed tag set and the same `intent_frame` map.

## Validation

1. Every tag except `out_of_scope` has a non-empty intent_frame; router errors loudly
   on a missing mapping.
2. Log the chosen tag per question in the events log — this is the data that later
   decides which deferred tags activate (D9) and whether v1 tags need splitting.
3. Smoke-test set (one question per tag, plus two ambiguous): run before ship; every
   question must land on the intended tag or the miss must be explainable.
