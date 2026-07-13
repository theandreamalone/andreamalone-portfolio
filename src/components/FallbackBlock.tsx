/**
 * FallbackBlock — renders a fallback answer block's MDX prose.
 *
 * Referenced by frontmatter `component: FallbackBlock` in
 * content/blocks/fallback-*.mdx. Kept deliberately minimal — the router
 * decides *which* block; this component only decides *how* one renders.
 *
 * Styling is left generic on purpose (no props for variants) so the four
 * fallback blocks read consistently and no per-block styling drift can
 * quietly change what a reasonable viewer walks away with (Level 2 rule).
 *
 * Contract: docs/mdx-block-conventions.md — frontmatter `component` value
 * must match this component's name exactly.
 */

import type { ReactNode } from 'react';

interface FallbackBlockProps {
  children: ReactNode;
}

export default function FallbackBlock({ children }: FallbackBlockProps) {
  return (
    <div className="fallback-block" role="region" aria-label="Response">
      {children}
    </div>
  );
}
