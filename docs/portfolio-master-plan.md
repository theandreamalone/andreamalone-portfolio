# Portfolio Master Plan — Source of Truth

**Status:** Canonical project plan. Supersedes task lists reconstructed from
chat memory. Update this file as items complete; future sessions defer to it.
**Guiding star:** `ai-orchestration-purpose.md` — all scope and design
decisions are evaluated against that document.
**Last updated:** 2026-07-19
**Context:** Contract ending soon → shipping urgency. Goal state: portfolio
live and ready to promote for Lead/Principal AI Product Designer positioning.

---

## Locked decisions (2026-07-12)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Claude router runtime | **Supabase Edge Function** (uses `service_role` internally; nothing added to publishable-key registry) |
| D2 | Prose architecture | **Option A — prose never enters DB.** Router returns `{sections, confidence, intent_tag?}`; each `SectionSpec` carries `record_ids`. Frontend resolves IDs to MDX blocks it already has bundled. Supabase holds selection metadata only. |
| D3 | Free-text question path | **Core, not deferred.** It is the product; chips are training wheels. |
| D4 | v1 personalization ceiling | **Levels 0–2** (ordering, selection/progressive disclosure, layout/emphasis). Level 3 deferred. |
| D5 | v1 composition scope | **Sections model (v2, 2026-07-13).** Views retired as layouts. 11 section kinds in `view-schema-contract.md`; router composes `SectionSpec[]`. The 8 tags in `tags` survive as *intent labels for scoring*, not layouts. |
| D6 | Build sequence discipline | Hardcoded routing first (plan step: view components with hardcoded payloads, validate the feel, then wire Claude). Adaptive demo must be shippable on hardcoded routing alone if the clock runs out. |
| D7 | Metadata source of truth | **Supabase is the live source of truth** for structured metadata (tags, skills, view assignments, status). MDX frontmatter carries baseline/default values that seed the DB on sync and serve as a fallback if DB values are missing. Tag/skill updates happen in Supabase, not MDX; frontmatter changes only on new content or file renames — same "static baseline as safety net" pattern as the UI fallback. |
| D8 | Composition ambition and tagging density | **Option A stays** — the AI does not generate prose — but answers must be specific to what was asked, not "adjacent but approved." Tagging must be dense enough to support intersection queries (AI × team, leadership × complex-systems, etc.), not just single-dimension filters. Anecdote-level blocks become the composition layer's main ammunition; router prompt design must decompose questions into multiple filter dimensions. |
| D9 | Tagging sequencing (X → Y) | Complete v1 tagging as scoped (case-study level, broad skill assignment). Ship v1. Log real visitor questions via the events table (item 11). Expand to anecdote-level blocks + intersection-friendly tags based on what's actually being asked — evidence-driven density beats speculative density, and it protects the contract deadline. |

**Standing principles (from memory, still binding):**
- Claims integrity is structural: AI layer touches metadata/ordering only, never prose.
- Static baseline fallback is non-negotiable — a failing adaptive demo is uniquely damaging.
- T-Mobile design system framing: "contributed to," never "created/owned."
- Audit repo ground truth before acting; parallel Claude Code sessions advance state independently.

---

## Current build phases (agreed 2026-07-19)

Near-term execution order. Phases 1–2 are new work; Phase 3 maps to existing
items 7 and 9 in Section 1B.

**Phase 1 — Body mirror + views** — ✅ SHIPPED 2026-07-19 (scope: `content_blocks` only; files always win). Column + guard trigger + `sync_block` patch + n8n body payload live; 34 blocks mirrored; guard verified rejecting hand edits; `content_inventory` and `content_gaps` views created. Recorded in `codebase-ground-truth.md`.
1. Add `body_text text` column to `content_blocks` (manual SQL — schema not version-controlled; record here and in ground truth)
2. Guard trigger `content_blocks_body_mirror_guard` / function `guard_body_text_mirror()` — rejects any `body_text` write unless transaction-local flag `app.allow_body_write` is set; error: "body_text is a read-only mirror. Edit the MDX file and re-sync."
3. Pull `sync_block` RPC source (`pg_proc`) and verify before editing — known silent-drop failure mode
4. Patch `sync_block`: accept `body_text`, set the flag via `set_config('app.allow_body_write','on',true)`
5. n8n Code node: stop discarding the MDX body; add to payload
6. Test round trip: sync one file → `body_text` populates → table-editor edit rejected by guard
7. Build two views: `content_inventory` (slug, status, audience, skills, order, ~100-char body preview — no prose) and `content_gaps` (blocks with no skills, case studies missing `short_description`, drafts)
8. Document in `codebase-ground-truth.md`

**Phase 2 — Image pipeline**
9. Presets: covers 1600×1200 center-crop · body images max 1700px wide · testimonials 560×740 · all WebP
10. `scripts/process-images.mjs` (sharp) + `npm run images`
11. Folder convention: `media/source/{slug}/` in → `public/media/{slug}/` out
12. End-to-end test with one real Figma export

**Phase 2.5 — Case study body & media (SHIPPED 2026-07-19/20, same day as Phase 1)**
Body rendering shipped: `CaseStudyBody` renders section blocks in authored
order from program-file `sections:` frontmatter (required `remark-mdx-frontmatter`
fix — see ground truth). Detail page rebuilt on the template's
portfolio-details anatomy (breadcrumb, ds-4 title, block-banner cover, brief
card w/ skills + disclosure, col-lg-8 body). Media system: `ImageBento`
(template bento grid), `ImageCarousel` (Swiper + pagination), `MdxImage`
(plain `![...]`), all opening a shared `Lightbox` (Esc/arrows/counter). All
available in section MDX with no imports. `voice-ready-ai-experience-process`
stub created (draft, [NEED] bracket) for decision-rationale progression.

**Phase 4 — Scrollytelling case study layout (NEXT session — spec below)**
Two-column case study body: sticky LEFT media pane, RIGHT prose blocks; the
media pane swaps to the active block's media as it scrolls into view (GSAP
ScrollTrigger — installed). Mobile: media renders inline above its block.

Frontmatter contract — add per section block (optional; absent = no pane
entry, prose spans full width for that block):
```yaml
media:
  - kind: bento | carousel | single
    images:
      - src: /media/{cs-slug}/{name}.webp
        alt: "..."
        wide: true        # bento tiles only
```
Build steps:
1. Extend block frontmatter parse (frontend only — `media:` does NOT sync to
   Supabase; it's a render concern, not selection metadata. n8n untouched.)
2. `CaseStudyBodyScrolly` variant: left sticky pane renders the active
   block's media via the existing ImageBento/ImageCarousel/MdxImage +
   Lightbox; right column renders prose blocks
3. GSAP ScrollTrigger sync: block enters viewport → pane crossfades
4. Reduced-motion + mobile fallback: inline media, no pinning
   (prefers-reduced-motion respected per accessibility checklist)
5. Feature-flag per case study (frontmatter `layout: scrolly`) so studies
   can adopt it one at a time

**Phase 3 — Real AI router (horizon; = items 7 + 9 remainder)**
Swap `hardcodedRouter.ts` for the Claude Supabase Edge Function. Returns
`{sections, confidence, intent_tag?}` with `record_ids` — IDs and enums only,
never prose. Nothing downstream changes on swap. Site ships fine on hardcoded.

**Note on D2/Option A:** the body mirror does not amend the boundary. Prose
still only *originates* in MDX; `body_text` is a one-way, trigger-guarded copy
for management visibility. Website and router never read it.

---

## Section 1 — Dynamic AI-Orchestrated UI (core proof-of-concept, highest priority)

### 1A. Remaining decisions
- [x] 1. Audit AdaptiveBlock — COMPLETE. Confirmed superseded by blockRegistry.ts; one live consumer remains (SectionIntro.tsx, via two <AdaptiveBlock> instances querying content_blocks directly, bypassing viewContract.ts's block: namespace). DECISION: leave as-is — will be replaced (not migrated) when Section 1B step 6 rebuilds Hero/SectionIntro as a proper view component. No standalone fix needed. (Verified 2026-07-16.)

### 1B. Build (each step shippable, in order)
- [x] 2. Lock section schema as a strict JSON contract — COMPLETE as v2 sections model (`docs/view-schema-contract.md`, locked 2026-07-13). Superseded the v1 views-as-templates wording originally here.
- [x] 3. Define MDX block structure: chunk prose into blocks with stable IDs + a registry mapping IDs → blocks (Option A requirement)
- [x] 4. DB readiness audit against 5-point checklist — COMPLETE. Tagging already exists via join tables (case_study_tags: 15 rows, case_study_skills: 27 rows). No new columns needed on case_studies; router queries through join tables. (Verified 2026-07-16.)
- [ ] 5. Tag records to intent tags and competencies — **the intelligence substrate; matters more than the section components**
- [x] 6. Build hardcoded `SectionSpec[]` compositions rendering via `SectionRouter` — COMPLETE. STATIC_BASELINE (9 sections) + hardcodedRouter.ts (7 intent rules + empty-state fallback), all dispatched through SectionRouter. (Verified 2026-07-16.)
- [ ] 7. Wire Claude router as Supabase Edge Function via structured outputs/tool use — returns `{sections, confidence, intent_tag?}` only
- [x] 8. Free-text question input path — COMPLETE. AdaptiveHome.tsx: real text input submits to hardcodedRouter's route(question); chips (SUGGESTED_QUESTIONS) are secondary, matching D3. (Verified 2026-07-16.)
- [ ] 9. Connect loop — MOSTLY COMPLETE. Question → RouterResponse → SectionRouter → section components (which fetch by record_ids) works end-to-end today, on the hardcoded router. Remaining: (a) swap in the Edge Function per item 7 (= Phase 3), (b) card layout transitions on section change. Framer Motion installed 2026-07-21 for the Rung 2 answer-composition transitions (item 19) — supersedes the 2026-07-19 GSAP-only note; GSAP remains for its existing consumers, this is not a migration.
- [x] 10. Static baseline confirmed working — COMPLETE. STATIC_BASELINE in src/lib/staticBaseline.ts. (Verified 2026-07-16.)
- [ ] 11. Events table logging question + chosen view (cheap; interview gold)

### 1C. Trust surface
- [ ] 12. Persistent "full case study" path that ignores audience — deprioritize, never hide
- [x] 13. Visible "Tailored for X — switch view" chip — SUPERSEDED by item 19 (Rung 2). The crude "Composed for: {intent_tag}" + Reset status line is replaced by the restatement/answer/evidence-bridge composition; Reset remains.
- [x] 14. "How this site works" page — the boundary-as-product articulation (draws directly from `ai-orchestration-purpose.md`). Updated 2026-07-21 with one line naming Rung 2 explicitly (see `content/blocks/fallback-how-this-site-works.mdx`).
- [x] 19. Rung 2 — templated answer composition (2026-07-21): extend router contract with `restated_question` + `answer`; author one `intent_frame` phrase per v1 intent tag; add answer-composition rules to router prompt; add confidence gating; update frontend render order; add Framer Motion transitions. Level 3 remains deferred — this item does not touch MDX. Full spec: response ladder section in `codebase-ground-truth.md` + `docs/intent-tags-v1.md`.

### 1D. Deferred (explicit, so they don't creep)
- Level 3 alternate pre-authored framings (compatible with Option A — paired MDX blocks with stable IDs, router picks the ID; deferred for deadline only)
- Intent tags beyond v1 scope (enterprise_scale, leadership, design_systems, competency_map) — these are scoring labels, not views to build. Deferred means unscored/untagged, not unbuilt. (v1 scope finalized 2026-07-21 in `docs/intent-tags-v1.md` — 10 tags, none of which are these four.)
- Anecdote-level MDX blocks tagged with specific evidence they carry (unblocks intersection composition)
- Intersection-friendly tag expansion in the `skills` and `tags` tables (informed by events log data)
- Router prompt engineering to decompose multi-dimensional questions (planned as part of step 7 refinement, not step 7 initial)
- ai-portfolio-orchestrator case study row + prose — post-ship. Blocked on the events log (item 11) producing real composition data; writing it before launch would make speculative claims about a system with no outcomes yet. Item 14 ("How this site works") carries the boundary story in v1. The three grandfathered Level 3 MDX variants already exist and stay as-is.
- Network Fault Investigation Dashboard case study (both thin drafts)
- `personal` (hobbies/outside-work) questions no longer get a dedicated answer as of item 19 — they route to `out_of_scope`. `fallback-outside-work` MDX stays in the tree if this gets revisited.

Move to active tasks when events log shows real questions the current tagging can't answer well (per D9).

**Item 5 note:** real tagging already exists (case_study_tags: 15 rows, case_study_skills: 27 rows — see item 4). hardcodedRouter.ts currently hand-duplicates an AI_CASE_STUDIES array instead of querying tags; this is intentional per the file's own comments, to be replaced when the Edge Function reads real tags directly. Not a new gap — just don't mistake the hardcoded array for the tagging step being incomplete.

---

## Section 2 — Site functionality (blocking)

- [x] 15. Wire up routing in `App.tsx`; connect `CaseStudyDetail.tsx` as reachable route (routing actually lives in `router.tsx`, not `App.tsx`)
- [x] 16. Wire `PortfolioArchive1` to Supabase via `mapCaseStudyToArchive1Card` — COMPLETE, not absorbed by Section 1B. Archive1 is a flat published-only grid (no tag/skill matching); Section 1B's view components are a separate, tag-driven system. Both coexist. (Verified 2026-07-16.)
- [x] 17. Create `/case-studies` grid route — COMPLETE, already implemented via Section1.tsx / PortfolioArchive1. Renders all 4 published case studies (network-fault-investigation and executive-dashboard now published per 2026-07-15 publishing rule). (Verified 2026-07-16.)
- [x] 18. Port n8n pipeline from `react-portfolio-3`; repoint source URL to `andreamalone-portfolio` once content folder exists
- [ ] 18c. Case study program-level MDX files (executive-dashboard.mdx, network-fault-investigation.mdx, enterprise-network-operations.mdx, voice-ready-ai-experience.mdx) — verify frontmatter matches the case_studies parser branch and that sync_case_study RPC accepts current payload.

## Section 3 — Content gaps (case studies won't hold up to review)

- [ ] 19. Fix template contamination on AT&T, DirecTV, IBM pages (World's Children content pasted in); DirecTV has no original content — rebuild from verified facts
- [ ] 20. Replace lorem ipsum in Voice-Ready AI Experience showcase screens
- [ ] 21. Resolve VERIFY-flagged frontmatter in Voice-Ready AI Experience (`has_demo_video`, `duration`, `project_year`, `short_description`)
- [ ] 22. Confirm Telecom AI Chat, Telecom AI Dashboard, and DirecTV DIVA, case studies are fully developed and ready to promote. 
- [x] 23. Update AI Dashboard Desktop screens to reflect approved voice-first states
- [ ] 24. Pull concrete strategic direction-setting examples from work history to back that claim in case study copy

## Section 4 — Compliance / permissions

- [ ] 25. Send T-Mobile/Amdocs disclosure permission email (drafted; all three Enterprise Network Operations Platform studies anonymized in the meantime)
- [ ] 26. Update Figma status chips to "Client Approved"

## Section 5 — Known bugs (fix before promotion)

- [x] 27. n8n YAML inline-comment frontmatter bug — FIXED. Root cause: blind `indexOf('#')` treated any '#' as a comment start, truncating unquoted values containing '#' (e.g. URL fragments). Fixed with whitespace-aware comment detection (# only starts a comment at string start or after whitespace). Verified via live n8n test — fragment preserved intact. (Fixed & verified 2026-07-16.)
- [x] 28. Duplicate Supabase client files — NOT A BUG. Verified via `grep -r "createClient" src` — only src/lib/supabaseClient.ts exists. No duplicate found. (Verified 2026-07-16.)
- [x] 29. Leading-space filename bug in `templateGlossary.ts` — NOT A BUG. Verified via `ls -la src/lib/` — single clean file, 22,861 bytes, no duplicate/leading-space variant present. (Verified 2026-07-16.)

---

## Interactions & watch items

- Item 16 ↔ Section 1B: RESOLVED 2026-07-16 — not superseded, both coexist. Archive1 is a flat published-only grid (no tag/skill matching); Section 1B's view components are a separate tag-driven system. No decision needed at step 6.
- Item 18 ↔ Item 3: AMENDED 2026-07-19 — n8n sync carries frontmatter *plus* the MDX body as a read-only `body_text` mirror (Phase 1). The mirror is display-only; the prose block registry remains the only render/composition source. Option A intact.
- Contract deadline: if time runs out, the shippable line is end of 1B step 6 (hardcoded routing) + Sections 2, 3 (items 19–21 minimum), 4, 5.

## Immediate next step

Execute Phase 1 (body mirror + views) per "Current build phases" above. Before
touching `sync_block` or the n8n node: pull latest and confirm no parallel
session has advanced state.
