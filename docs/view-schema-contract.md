# View Schema Contract — v2 (sections model)

**Status:** Locked once committed. Supersedes v1 (views-as-templates). The
router now composes **sections**, not views. Views were retired 2026-07-13.
**Plan reference:** `portfolio-master-plan.md` Section 1B step 2.
**Guiding star:** `ai-orchestration-purpose.md` — record_ids are the payload
that matters. Composition = section arrangement.
**Companion code:** `src/lib/viewContract.ts` (types must stay in sync with
this doc; this doc wins on conflict).
**Section vocabulary:** `src/lib/templateGlossary.ts` (mappers + data shapes).

---

## The contract in one line

The router returns **`{ sections, confidence, intent_tag? }`** where each
section carries its kind, order, record IDs, and optional emphasis/variant.
IDs and enums only, never text.

```json
{
  "sections": [
    { "kind": "Hero", "order": 0, "record_ids": ["block:home-hero"] },
    { "kind": "CaseStudyFeature", "order": 1, "record_ids": ["cs:voice-ready-ai-experience"], "emphasis": "ai_focus" },
    { "kind": "CaseStudyBento", "order": 2, "record_ids": ["cs:nethive-iq", "cs:fault-iq", "cs:executive-dashboard"] },
    { "kind": "CTABar", "order": 3, "record_ids": ["cta:contact-primary"] }
  ],
  "confidence": "high",
  "intent_tag": "landing_default"
}
```

The same site, composed differently per question: a leadership question might
return `[Hero, Testimonials, CareerHighlights, CaseStudyBento(leadership-tagged), CTABar]`.

---

## Invariants (apply to every response)

1. **No text fields.** The router never returns prose, titles, labels, or
   summaries. Any schema change adding a free-text field is a
   claims-integrity violation by definition.
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
  confidence: 'high' | 'medium' | 'low';
  intent_tag?: string;
}

interface SectionSpec {
  kind: SectionKind;
  order: number;
  record_ids: RecordId[];
  emphasis?: string;
  variant?: string;
}
```

`confidence` is not a license to generate. `intent_tag` is metadata for the
events log; it is NOT a layout directive.

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
