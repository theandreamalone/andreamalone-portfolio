# AI Orchestration — Purpose & Function (Guiding Star)

**Status:** Canonical. All architecture, scope, and design decisions for the
dynamic UI are evaluated against this document.
**Last updated:** 2026-07-16 (vocabulary pass: views → sections, per
`view-schema-contract.md` v2, locked 2026-07-13)
**Companion docs:** `portfolio-master-plan.md` (the task-level plan; defers to
this file on questions of purpose) · `view-schema-contract.md` (the payload
shape; this file governs *why*, that file governs *structure*).

---

## The purpose

A traditional portfolio is a fixed linear artifact that every visitor must
traverse the same way, regardless of what they came to find out. A recruiter
asking "has she led teams at scale?" has to hunt.

**The purpose of the dynamic UI: the page becomes the answer to the visitor's
actual question, composed from Andrea's evidence, at the moment they ask.**

The unit of value is not the layout. It is the answer.

---

## Three layers of intelligence

The templates are only the outermost layer.

### 1. Intent understanding
Mapping a free-text question ("has she done anything with human-in-the-loop
AI?") to what the visitor is actually trying to learn. This is where AI is
non-optional; chips and dropdowns cannot do it.

### 2. Evidence retrieval and composition
Selecting **which specific records** answer that intent: which projects, which
artifacts, which metrics, which anecdote. Two visitors whose questions both
score to the `leadership` intent should see **different compositions** — one
populated with PPA direct-management evidence, another with cross-functional
Amdocs evidence — because they asked different questions. **This is where most
of the value lives.**

### 3. Arrangement (Levels 0–2 in v1; Level 3 deferred)
Ordering, disclosure, emphasis, framing. The polish layer.

---

## The section vocabulary is grammar, not intelligence

The 11 section kinds are not the intelligence — they are the **grammar**: a
safety vocabulary constraining what shapes an answer can take. The
intelligence is in composing the sentence: which evidence, what emphasis, what
sequence, in response to what was actually asked.

The 8 tags in `tags` are not layouts — they are *intent labels for scoring*.
Views-as-layouts retired 2026-07-13.

---

## What this means for the build

If the point were template-picking, the router would be trivial and the demo
thin. Because the point is question-driven composition:

- **`record_ids` are the payload that matters.** The router's real work is
  evidence selection, not section selection. The section kind is almost
  derivable from the evidence.
- **The free-text question path is the product**, not a fallback. Chips are
  training wheels for visitors; the demo moment is a recruiter typing their
  real question and watching the page rebuild as its answer.
  *(Decision 2026-07-12: promoted from deferred to core.)*
- **The tagging schema is the intelligence substrate.** How well evidence is
  tagged to competencies determines how good the compositions are. That step
  matters more than the section components.

---

## The claims-integrity boundary (restraint as product)

The AI selects and arranges; it never writes. Prose lives only in
version-controlled MDX and never enters the database (Option A, locked
2026-07-12). The router returns `{sections, confidence, intent_tag?}` — each
`SectionSpec` carrying `record_ids`. IDs and enums only, never text.

The honest tension, owned consciously: the tighter the constraint, the more
reliable and defensible the system — and the less the AI visibly *does*. The
resolution: the demonstration is not "look how much my AI generates," it is
**"look where I decided generation stops, and why."** That only lands if the
composition layer is genuinely smart. Constrained sections + dumb selection =
a dropdown with extra steps. Constrained sections + sharp evidence-matching =
the actual demo.

> Restraint you can articulate is a stronger demonstration of senior
> AI-product judgment than aggressive personalization. The boundary isn't a
> limitation to apologize for. It's the product.
