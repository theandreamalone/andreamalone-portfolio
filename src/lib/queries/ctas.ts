// ============================================================================
// NEW FILE: src/lib/queries/ctas.ts
//
// CTAs have no slug column. cta_type ("contact", "resume", ...) is the natural
// key the router addresses via `cta:{cta_type}` IDs or a section variant.
//
// priority is a text column, so ordering happens in JS against
// CTA_PRIORITY_RANK — sorting "high"/"medium"/"low" alphabetically only
// happens to work for two of the three values.
// ============================================================================

import { supabase } from "@/lib/supabaseClient";
import { CTA_PRIORITY_RANK, type CTARow } from "@/lib/templateGlossary";

const SELECT = `
  title,
  description,
  button_text,
  target_url,
  cta_type,
  priority,
  active
`;

function normalize(row: any): CTARow {
  return {
    title: row.title,
    description: row.description,
    button_text: row.button_text,
    target_url: row.target_url,
    cta_type: row.cta_type,
    priority: row.priority,
    active: row.active ?? false,
  };
}

function byPriority(a: CTARow, b: CTARow): number {
  const ra = CTA_PRIORITY_RANK[a.priority ?? ""] ?? 99;
  const rb = CTA_PRIORITY_RANK[b.priority ?? ""] ?? 99;
  return ra - rb;
}

/** All active CTAs, highest priority first. */
export async function fetchCTAs(): Promise<CTARow[]> {
  const { data, error } = await supabase.from("ctas").select(SELECT).eq("active", true);

  if (error || !data) {
    console.warn("[fetchCTAs] query failed", error);
    return [];
  }
  return data.map(normalize).sort(byPriority);
}

/** One active CTA by cta_type. Returns null when absent or inactive. */
export async function fetchCTAByType(ctaType: string): Promise<CTARow | null> {
  const { data, error } = await supabase
    .from("ctas")
    .select(SELECT)
    .eq("cta_type", ctaType)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("[fetchCTAByType] query failed", error);
    return null;
  }
  return normalize(data);
}
