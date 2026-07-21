// ============================================================================
// skills.ts
// Fetches skill METADATA for the About-page pill list (templateGlossary
// decision #19 — About reuses Home's skill-pill markup, wrapped in flex
// instead of the carouselTicker). mapSkillToPill only reads name and
// years_experience, so icon_url/case_study_count are stubbed here rather
// than joined — nothing downstream consumes them.
// ============================================================================

import { supabase } from '@/lib/supabaseClient';
import type { SkillRow } from '@/lib/templateGlossary';

export async function fetchSkills(): Promise<SkillRow[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('slug, name, years_experience')
    .order('name', { ascending: true });

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('[fetchSkills] query failed', error);
    return [];
  }

  return data.map((row: any) => ({
    slug: row.slug,
    name: row.name,
    icon_url: null,
    years_experience: row.years_experience ?? null,
    case_study_count: 0,
  }));
}
