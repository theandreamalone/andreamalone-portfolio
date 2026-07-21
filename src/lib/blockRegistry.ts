/**
 * Block Registry — resolves `block:` record IDs to bundled MDX components.
 *
 * Option A enforcement point: prose never enters the database. Every MDX
 * file under content/ is eagerly bundled at build time; resolution is a
 * local lookup, never a runtime fetch. (Mechanism extracted from
 * AdaptiveBlock.tsx, which this supersedes once views ship — see
 * portfolio-master-plan.md item 1 ruling, 2026-07-12.)
 *
 * Conventions: docs/mdx-block-conventions.md — that doc wins on conflict.
 * Contract: src/lib/viewContract.ts (BlockId type).
 */

import type { ComponentType } from 'react';
import type { BlockId, CaseStudyId } from '@/lib/viewContract';

// Eagerly bundle all prose sources at build time.
const blockModules = import.meta.glob('/content/blocks/*.mdx', { eager: true });
const caseStudyModules = import.meta.glob('/content/case-studies/*.mdx', {
  eager: true,
});
// Testimonial quote prose (Option A applies here too — quotes live in MDX,
// the testimonials table holds metadata only). AuthorCard resolves
// `block:{quote_slug}` through this same registry.
const testimonialModules = import.meta.glob('/content/testimonials/*.mdx', {
  eager: true,
});

type MdxModule = { default: ComponentType; frontmatter?: Record<string, unknown> };

/** filename stem → module, built once at module load. */
const registry: Map<string, MdxModule> = new Map();

function ingest(modules: Record<string, unknown>) {
  for (const [path, mod] of Object.entries(modules)) {
    const stem = path.split('/').pop()!.replace(/\.mdx$/, '');
    if (registry.has(stem)) {
      // Duplicate stems across folders would make block: IDs ambiguous.
      console.error(`[blockRegistry] duplicate block slug: "${stem}" (${path})`);
      continue;
    }
    registry.set(stem, mod as MdxModule);
  }
}

ingest(blockModules);
ingest(caseStudyModules);
ingest(testimonialModules);

/** Strip the `block:` namespace prefix. */
function slugOf(id: BlockId): string {
  return id.slice('block:'.length);
}

/**
 * Resolve a block: ID to its MDX component.
 * Contract invariant 5: unknown IDs return null (caller drops + logs),
 * never an empty shell, never a guess.
 */
export function resolveBlock(id: BlockId): ComponentType | null {
  const mod = registry.get(slugOf(id));
  if (!mod) {
    console.warn(`[blockRegistry] unknown block id dropped: ${id}`);
    return null;
  }
  return mod.default;
}

/** Frontmatter access for a block (registry metadata, not for display logic). */
export function blockFrontmatter(id: BlockId): Record<string, unknown> | null {
  return registry.get(slugOf(id))?.frontmatter ?? null;
}

/**
 * case_deep_dive structural rule (view-schema-contract.md, view 3):
 * every block after position 0 must belong to the subject case study.
 * Membership convention: block slug starts with the case study slug
 * (e.g. cs:voice-ready-ai owns block:voice-ready-ai-problem).
 */
export function blockBelongsToCaseStudy(id: BlockId, cs: CaseStudyId): boolean {
  const csSlug = cs.slice('cs:'.length);
  return slugOf(id).startsWith(`${csSlug}-`);
}

/**
 * The authored answer-block set legal in conversational_fallback.
 * Keep in sync with content/blocks/fallback-*.mdx — the view drops any
 * block: ID not in this set.
 */
export const FALLBACK_ANSWER_BLOCKS: readonly BlockId[] = [
  'block:fallback-empty-state',
  'block:fallback-outside-work',
  'block:fallback-how-this-site-works',
  'block:fallback-contact',
] as const;

export function isFallbackAnswerBlock(id: BlockId): boolean {
  return (FALLBACK_ANSWER_BLOCKS as readonly string[]).includes(id);
}

/** All registered slugs — for the router's system prompt (legal ID list). */
export function allBlockIds(): BlockId[] {
  return [...registry.keys()].map((s) => `block:${s}` as BlockId);
}
