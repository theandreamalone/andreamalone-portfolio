// ============================================================================
// caseStudies.ts
// Fetches all case studies for the grid/archive page (route: /case-studies).
// RLS ensures only published rows are returned to anon.
// ============================================================================

import { supabase } from '@/lib/supabaseClient';
import type { CaseStudyRow } from '@/lib/templateGlossary';

export async function fetchCaseStudies(): Promise<CaseStudyRow[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      slug,
      title,
      short_description,
      project_year,
      duration,
      has_demo_video,
      cover:media_assets!cover_media_id ( file_url ),
      case_study_skills ( skills ( slug, name ) )
    `)
    .order('project_year', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCaseStudies error:', error);
    throw error;
  }
  if (!data) return [];

  return data.map((row: any) => {
    const skills = ((row.case_study_skills as any[]) ?? [])
      .map((r) => r.skills)
      .filter(Boolean);
    const cover = row.cover as { file_url?: string } | null;

    return {
      slug: row.slug,
      title: row.title,
      short_description: row.short_description ?? '',
      thumbnail_url: cover?.file_url ?? '',
      project_year: row.project_year,
      timeline: row.duration,   // schema.duration renamed to glossary.timeline
      skills,
      has_demo_video: row.has_demo_video,
    };
  });
}

/**
 * Batch fetch by slug. Needed because router payloads carry N `cs:` IDs and
 * there was previously no way to resolve a specific set (only "one" or "all").
 *
 * Contract invariant 2: record_ids order is meaningful. Postgres `.in()` does
 * NOT preserve the order of the supplied array, so we re-sort to match the
 * requested slug order before returning. Do not remove that step.
 *
 * Contract invariant 5: unknown IDs are dropped and logged, never rendered
 * as empty shells.
 */
export async function fetchCaseStudiesBySlugs(slugs: string[]): Promise<CaseStudyRow[]> {
  if (slugs.length === 0) return [];

  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      slug,
      title,
      short_description,
      project_year,
      duration,
      has_demo_video,
      cover:media_assets!cover_media_id ( file_url ),
      case_study_skills ( skills ( slug, name ) )
    `)
    .in('slug', slugs);

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('[fetchCaseStudiesBySlugs] query failed', error);
    return [];
  }

  const rows: CaseStudyRow[] = data.map((row: any) => {
    const skills = ((row.case_study_skills as any[]) ?? [])
      .map((r) => r.skills)
      .filter(Boolean);
    const cover = row.cover as { file_url?: string } | null;
    return {
      slug: row.slug,
      title: row.title,
      short_description: row.short_description ?? '',
      thumbnail_url: cover?.file_url ?? '',
      project_year: row.project_year,
      timeline: row.duration,
      skills,
      has_demo_video: row.has_demo_video ?? false,
    };
  });

  // Re-order to match the requested slugs (Level 0 — router order is the design).
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const ordered: CaseStudyRow[] = [];
  for (const slug of slugs) {
    const hit = bySlug.get(slug);
    if (hit) ordered.push(hit);
    // eslint-disable-next-line no-console
    else console.warn(`[fetchCaseStudiesBySlugs] unknown slug dropped: ${slug}`);
  }
  return ordered;
}
