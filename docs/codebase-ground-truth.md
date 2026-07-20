# Codebase Ground Truth

**Status:** Reference. Describes what the code and database **actually are**,
verified against the live system 2026-07-16; body-mirror and view additions verified live 2026-07-19. Where this file and any other
document disagree about *what exists*, this file wins.

**Read this before proposing anything.** Companion docs:
`portfolio-master-plan.md` (what to do), `ai-orchestration-purpose.md` (why),
`view-schema-contract.md` (the router payload), `mdx-block-conventions.md`
(authoring rules), `skills-and-positioning-reference.md` (skill vocabulary).

**Maintenance:** update when schema, vocabulary, or file paths change. A stale
entry here is worse than no entry — it will be trusted.

---

# PART 1 — Authoring content

## The one rule

**Prose only ever *originates* in MDX. The database is never a source of
prose.** Supabase holds selection metadata, plus (since 2026-07-19) a
read-only, trigger-guarded `body_text` mirror of block bodies for management
visibility — a copy, not a source; the site and router never read it. This is
locked decision D2 (Option A) and it is the site's whole positioning argument —
not a preference.

## Write one version of each block

Do **not** write per-audience length or tone variants. Tailoring happens
through *selection and emphasis* at render time, not rewritten prose (D4:
v1 ceiling is Levels 0–2). The `audience:` array says **who a block surfaces
for**, not "write it differently for them."

Card ceilings, metric-chip suppression, ordering, emphasis — all downstream
rendering concerns. Content does not encode them.

**One grandfathered exception:** the `ai-portfolio-orchestrator` case study has
`.recruiter.mdx` / `.hiring-manager.mdx` / `.engineer-peer.mdx` variants. Kept
by decision. Do not replicate that pattern anywhere else.

## Frontmatter contract — block

Field names are what the n8n parser reads. **A wrong field name means the row
is skipped silently.** No error, no warning, just absent.

```yaml
---
type: block                                    # REQUIRED — routes to a table
slug: voice-ready-ai-experience-problem        # REQUIRED — must equal filename stem
page: case-study                               # which page family
section: problem                               # sub-zone within the page
component: CaseStudySection                    # React component that renders it
content_type: prose                            # prose | paragraph
audience: [recruiter, hiring-manager]          # WHO this surfaces for
skill: []                                      # what competencies it proves
proof_type: scoped-visible
status: published                              # published | draft
order: 0                                       # narrative order within section
---
```

## Frontmatter contract — case_study

```yaml
---
type: case_study
slug: voice-ready-ai-experience
title: Voice-Ready AI Experience
client_name: T-Mobile                          # real name, never rendered when anonymized
client_disclosure: anonymized                  # anonymized | named
client_name_public: a Fortune 100 telecommunications company
industry: Telecommunications
role_title: Lead Product Designer
duration: 3 months
project_year: 2025
has_demo_video: false
short_description: ...                         # renders on cards — currently NULL on all four
status: published                              # published | draft
featured: true
sections:
  - mdx_slug: voice-ready-ai-experience-problem
    section_title: The Problem
    section_type: problem
    audience: [recruiter, hiring-manager]
    order: 0
outcomes:
  - metric_name: Task completion time          # DISPLAY LABEL, not a slug
    metric_value: "-38%"                       # authored display string
    metric_type: percentage
    order: 0
---
```

## Legal `type` values — everything else is dropped

`page` · `block` · `case_study` · `testimonial` · `media`

Any other value, or a missing `type:` field, emits `{fn: 'skipped'}` and never
reaches the database. This has already silently swallowed a dozen files.

## Real audience vocabulary

**`recruiter` · `hiring-manager` · `collaborator` · `design-leader` · `ai-reviewer`**

Hyphens, not underscores. `hiring_manager` will not match.

**`engineer` and `peer` are not audiences** in this build. They appear in an
early orchestrator prompt draft that was superseded. Ignore them.

## Real case study slugs

| slug | status | notes |
|---|---|---|
| `voice-ready-ai-experience` | published | the differentiator; multi-modal (voice + dictation + text), voice-first framing |
| `nethive-iq` | published | program-level; the only one with real outcomes |
| `fault-iq` | published | fault detection/monitoring, **not AI** (flipped per 2026-07-15 publishing rule) |
| `ai-ops-dashboard` | published | renamed from `executive-dashboard`; display title "AI Role-Adaptive Operations Dashboard"; LLM-summarized and ML-driven; has `short_description` |
| `ai-assistant-2025` | **draft** | added 2026-07-19; "Conversational AI Assistant" |

(File verified 2026-07-19. Older references to an `executive-dashboard` slug
elsewhere in this doc describe DB rows synced before the rename — re-verify
tag/skill rows against the live DB before trusting them.)

RLS on `case_studies` is `(status = 'published')`. **Draft case studies are
invisible to the site** — they resolve to nothing and get logged as dropped.
That is correct behavior, not a bug.

## Section types in use

`intro` · `problem` · `process` · `solution` · `outcomes`

Recommended full set per case study: `intro → problem → process → solution →
outcomes`. Anecdote blocks are optional composition units and are the router's
best ammunition.

## Naming — the ID *is* the filename

`content/blocks/home-hero.mdx` → `slug: home-hero` → `block:home-hero`.

**Renaming a file is a breaking change.** Every stored reference dies silently.
Treat block filenames like API names.

| Kind | Pattern | Example |
|---|---|---|
| Site block | `{page}-{purpose}` | `home-hero` |
| Case study section | `{cs-slug}-{section}` | `voice-ready-ai-experience-problem` |
| Anecdote | `{cs-slug}-{topic}-anecdote` | `voice-ready-ai-hitl-anecdote` |
| Fallback answer | `fallback-{topic}` | `fallback-empty-state` |

**Case study ownership is prefix-derived.** `blockBelongsToCaseStudy()` checks
that the block slug starts with the case study slug. Structural, not cosmetic.

Slugs must be globally unique across `content/blocks/` and
`content/case-studies/` — the registry errors on duplicates at build time.

## Two syntax rules that break the build

1. **No `<!-- HTML comments -->` in MDX.** Use `{/* MDX comments */}`. HTML
   comments crash the Vite build — this has already happened.
2. **No inline YAML comments in frontmatter.** The parser strips trailing `#`,
   but avoid the edge cases.

## Claims integrity

- Every claim maps to a skill in `skills-and-positioning-reference.md`, and
  every skill claimed is visible in the design evidence.
- Metrics in prose must match the structured value in `outcomes`.
- Caveats live **inside** the block. Emphasis may change salience, never
  meaning — so a claim must never be separable from its qualifier.
- Blocks are self-contained. No "as mentioned above" — any block may render in
  any order next to any neighbor.
- T-Mobile design system: **"contributed to," never "created/owned."**
- Pipeline: brief → ChatGPT drafts → Claude reviews → MDX commit. Claude does
  not author portfolio prose.

---

# PART 2 — Database reality

Project ref: `yscpjfbaisvdpqjdsymh`

## Tables

`career_highlights` · `case_studies` · `case_study_sections` ·
`case_study_skills` · `case_study_tags` · `components` · `contact_messages` ·
`content_blocks` · `ctas` · `media_assets` · `navigation` · `outcomes` ·
`page_tags` · `pages` · `sections` · `skills` · `tags` · `testimonials`

## Column names that trip people up

| Table | Gotcha |
|---|---|
| `content_blocks` | `block_slug`, **not** `slug` |
| `case_studies` | `slug` — inconsistent with the above, by design |
| `case_studies` | `duration` (text) maps to glossary `timeline` |
| `testimonials` | `quote_slug`; **there is no `quote` column** — prose is in MDX |
| `testimonials` | `photo_media_id` (FK), not `photo_url` |
| `case_studies` | `cover_media_id` (FK), not `thumbnail_url` |
| `outcomes` | `metric_count` (int) drives the odometer; `metric_value` (text) is display fallback |
| `ctas` | `button_text` / `target_url` / `cta_type` — no `audience`, no `target`, no `link_label` |

## content_blocks

`id` · `block_slug` · `component_id` · `content_type` · `audience[]` ·
`skill[]` · `proof_type` · `status` · `sort_order` · `source_path` ·
`synced_at` · `created_at` · `updated_at` · `layout_variant` ·
**`page`** · **`section`** · **`component`** · **`body_text`**

The page/section/component trio was added 2026-07-14. The parser had been
sending them for weeks; the RPC dropped them silently because the columns
didn't exist.

**`body_text` (added 2026-07-19) is a one-way, read-only mirror of the MDX
body.** Display/management only — the website and router never read it; the
blockRegistry remains the only render source. Option A intact: prose still
only *originates* in MDX. Guarded by trigger
`content_blocks_body_mirror_guard` (function `guard_body_text_mirror()`):
any `body_text` change is rejected unless transaction-local flag
`app.allow_body_write = 'on'` is set, which only the patched `sync_block` RPC
does (first line: `set_config('app.allow_body_write','on',true)`). Hand edits
in the table editor bounce with "body_text is a read-only mirror. Edit the
MDX file and re-sync." Escape hatch: drop trigger → edit → recreate.
Caveat: a sync payload without `body_text` nulls the mirror on update — the
n8n Code node sends it for blocks only, by design.

## Reporting views (added 2026-07-19)

Both `security_invoker = true`, dashboard use only — not for the site or API:

- **`content_inventory`** — bird's-eye of all blocks: `block_slug`, `status`,
  `audience`, `skill`, `page`, `section`, `sort_order`, plus a 100-char
  `body_preview`. No full prose.
- **`content_gaps`** — problems only: blocks with empty `skill`, blocks still
  draft, case studies missing `short_description` or `cover_media_id`.

## case_studies

`id` · `slug` · `title` · `client_name` · `industry` · `role_title` ·
`duration` · `status` · `featured` · `cover_media_id` · `source_path` ·
`synced_at` · `created_at` · `updated_at` · `project_year` ·
`has_demo_video` · `short_description` · `client_disclosure` ·
`client_name_public`

## outcomes

`id` · `case_study_id` · `metric_name` · `metric_value` · `metric_type` ·
`sort_order` · `created_at` · `updated_at` · `metric_prefix` ·
`metric_count` · `metric_suffix`

Negative metrics split: `-38%` stores as `metric_count: 38`,
`metric_prefix: '-'`, `metric_suffix: '%'` so the odometer animates.

Three rows exist, all belonging to `nethive-iq`.

## testimonials

`id` · `quote_slug` · `person_name` · `title` · `company` · `rating` ·
`photo_media_id` · `featured` · `client` · `created_at` · `updated_at`

**One row exists.** Content gap.

## ctas

`id` · `title` · `description` · `button_text` · `target_url` · `cta_type` ·
`priority` · `active` · `created_at` · `updated_at`

Two rows: "Work with me" (`contact`, high) and "See resume" (`resume`, medium).
`priority` is text — sort explicitly, never alphabetically.

## pages / sections / components

Three-level hierarchy that `sync_block` joins through to resolve
`component_id`. **Rows must exist before syncing blocks for a new page**, or
`component_id` lands NULL silently.

Currently populated:

| page | sections | component |
|---|---|---|
| `fallback` | `fallback` | `FallbackBlock` |
| `case-study` | `problem`, `solution`, `process`, `intro`, `outcomes` | `CaseStudySection` |

There is **no `sync_section` or `sync_component` RPC.** Adding a page family
means manual SQL:

```sql
insert into pages (slug, title, page_type, status)
values ('my-page', 'My Page', 'system', 'published')
on conflict (slug) do nothing;

insert into sections (page_id, name, section_type)
select p.id, s.name, 'system'
from pages p
cross join (values ('one'), ('two')) as s(name)
where p.slug = 'my-page'
on conflict (page_id, name) do nothing;

insert into components (section_id, component_name, component_type)
select s.id, 'MyComponent', 'block'
from sections s join pages p on p.id = s.page_id
where p.slug = 'my-page'
on conflict (section_id, component_name) do nothing;
```

## skills — 35 rows

Categories: AI (13) · Craft (7) · Strategy (6) · Systems (5) · Leadership (3) ·
Research (1). Slugs are kebab-case. See
`skills-and-positioning-reference.md` for the ranked list and project mapping.

## tags — 8 view tags

`landing_default` · `ai_agentic_work` · `case_deep_dive` ·
`conversational_fallback` · `enterprise_scale` · `leadership` ·
`design_systems` · `competency_map`

Stored with `tag_type = 'view'`. **Underscores here** (unlike audience values).
These are *intent labels for scoring*, not layouts — the views-as-layouts model
was retired 2026-07-13.

## Current tagging

**case_study_tags (15 rows):**

| case study | views |
|---|---|
| voice-ready-ai-experience | case_deep_dive, ai_agentic_work, enterprise_scale, leadership |
| nethive-iq | case_deep_dive, enterprise_scale, design_systems, leadership |
| fault-iq | case_deep_dive, enterprise_scale, leadership |
| executive-dashboard | case_deep_dive, ai_agentic_work, enterprise_scale, leadership |

**case_study_skills (27 rows):** 7 / 7 / 7 / 6 respectively. Depth over
breadth — 5–7 demonstrable skills each, not the full applicable list.

## RLS

| table | policy |
|---|---|
| `case_studies` | SELECT where `status = 'published'` |
| `contact_messages` | INSERT for `anon`, with length + `position('@' in email) > 1` checks |

A regex `~` check on email failed under RLS where `position()` succeeds. Don't
reintroduce the regex; validate format client-side.

## Placeholder data to know about

`media_assets` has two rows whose `file_url` contains the literal string
`YOUR-PROJECT.supabase.co`. Seeded placeholders, **not** a client
misconfiguration. `VITE_SUPABASE_URL` is correct.

---

# PART 3 — Sync pipeline

```
author MDX ──▶ frontmatter + body ──n8n──▶ Supabase (metadata + body_text mirror)
         └──▶ prose body ──vite build──▶ blockRegistry (frontend only — the render source)
```

Two permanently separate *render* paths. The mirror rides the sync path but is
read-only and display-only — nothing renders from it. The separation **is**
the boundary story, mechanically.

- **n8n** runs locally via npm — alive only while its terminal is open.
- Pipeline: GitHub API tree fetch → filter MDX → decode base64 → parse
  frontmatter (Code node) → `sync_{fn}` RPC (HTTP Request node).
- RPC URL is templated: `.../rest/v1/rpc/sync_{{ $json.fn }}`
- Body must be: `{"payload": {{ JSON.stringify($json.payload) }}}` — an
  unstringified object literal sends `[object Object]`.
- RPCs: `sync_page` · `sync_block` · `sync_case_study` · `sync_testimonial` ·
  `sync_media` · `sweep_blocks`
- Known n8n bug: the Postgres node's Query Parameters field corrupts on commas
  inside values. Use HTTP Request + RPC with JSON bodies instead.

**The parser is the silent failure point.** Wrong `type`, missing `type`, or a
misnamed field = row skipped, no error.

---

# PART 4 — Code reality

**Stack:** Vite 6 · React 19 · TypeScript · MDX · Magzin template · GSAP.
Hosting: GitHub Pages via Actions.

## Facts that contradict older notes

| Claim | Reality |
|---|---|
| Routing is in `App.tsx` | **`src/router.tsx`** |
| Framer Motion for transitions | **Not installed.** GSAP is. |
| Next.js stack | **Vite.** No API routes — router runs as a Supabase Edge Function. |
| Manifest per audience in `layout_manifests` | **Superseded.** Runtime router returns `{sections, confidence, intent_tag}`. |
| Views are layouts (`landing_default` etc.) | **Retired 2026-07-13.** Sections are the composition unit. |

## Routes

`/` → `Home` (static baseline) · `/adaptive` → `AdaptiveHome` (question-driven)
· `/case-studies` → `PortfolioArchive1` · `/case-studies/:slug` →
`CaseStudyDetail`

## Key files

| Path | Role |
|---|---|
| `src/lib/viewContract.ts` | Section kinds, ID namespaces, `RouterResponse`, validators |
| `src/lib/templateGlossary.ts` | Supabase shapes ↔ template props. **The only place row shapes live.** |
| `src/lib/blockRegistry.ts` | Resolves `block:` IDs → bundled MDX. Option A enforcement point. |
| `src/lib/staticBaseline.ts` | The hardcoded fallback composition |
| `src/lib/hardcodedRouter.ts` | Keyword router — stand-in for the Edge Function |
| `src/components/SectionRouter.tsx` | Dispatches `SectionSpec` → component |
| `src/components/CaseStudyBody.tsx` | Detail-page body (shipped 2026-07-19): renders a case study's section blocks in authored order from the program file's bundled `sections:` frontmatter, via blockRegistry. Skips drafts; drops unknown slugs with a warning. Supplies MDX components map: `ImageBento`, `ImageCarousel`, and `img` → `MdxImage`. Styling: `case-study-body.css`. |
| `src/components/media/` | `Lightbox` (shared overlay: Esc/arrows/counter) · `ImageBento` (template block-image grid; `wide` → col-12) · `ImageCarousel` (Swiper + pagination, `perView` prop) · `MdxImage` (plain markdown images). All lightbox-integrated; usable in section MDX with no imports. |
| `src/lib/queries/` | `caseStudies` · `caseStudyBySlug` · `careerHighlights` · `testimonials` · `outcomes` · `ctas` |

**Frontmatter export fix (2026-07-19):** `remark-frontmatter` alone strips
frontmatter but never exports it — `blockFrontmatter()` returned null for
every module since day one (latent; nothing consumed it until CaseStudyBody).
Fixed by adding `remark-mdx-frontmatter` to the MDX plugin chain in
`vite.config.ts`. Every MDX module now exports `frontmatter`.

**Detail page anatomy (2026-07-20):** `CaseStudyDetail.tsx` uses the
template's portfolio-details pattern — breadcrumb, uppercase `ds-4` title,
`block-banner rounded-16` cover, left `block-brief` card (client / industry /
role / timeline / skill chips / disclosure note), body in `col-lg-8`. All
four render states wrap in `<Layout headerStyle={2} footerStyle={4}>` —
the page previously had NO Layout (no header/footer/theme).

**Program-file `sections:` arrays are load-bearing** — CaseStudyBody reads
them for body order. `voice-ready-ai-experience.mdx` was missing its array
(added 2026-07-19); the other four program files had them. A case study
without a `sections:` array renders an empty body, silently.

## Section vocabulary (11)

`Hero` · `SkillTicker` · `CaseStudyBento` · `CaseStudyFeature` ·
`Testimonials` · `CareerHighlights` · `Outcomes` · `CTABar` ·
`CaseStudyArchive` · `FallbackAnswer` · `Contact`

Built and consuming `record_ids`: CaseStudyFeature (Section9), CaseStudyBento
(Section3), Testimonials (Section5), Outcomes, CTABar, FallbackAnswer, Contact.
Not yet refactored: Hero (SectionIntro), SkillTicker (Section2).
Not built: CaseStudyArchive.

## ID namespaces

`cs:` · `block:` · `hl:` · `tm:` · `skill:` · `cta:` · `outcome:`

Anything claim-bearing must be `block:` (MDX). Anything structured resolves via
Supabase. Option A at the type level.

## Patterns worth copying

- **Resolving block IDs → rendering prose:** `FallbackAnswer.tsx`.
  *Not* `CaseStudySection.tsx` — that is a dumb wrapper that fetches nothing. For ordered full-body rendering, the pattern is `CaseStudyBody.tsx`.
- **Fetching by record_ids:** `Section3.tsx` — filter prefix, warn on drops,
  fetch, map through glossary, render null when empty.
- **Order preservation:** `fetchCaseStudiesBySlugs` re-sorts after `.in()`,
  which does not preserve array order. Router order is the design (invariant 2).
- **Static page with fixed order:** hardcode IDs, resolve via blockRegistry, no
  query. Everything is bundled at build time; a DB round trip only earns its
  keep when order or selection is dynamic.

## Cover image render slots (verified 2026-07-19)

One cover (`case_studies.cover_media_id` → `media_assets.file_url`) feeds five
slots, each cropping differently:

| Slot | File | Behavior |
|---|---|---|
| CaseStudyFeature | `sections/home/Section9.tsx` | CSS background, cover, center — heavy edge crop; bottom-left caption overlay |
| Bento large | `cards/ArticleCard2.tsx` | 684×524 (~4:3), object-fit cover |
| Bento small | `cards/ArticleCard3.tsx` | 225×250, cover crop, very small |
| Grid card | `cards/ArticleCard7.tsx` | 310×206 (3:2), cover crop |
| Detail hero | `pages/CaseStudyDetail.tsx` | no fixed height — renders native ratio, uncropped |

Testimonial photos are a separate slot (`photo_media_id`,
`cards/AuthorCard.tsx`): 280×370 portrait.

Export spec derived from this: covers 1600×1200 (4:3), subject in central
~60%, no small text as content, must look composed uncropped (detail hero
shows the raw file). Testimonials ~560×740. No resize pipeline exists in
Supabase — don't upload raw 5000px exports.

In-body case study images: **rendering shipped 2026-07-19.** Section MDX may
embed `![alt](/media/{slug}/{name}.webp)`; images render native ratio, full
column width (`col-lg-8`, ~840px) via `case-study-body.css`. Export ~1700px
wide (2× column) through the body preset. Root-relative `/media/...` URLs are
correct — custom domain (CNAME), no Vite `base` subpath.

## Deprecated / dead

- `AdaptiveBlock.tsx` — superseded; its resolution mechanism became
  `blockRegistry.ts`. Still in the tree, used only by `SectionIntro`.
- Magzin sections 1, 4 (newsletter), 6, 7, 8, 10, 11 — dropped from the
  vocabulary.
- `src/data/cardHome-1.json` and legacy `Archive1-5` / `Index2-4` pages —
  unused scaffolding. Prune post-launch.
- `OdometerCounter` was dead code until Outcomes shipped; `Outcomes.tsx` is its
  only consumer.

---

# PART 5 — Locked decisions

| # | Decision |
|---|---|
| D1 | Claude router runs as a **Supabase Edge Function** (`service_role` internally) |
| D2 | **Option A** — prose never enters the DB; router returns IDs and enums only |
| D3 | **Free-text question path is core**, not deferred; chips are training wheels |
| D4 | v1 personalization ceiling: **Levels 0–2**. Level 3 deferred. |
| D6 | **Hardcoded routing first**, then wire Claude. Demo must ship on hardcoded alone. |
| D7 | Supabase is the live source of truth for **metadata**; MDX frontmatter seeds and backstops it |
| D8 | Answers must be **specific to what was asked**, not "adjacent but approved" |
| D9 | Tagging sequencing **X → Y**: ship v1 tagging, expand from real logged questions |

**Standing principles:** static baseline is non-negotiable; claims integrity is
structural, not editorial; audit ground truth before acting — parallel sessions
advance state independently.

---

# PART 6 — Known gaps

**Shipped 2026-07-19 (formerly listed here as not built):**
- `content_blocks.body_text` mirror + guard trigger + patched `sync_block` +
  n8n body payload — live, verified (34 blocks mirrored; guard rejects hand
  edits). Details in Parts 2–3.
- `content_inventory` and `content_gaps` views — live (`security_invoker`).
- `scripts/process-images.mjs` (`npm run images`) — committed and tested with
  synthetic images. First run against real Figma exports still pending, as is
  wiring the first `cover_media_id` (runbook Steps 10–11).

**Content (blocks review):**
- `short_description` NULL on all four case studies — cards render title + badge only
- Three of four have no `cover_media_id`; the fourth points at a placeholder URL
- One testimonial row
- `fault-iq` and `executive-dashboard` are thin drafts, invisible to the site

**Architecture:**
- Supabase schema is not version-controlled — no migrations in-repo. This
  already cost real debugging time (the missing `page`/`section`/`component`
  columns).
- No batch fetcher for career highlights or skills by ID yet
- `CaseStudyArchive` section not built
- Framer Motion vs GSAP discrepancy unresolved
- `media_assets` real schema now confirmed: id, file_name, file_url,
  media_type, alt_text, caption, width, height, file_size, created_at,
  updated_at. No columns beyond what codebase-ground-truth.md already
  listed as gotchas (cover_media_id / photo_media_id are FKs on other
  tables, not columns here).

**Known parser/tooling bugs:**
- n8n YAML inline-comment handling — workaround in place
- Leading-space filename bug in `templateGlossary.ts` — not present in this repo
