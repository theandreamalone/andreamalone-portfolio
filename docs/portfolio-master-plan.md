# Portfolio Master Plan — Source of Truth

**Status:** Canonical project plan. Supersedes task lists reconstructed from
chat memory. Update this file as items complete; future sessions defer to it.
**Guiding star:** `ai-orchestration-purpose.md` — all scope and design
decisions are evaluated against that document.
**Last updated:** 2026-07-12
**Context:** Contract ending soon → shipping urgency. Goal state: portfolio
live and ready to promote for Lead/Principal AI Product Designer positioning.

---

## Locked decisions (2026-07-12)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Claude router runtime | **Supabase Edge Function** (uses `service_role` internally; nothing added to publishable-key registry) |
| D2 | Prose architecture | **Option A — prose never enters DB.** Router returns `{view, record_ids, emphasis}`; frontend resolves IDs to MDX blocks it already has bundled. Supabase holds selection metadata only. |
| D3 | Free-text question path | **Core, not deferred.** It is the product; chips are training wheels. |
| D4 | v1 personalization ceiling | **Levels 0–2** (ordering, selection/progressive disclosure, layout/emphasis). Level 3 deferred. |
| D5 | v1 view count | **4 of 8:** Landing/default, AI/agentic work, Case deep-dive, Conversational fallback. Views 5–8 deferred. |
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

## Section 1 — Dynamic AI-Orchestrated UI (core proof-of-concept, highest priority)

### 1A. Remaining decisions
- [x ] 1. Audit whether existing `AdaptiveBlock` (in `react-portfolio-3`) survives as-is or is superseded by the view-component architecture — do not port code the new design obsoletes

### 1B. Build (each step shippable, in order)
- [x] 2. Lock view schema as a strict JSON contract (4 v1 views: name + required data shape)
- [x] 3. Define MDX block structure: chunk prose into blocks with stable IDs + a registry mapping IDs → blocks (Option A requirement)
- [x] 4. DB readiness audit against 5-point checklist — partly done: structured outcomes columns exist; view/competency tagging does not
- [x] 5. ~~Tag records to views and competencies~~ DONE 2026-07-13 (case-study level per D9 X→Y sequencing): 8 view tags + 15 case_study_tags rows; 35 skills in reference; 27 case_study_skills rows across 4 case studies. Content_blocks skill tagging and anecdote-level tagging deferred to Y phase, driven by events log data.
- [ ] 6. Build 4 view components with hardcoded payloads; validate the feel before AI wiring
- [ ] 7. Wire Claude router as Supabase Edge Function via structured outputs/tool use — returns `{view, record_ids, emphasis}` only
- [ ] 8. Free-text question input path (core per D3): question → router → composition. pgvector semantic matching if needed for quality; evaluate after step 7
- [ ] 9. Connect loop: question → JSON → Supabase metadata fetch → frontend resolves record_ids to MDX blocks → render view → Framer Motion transition
- [ ] 10. Static baseline confirmed working (non-negotiable fallback)
- [ ] 11. Events table logging question + chosen view (cheap; interview gold)

### 1C. Trust surface
- [ ] 12. Persistent "full case study" path that ignores audience — deprioritize, never hide
- [ ] 13. Visible "Tailored for X — switch view" chip
- [x] 14. "How this site works" page — the boundary-as-product articulation (draws directly from `ai-orchestration-purpose.md`)

### 1D. Deferred (explicit, so they don't creep)
- Level 3 alternate pre-authored framings (compatible with Option A — paired MDX blocks with stable IDs, router picks the ID; deferred for deadline only)
- Views 5–8 (Enterprise scale, Leadership, Design systems, Competency/skills map)
- Anecdote-level MDX blocks tagged with specific evidence they carry (unblocks intersection composition)
- Intersection-friendly tag expansion in the `skills` and `tags` tables (informed by events log data)
- Router prompt engineering to decompose multi-dimensional questions (planned as part of step 7 refinement, not step 7 initial)
- ai-portfolio-orchestrator case study row + prose — post-ship. Blocked on the events log (item 11) producing real composition data; writing it before launch would make speculative claims about a system with no outcomes yet. Item 14 ("How this site works") carries the boundary story in v1. The three grandfathered Level 3 MDX variants already exist and stay as-is.

Move to active tasks when events log shows real questions the current tagging can't answer well (per D9).

---

## Section 2 — Site functionality (blocking)

- [x] 15. Wire up routing in `App.tsx`; connect `CaseStudyDetail.tsx` as reachable route (routing actually lives in `router.tsx`, not `App.tsx`)
- [x] 16. Wire `PortfolioArchive1` to Supabase via `mapCaseStudyToArchive1Card` — **check first:** may be absorbed by Section 1B view-component work; don't build twice
- [x] 17. Create `/case-studies` grid route
- [x] 18. Port n8n pipeline from `react-portfolio-3`; repoint source URL to `andreamalone-portfolio` once content folder exists
- [ ] 18c. Case study program-level MDX files (executive-dashboard.mdx, fault-iq.mdx, nethive-iq.mdx, voice-ready-ai-experience.mdx) — verify frontmatter matches the case_studies parser branch and that sync_case_study RPC accepts current payload.

## Section 3 — Content gaps (case studies won't hold up to review)

- [ ] 19. Fix template contamination on AT&T, DirecTV, IBM pages (World's Children content pasted in); DirecTV has no original content — rebuild from verified facts
- [ ] 20. Replace lorem ipsum in Voice-Ready AI Experience showcase screens
- [ ] 21. Resolve VERIFY-flagged frontmatter in Voice-Ready AI Experience (`has_demo_video`, `duration`, `project_year`, `short_description`)
- [ ] 22. Develop Fault IQ and Executive Dashboard case studies (both thin drafts)
- [ ] 23. Update Executive Dashboard Desktop screens to reflect approved voice-first states
- [ ] 24. Pull concrete strategic direction-setting examples from work history to back that claim in case study copy

## Section 4 — Compliance / permissions

- [ ] 25. Send T-Mobile/Amdocs disclosure permission email (drafted; all three NetHive IQ studies anonymized in the meantime)
- [ ] 26. Update Figma status chips to "Client Approved"

## Section 5 — Known bugs (fix before promotion)

- [x] 27. n8n YAML inline-comment frontmatter bug — proper regex fix (workaround: trailing comments stripped manually)
- [x] 28. Duplicate Supabase client files — resolve to single import: `from '../lib/supabaseClient'`
- [ ] 29. Leading-space filename bug in `templateGlossary.ts`

---

## Interactions & watch items

- Item 16 ↔ Section 1B: view components may supersede the Archive1 Supabase wiring. Decide during step 6.
- Item 18 ↔ Item 3: n8n sync scope stays frontmatter-only under Option A. Prose block registry is a frontend artifact, not a sync target.
- Contract deadline: if time runs out, the shippable line is end of 1B step 6 (hardcoded routing) + Sections 2, 3 (items 19–21 minimum), 4, 5.

## Immediate next step

Ground-truth repo audit of `andreamalone-portfolio` (git log, file tree, AdaptiveBlock presence, content folder state) — strike out anything Claude Code has already completed before executing this plan.
