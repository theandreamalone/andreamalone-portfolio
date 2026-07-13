# Voice-Ready AI Experience — session tracking

Snapshot of everything produced and decided in this session. Use this as the
single check-in point next time, instead of re-deriving from chat history.

## Files ready to drop into the repo

- `voice-ready-ai-experience.mdx` — main frontmatter, 3 fields still TBD (see below)
- `voice-ready-ai-experience-problem.mdx` — problem prose, 2 lines flagged VERIFY
- `voice-ready-ai-experience-solution.mdx` — solution prose, 6 sections, 1 flagged
  for update once accessibility is approved
- `response-engine-pipeline.svg` — the intent → schema → blocks → human review →
  output diagram. Ready to use as a `media_assets` entry once you decide anon vs
  real (this one has no client branding, so one version is fine)

## Still needs your input before this is fully locked

| Item | What's needed |
|---|---|
| `duration` (frontmatter) | Real project duration |
| `project_year` (frontmatter) | Year it shipped |
| `has_demo_video` (frontmatter) | Confirm if `Immersive_Chat_Prototype_.mov` is the linked demo |
| Outcome metrics | Real numbers for task-completion-improvement and time-on-task-reduction, or drop them if not defensible |
| Accessibility section wording | Currently framed "in progress" — flip to completed language once you confirm sign-off |

## Open Figma/design to-dos (not blocking the case study, but flagged earlier)

- Rename "Tablet prototype" page → "Desktop prototype" (mislabeled, confirmed by you)
- Update Figma status chips to "Client Approved"
- Replace remaining Lorem ipsum in History Panel Flow and Section 1/2 frames before
  those are shown anywhere
- Label Section 1/2 frame sequences as process/handoff material if shown at all,
  so they don't read as unfinished final design
- Desktop screens still need to catch up to the newly-approved voice-first
  patterns — focused comparison not yet done (paused to prioritize this consolidation)

## Portfolio-structure recommendations (from the "how" discussion)

1. Lead the case study page with the response-architecture diagram, not chat screenshots
2. Show one worked trace (Root Cause) rather than all seven intents
3. Put the intent-classification correction as a callout next to the diagram, not buried in prose
4. Reframe chat screens as "what the user sees as a result of this logic," not the main event

## Open audit items not yet completed

- Desktop prototype and Mobile prototype pages: inventoried by name only, not yet screenshotted for content
- Focused screen-by-screen Desktop-vs-Mobile gap check: paused per your redirect, ready to resume on request

## Naming clarification (for future sessions)

"Pipeline diagram" has been used for two different things in your project:
1. This session's **NetHive IQ response-engine pipeline** (case study content)
2. A separate **portfolio-site AI orchestration pipeline** (Author → Sync → Query →
   Render) built in an earlier session — how your own site personalizes itself

Keep these distinct if referencing either in a future chat or with ChatGPT.
