// ============================================================================
// NEW FILE: src/lib/queries/outcomes.ts
//
// Outcomes have no slug column — only a uuid and a case_study_id FK. They are
// therefore addressed through their parent case study rather than through an
// `outcome:` namespace of raw uuids.
// ============================================================================

import { supabase } from "@/lib/supabaseClient";
import type { OutcomeRow } from "@/lib/templateGlossary";

const SELECT = `
  metric_name,
  metric_value,
  metric_count,
  metric_prefix,
  metric_suffix,
  metric_type,
  sort_order,
  case_studies!inner ( slug )
`;

function normalize(row: any): OutcomeRow {
  return {
    metric_name: row.metric_name,
    metric_value: row.metric_value,
    metric_count: row.metric_count,
    metric_prefix: row.metric_prefix,
    metric_suffix: row.metric_suffix,
    metric_type: row.metric_type,
    sort_order: row.sort_order ?? 0,
  };
}

/**
 * Outcomes for one or more case studies, in sort_order.
 * RLS on case_studies means draft case studies contribute no outcomes —
 * the inner join filters them out.
 */
export async function fetchOutcomesByCaseStudySlugs(slugs: string[]): Promise<OutcomeRow[]> {
  if (slugs.length === 0) return [];

  const { data, error } = await supabase
    .from("outcomes")
    .select(SELECT)
    .in("case_studies.slug", slugs)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[fetchOutcomesByCaseStudySlugs] query failed", error);
    return [];
  }
  return data.map(normalize);
}
