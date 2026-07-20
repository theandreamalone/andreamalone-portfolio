/**
 * CaseStudyBody — renders a case study's section blocks in authored order.
 *
 * Order and membership come from the case study MDX file's own `sections:`
 * frontmatter, bundled at build time — no DB query, matching the
 * "static page with fixed order" pattern (codebase-ground-truth.md, Part 4).
 * Prose resolves through blockRegistry (Option A enforcement point).
 *
 * Draft section blocks are skipped. Unknown mdx_slugs are dropped with a
 * console warning (contract invariant 5) — never rendered as empty shells.
 *
 * Images inside section MDX render native-ratio, full column width
 * (see case-study-body.css). Processed via `npm run images` body preset.
 */

import { blockFrontmatter, resolveBlock } from '@/lib/blockRegistry';
import type { BlockId } from '@/lib/viewContract';
import './case-study-body.css';

interface SectionEntry {
  mdx_slug?: string;
  order?: number;
}

interface CaseStudyBodyProps {
  /** case study slug, e.g. "voice-ready-ai-experience" */
  slug: string;
}

export default function CaseStudyBody({ slug }: CaseStudyBodyProps) {
  const csFm = blockFrontmatter(`block:${slug}` as BlockId);
  const sections = Array.isArray(csFm?.sections)
    ? (csFm!.sections as SectionEntry[])
    : [];

  const blocks = [...sections]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((s) => {
      if (!s.mdx_slug) return [];
      const id = `block:${s.mdx_slug}` as BlockId;
      const Component = resolveBlock(id);
      if (!Component) return []; // resolveBlock already warned
      const fm = blockFrontmatter(id);
      if (fm?.status === 'draft') return [];
      return [{ id, Component }];
    });

  if (blocks.length === 0) return null;

  return (
    <div className="case-study-body">
      {blocks.map(({ id, Component }) => (
        <section key={id} className="case-study-body-section">
          <Component />
        </section>
      ))}
    </div>
  );
}
