// ============================================================================
// caseStudyBySlug.ts
// Fetches one full case study by slug for the detail page.
// RLS ensures only published rows are returned to anon.
//
// Schema-to-glossary translations happen here:
//   schema.duration → glossary.timeline
//   media_assets.file_url (via cover_media_id FK) → glossary.thumbnail_url
//   case_study_skills → glossary.skills[]
// ============================================================================

import { supabase } from '@/lib/supabaseClient';
import type { CaseStudyRow } from '@/lib/templateGlossary';

/**
 * Extended row shape used ONLY on the detail page.
 * Card-level components use the leaner CaseStudyRow from the glossary.
 */
export type CaseStudyDetailRow = CaseStudyRow & {
  client_name: string | null;
  industry: string | null;
  client_disclosure: string | null;
  client_name_public: string | null;
  role_title: string | null;
  cover_alt_text: string | null;
};

/**
 * Fetch one case study by slug.
 * Returns null when no matching (published, per RLS) row is found.
 */
export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyDetailRow | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      slug,
      title,
      short_description,
      client_name,
      client_disclosure,
      client_name_public,
      industry,
      role_title,
      project_year,
      duration,
      has_demo_video,
      cover:media_assets!cover_media_id ( file_url, alt_text ),
      case_study_skills ( skills ( slug, name ) )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCaseStudyBySlug error:', error);
    throw error;
  }
  if (!data) return null;

  // Normalize the nested skills join into a flat array.
  const skills = ((data.case_study_skills as any[]) ?? [])
    .map((row) => row.skills)
    .filter(Boolean);

  const cover = data.cover as { file_url?: string; alt_text?: string } | null;

  return {
    slug: data.slug,
    title: data.title,
    short_description: data.short_description ?? '',
    thumbnail_url: cover?.file_url ?? '',
    project_year: data.project_year,
    timeline: data.duration,   // schema.duration renamed to glossary.timeline
    skills,
    has_demo_video: data.has_demo_video,
    client_name: data.client_name,
    client_name: data.client_name,
    client_disclosure: data.client_disclosure,
    client_name_public: data.client_name_public,
    industry: data.industry,
    role_title: data.role_title,
    cover_alt_text: cover?.alt_text ?? null,
  };
}
