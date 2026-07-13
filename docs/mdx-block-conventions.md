# MDX Block Conventions — chunking & ID naming

**Status:** Locked once committed. `blockRegistry.ts` and the router's legal-ID
list depend on these rules.
**Plan reference:** `portfolio-master-plan.md` Section 1B step 3.
**Contract:** `docs/view-schema-contract.md` — defines what `block:` IDs must
resolve to; this doc defines how blocks are authored and named.

---

## The one rule everything follows

**A block's ID is its filename stem.** `content/blocks/home-hero.mdx` →
`block:home-hero`. No separate ID field, no mapping table to drift out of
sync. The registry builds itself from the file tree at build time.

Consequences:
- **Renaming a file is a breaking change** — every stored/routed reference to
  the old ID dies silently (dropped + logged, per contract invariant 5).
  Treat block filenames like API names.
- **Stems must be globally unique** across `content/blocks/` and
  `content/case-studies/`. The registry errors on duplicates at build time.

## Naming pattern

`{owner}-{purpose}[-{variant}]`, kebab-case, lowercase, no spaces.

| Kind | Pattern | Examples |
|------|---------|----------|
| Site-level block | `{page}-{purpose}` | `home-hero`, `home-intro-recruiter` |
| Case-study section | `{cs-slug}-{section}` | `voice-ready-ai-problem`, `fault-iq-solution` |
| Case-study anecdote | `{cs-slug}-{topic}-anecdote` | `voice-ready-ai-hitl-anecdote` |
| Fallback answer | `fallback-{topic}` | `fallback-outside-work`, `fallback-empty-state` |
| Level 3 framing (deferred) | `{owner}-{purpose}--{framing}` | `voice-ready-ai-outcome--business`, `--systems` |

**Case-study ownership is prefix-derived:** `blockBelongsToCaseStudy()` checks
that the block slug starts with the case study slug. This is why case-study
blocks must lead with the exact `cs:` slug — it's structural, not cosmetic.

## Chunking rules (what makes one block)

1. **One block = one retrievable answer unit.** If the router would ever want
   to show this piece *without* its neighbors, it's its own block. A problem
   statement and a solution narrative are two blocks; three paragraphs of one
   argument are one block.
2. **Blocks are self-contained.** No "as mentioned above" — a block may render
   in any view, in any order (Level 0), next to any neighbor.
3. **Claims stay atomic to their evidence.** A metric mentioned in prose must
   match the structured Supabase value for the same fact. If a claim can't
   survive being shown alone, it needs its caveat *inside the block* —
   emphasis may never separate a claim from its qualifier (Level 2 rule).
4. **Anecdotes are first-class blocks**, not paragraphs inside sections — they
   are the composition layer's main ammunition (guiding star: evidence
   composition is where the value lives).

## Frontmatter (registry metadata)

```yaml
---
block_type: section | anecdote | fallback | site   # required
owner: voice-ready-ai        # cs slug, or "site"   # required
competencies: [human-in-the-loop, explainability]   # routing signal (step 5)
status: published | draft                           # required
---
```

- Frontmatter is **selection metadata** — it syncs to Supabase
  (`content_blocks`) via n8n so the router can select against it.
- The prose body **never syncs** (Option A). n8n scope stays frontmatter-only.
- No inline YAML comments in frontmatter (known n8n parser bug, plan item 27).

## Sync + routing flow

```
author MDX ──▶ frontmatter ──n8n──▶ Supabase content_blocks (metadata)
         └──▶ prose body ──build──▶ bundled via blockRegistry (frontend only)

router reads Supabase metadata ──▶ returns block: IDs ──▶ registry resolves locally
```

The prose and the metadata about it travel two permanently separate paths.
That separation *is* the boundary story, mechanically.
