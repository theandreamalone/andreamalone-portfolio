# MDX Block Conventions — chunking & ID naming

**Status:** Locked once committed. Aligned to the actual n8n parser and DB
schema; supersedes the earlier draft that invented `block_type`, `owner`,
`competencies` (those didn't match reality).
**Plan reference:** `portfolio-master-plan.md` Section 1B step 3.
**Contract:** `docs/view-schema-contract.md` — defines what `block:` IDs must
resolve to; this doc defines how blocks are authored and named.

---

## The one rule everything follows

**A block's slug is its filename stem.** `content/blocks/home-hero.mdx` →
frontmatter `slug: home-hero` → `block:home-hero` in router payloads. No
separate ID field, no mapping table to drift out of sync.

Consequences:
- **Renaming a file is a breaking change** — every stored/routed reference to
  the old slug dies silently (dropped + logged, per contract invariant 5).
  Treat block filenames like API names.
- **Slugs must be globally unique** across `content/blocks/` and
  `content/case-studies/`. `blockRegistry.ts` errors on duplicates at build
  time.

## Naming pattern

`{owner}-{purpose}[-{variant}]`, kebab-case, lowercase, no spaces. Ownership
is prefix-derived — the deep-dive view checks that block slugs start with the
subject case study's slug.

| Kind | Pattern | Examples |
|------|---------|----------|
| Site-level block | `{page}-{purpose}` | `home-hero`, `home-intro-recruiter` |
| Case-study section | `{cs-slug}-{section}` | `voice-ready-ai-problem`, `fault-iq-solution` |
| Case-study anecdote | `{cs-slug}-{topic}-anecdote` | `voice-ready-ai-hitl-anecdote` |
| Fallback answer | `fallback-{topic}` | `fallback-empty-state`, `fallback-contact` |
| Level 3 framing (deferred) | `{owner}-{purpose}--{framing}` | `voice-ready-ai-outcome--business`, `--systems` |

## Frontmatter contract (must match the n8n parser)

Field names below are what the parser reads. Different names = the row is
skipped silently.

```yaml
---
type: block                                    # required — parser router
slug: fallback-empty-state                     # required — must equal filename stem
page: fallback                                 # where in the site this belongs
section: fallback                              # sub-zone; fallbacks all use section: fallback
component: FallbackBlock                       # component to render with
content_type: paragraph                        # required
audience: [recruiter, hiring-manager]          # routing signal — who sees this
skill: [explainability, ai-governance]         # routing signal — what competencies it proves
proof_type: scoped-visible                     # what kind of evidence this is
status: published                              # published | draft
order: 0                                       # ordering within section
---
```

**Legal `type` values** (parser reads `fm.type`):
`page`, `block`, `case_study`, `testimonial`, `media`. Any other value → row
skipped. Everything under `content/blocks/` uses `type: block`.

**Fallback blocks use `page: fallback`, `section: fallback`.** This lets the
router query "any fallback-eligible block" broadly. Which specific fallback
surfaces is determined by the router payload (the `FALLBACK_ANSWER_BLOCKS`
allowlist in `blockRegistry.ts`), not by finer `section` sub-classification.

## Chunking rules (what makes one block)

1. **One block = one retrievable answer unit.** If the router would ever want
   to show this piece *without* its neighbors, it's its own block.
2. **Blocks are self-contained.** No "as mentioned above" — a block may render
   in any view, in any order (Level 0), next to any neighbor.
3. **Claims stay atomic to their evidence.** A metric mentioned in prose must
   match the structured Supabase value for the same fact. Caveats live inside
   the block; emphasis may never separate a claim from its qualifier
   (Level 2 rule).
4. **Anecdotes are first-class blocks**, not paragraphs inside sections —
   they are the composition layer's main ammunition (guiding star: evidence
   composition is where the value lives).

## Sync + routing flow

```
author MDX ──▶ frontmatter ──n8n parser──▶ Supabase content_blocks (metadata)
         └──▶ prose body ──build──▶ bundled via blockRegistry (frontend only)

router reads Supabase metadata ──▶ returns block: IDs ──▶ registry resolves locally
```

The prose and the metadata about it travel two permanently separate paths.
That separation *is* the boundary story, mechanically.

## Parser-related gotchas

- **No inline YAML comments in frontmatter values** — the parser strips
  trailing `# ...` before coercion, but keeping frontmatter comment-free
  avoids edge cases (plan item 27).
- **Adding a new `type` value requires updating the parser's branch list.**
  The parser has an explicit list of legal `type` values; unlisted values
  are silently emitted as `{ fn: 'skipped' }`. Anything not in
  `[page, block, case_study, testimonial, media]` will not sync until the
  parser is updated. When adding a new type, update this doc, the parser
  Code node, and any DB tables in one changeset.
- **Section prose files** (`{cs}-problem.mdx`, `{cs}-solution.mdx`) must
  either include `type: block` (to sync) or be treated as frontend-only and
  excluded upstream. A file with no `type:` field is skipped silently — this
  is likely why `executive-dashboard-problem.mdx` isn't syncing today.
