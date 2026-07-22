# View Schema Contract — v2 (sections model)

**Status:** Locked once committed. Supersedes v1 (views-as-templates). The
router now composes **sections**, not views. Views were retired 2026-07-13.
**Plan reference:** `portfolio-master-plan.md` Section 1B step 2.
**Guiding star:** `ai-orchestration-purpose.md` — record_ids are the payload
that matters. Composition = section arrangement.
**Companion code:** `src/lib/viewContract.ts` (types must stay in sync with
this doc; this doc wins on conflict).
**Section vocabulary:** `src/lib/templateGlossary.ts` (mappers + data shapes).
**Rung 2 (2026-07-21):** the envelope now also carries `restated_question` and
`answer` — bounded, templated text, not free generation. See "The response
ladder" in `codebase-ground-truth.md` and `docs/intent-tags-v1.md`. This
amends Invariant 1 below; read that invariant's note before assuming "no text
fields" still holds literally.

---

## The contract in one line

The router returns **`{ sections, confidence, intent_tag?, restated_question?,
answer? }`** where each section carries its kind, order, record IDs, and
optional emphasis/variant. `sections` stays IDs and enums only; the two new
fields are bounded template output, never free text (see Invariant 1).

```json
{
  "sections": [
    { "kind": "Hero", "order": 0, "record_ids": ["block:home-hero"] },
    { "kind": "CaseStudyFeature", "order": 1, "record_ids": ["cs:voice-ready-ai-experience"], "emphasis": "ai_focus" },
    { "kind": "CaseStudyBento", "order": 2, "record_ids": ["cs:enterprise-network-operations", "cs:network-fault-investigation", "cs:executive-dashboard"] },
    { "kind": "CTABar", "order": 3, "record_ids": ["cta:contact-primary"] }
  ],
  "confidence": 0.87,
  "intent_tag": "ai_product_experience",
  "restated_question": "You're asking about Andrea's experience designing AI products.",
  "answer": "Yes — she led the response architecture for a voice-first AI network-operations assistant for a Fortune 100 telecommunications company."
}
```

`evidence_intro` ("Selected work below shows this in practice.") is **not**
part of this envelope — it's a fixed frontend string constant, never returned
by the router, so it can never drift. See "Router response envelope (full)"
below for field-by-field rules.

The same site, composed differently per question: a leadership question might
return `[Hero, Testimonials, CareerHighlights, CaseStudyBento(leadership-tagged), CTABar]`.

---

## Invariants (apply to every response)

1. **No *free* text fields.** The router never returns prose, titles, labels,
   or summaries it composed itself. **Amended 2026-07-21 (Rung 2):**
   `restated_question` and `answer` are the one sanctioned exception — both
   are template output, not generation: `restated_question` slots a
   pre-authored `intent_frame` phrase (author-written, keyed by `intent_tag`,
   never paraphrased) into a fixed template string; `answer` may only contain
   facts already present in the frontmatter of the selected sections' blocks
   (titles, oneLiners, metric chips, org names, tags) — no new claim, number,
   or organization name may appear that isn't already sitting in that
   metadata. Any *other* schema change adding a field that could carry
   original prose is still a claims-integrity violation by definition.
2. **`sections` order is meaningful.** Array order = page order (Level 0).
3. **Selection is disclosure, not deletion** (Level 1). Omitted sections
   are deprioritized, never unreachable. The archive path ignores payload.
4. **`emphasis` and `variant` change salience, never meaning** (Level 2).
5. **Unknown IDs are dropped by the resolver and logged.**
6. **Every payload must be renderable with zero AI calls.** Hardcoded
   payloads are the static baseline (plan item 10).

---

## ID namespaces

| Prefix | Resolves to | Source of truth |
|--------|-------------|-----------------|
| `cs:` | Case study by slug | Supabase |
| `block:` | Pre-authored prose block | Bundled MDX |
| `hl:` | Career highlight | Supabase |
| `tm:` | Testimonial | Supabase |
| `skill:` | Skill record | Supabase |
| `cta:` | Call-to-action | Supabase |
| `outcome:` | Outcome/metric | Supabase |

Anything claim-bearing must be `block:` (MDX). Anything structured (metrics,
years, tags, links) resolves via Supabase. Option A at the type level.

---

## Section kinds — v1 vocabulary

Each is a React component consuming a mapped shape from `templateGlossary.ts`.

| Kind | Purpose | Accepts | Notes |
|---|---|---|---|
| `Hero` | Intro/positioning | 1 `block:` | Usually position 0 |
| `SkillTicker` | Skill pills marquee | N `skill:` | Repurposes Section2 |
| `CaseStudyBento` | 3 case studies bento | 3 `cs:` | Section3 layout |
| `CaseStudyFeature` | Featured case study | 1 `cs:` | Section9 repurpose |
| `Testimonials` | Client/collaborator quotes | N `tm:` | Section5 layout |
| `CareerHighlights` | Work + Education tabs | N `hl:` | Section4Client (live) |
| `Outcomes` | Metric stat blocks | N `outcome:` | OdometerCounter |
| `CTABar` | Call-to-action bar | 1 `cta:` | TitleDark layout |
| `CaseStudyArchive` | Full grid | N `cs:` | archive-1 |
| `FallbackAnswer` | Pre-authored answer | 1–2 `block:` | Unmatchable questions |
| `Contact` | Contact form | none | Anchor `#contact-form` |

---

## Router response envelope (full)

```ts
interface RouterResponse {
  sections: SectionSpec[];
  confidence: number;        // 0–1. Was 'high'|'medium'|'low' pre-Rung-2.
  intent_tag?: string;
  restated_question?: string; // Rung 2 — ≤160 chars, 1 sentence, templated
  answer?: string;            // Rung 2 — ≤380 chars, 1–3 sentences, frontmatter-only
}

interface SectionSpec {
  kind: SectionKind;
  order: number;
  record_ids: RecordId[];
  emphasis?: string;
  variant?: string;
}
```

`confidence` is not a license to generate — it gates whether the two Rung 2
text fields render at all, not what they're allowed to say. `intent_tag` is
metadata for the events log; it is NOT a layout directive.

### Confidence gating (Rung 2)

- `>= 0.7`: render `restated_question` + `answer` + the fixed evidence-bridge
  line + sections.
- `0.4–0.7`: skip `answer`; render `restated_question` + the fixed string
  `"Here's the closest matching work:"` + sections.
- `< 0.4`: static fallback header only (Rung 1 behavior) + sections from the
  default composition.

Thresholds live as constants next to the hardcoded router
(`src/lib/hardcodedRouter.ts`) today; they'll move to the Edge Function when
step 7 ships. Tune from the events log, not by guessing.

## Events log shape (plan item 11)

```ts
interface RoutingEvent {
  question: string;
  response: RouterResponse;
  ts: string;
  session_id: string;
}
```

---

## What retired from v1

- The `view` field on the response envelope
- View-as-layout concept (`landing_default`, `ai_agentic_work`, etc.)
- Per-view emphasis enums

Reason: the guiding star says views are grammar, not intelligence. Sections
are the real grammar. The 8 view tags in `tags` remain but function as
*intent labels* for scoring, not layouts.
