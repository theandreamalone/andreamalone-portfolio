// ============================================================================
// careerHighlights.ts
// Fetches all career highlights (Work Experience / Education tabs).
// ============================================================================

import { supabase } from '@/lib/supabaseClient';
import type { CareerHighlightRow } from '@/lib/templateGlossary';

export async function fetchCareerHighlights(): Promise<CareerHighlightRow[]> {
  const { data, error } = await supabase
    .from('career_highlights')
    .select('start_year, end_year, role_title, organization, category, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCareerHighlights error:', error);
    throw error;
  }
  return data ?? [];
}
