# Content frontmatter contract (matches your n8n parser exactly)

Routing is by an explicit `type:` field in frontmatter — **not** folder path.
Folders below are just for human organization; the parser doesn't care where
a file lives.

| `type:` value | Synced via | Key field |
|---|---|---|
| `page` | sync_page | `slug` |
| `block` | sync_block | `slug` (→ block_slug in DB) |
| `case_study` | sync_case_study | `slug`, nested `sections[]` + `outcomes[]` |
| `testimonial` | sync_testimonial | `slug` (→ quote_slug in DB) |
| `media` | sync_media | `file_name` |

**Frontmatter uses `order`, not `sort_order`** — the parser reads `fm.order`
and maps it to `sort_order` on the way out.

**Every file needs `slug`** — the parser reads one uniform `fm.slug` field
regardless of type, then renames it per-table on emit (block_slug,
quote_slug, etc.). Don't write `block_slug:` or `quote_slug:` in the
frontmatter itself — just `slug:`.

## Files that do NOT get synced

`case-study-sections/*.mdx` (the actual case-study prose) have no matching
`type:` in the parser — the case_study_sections table has no prose column,
so there's nothing for these to sync to. The parser would emit them as
`{ fn: 'skipped' }`.

**Action needed:** exclude this folder from whatever file glob feeds the
n8n workflow (e.g. don't include `case-study-sections/**` in the GitHub
Action step that lists files for the Code node). The frontend reads these
files directly at build time, keyed by `mdx_slug`, bypassing Supabase
entirely — consistent with content_blocks/case_study_sections storing no
body text.

## Files in this batch
- `pages/home.mdx` — type: page
- `blocks/home-hero.mdx`, `home-intro-recruiter.mdx`, `home-intro-hiring-manager.mdx` — type: block
- `case-studies/nethive-iq.mdx` — type: case_study (sections/outcomes nested inline)
- `case-study-sections/nethive-iq-problem.mdx`, `nethive-iq-solution.mdx` — NOT synced, frontend-only
- `testimonials/nethive-lead.mdx` — type: testimonial

Placeholder copy (`[Replace with...]`, `TBD`) needs real content before syncing.
