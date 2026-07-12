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
