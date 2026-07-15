// ============================================================================
// NEW FILE: src/lib/queries/testimonials.ts
//
// Fetches testimonial METADATA only. The quote prose is never here — it lives
// in MDX and resolves through blockRegistry via `quote_slug` (Option A).
// If a `quote` field ever appears in this file, the prose boundary has been
// broken.
//
// photo_media_id → media_assets join mirrors the cover_media_id pattern in
// caseStudies.ts.
// ============================================================================

import { supabase } from "@/lib/supabaseClient";
import type { TestimonialRow } from "@/lib/templateGlossary";

const SELECT = `
  quote_slug,
  person_name,
  title,
  company,
  client,
  featured,
  photo:media_assets!photo_media_id ( file_url )
`;

function normalize(row: any): TestimonialRow {
  const photo = row.photo as { file_url?: string } | null;
  return {
    quote_slug: row.quote_slug,
    person_name: row.person_name,
    title: row.title,
    company: row.company,
    client: row.client,
    photo_url: photo?.file_url ?? null,
    featured: row.featured ?? false,
  };
}

/** All testimonials, featured first. */
export async function fetchTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select(SELECT)
    .order("featured", { ascending: false });

  if (error || !data) {
    console.warn("[fetchTestimonials] query failed", error);
    return [];
  }
  return data.map(normalize);
}

/**
 * Batch fetch by quote_slug, preserving the order of the requested slugs
 * (contract invariant 2 — router order is the design). Unknown slugs are
 * dropped and logged (invariant 5).
 */
export async function fetchTestimonialsBySlugs(slugs: string[]): Promise<TestimonialRow[]> {
  if (slugs.length === 0) return [];

  const { data, error } = await supabase
    .from("testimonials")
    .select(SELECT)
    .in("quote_slug", slugs);

  if (error || !data) {
    console.warn("[fetchTestimonialsBySlugs] query failed", error);
    return [];
  }

  const rows = data.map(normalize);
  const bySlug = new Map(rows.map((r) => [r.quote_slug, r]));
  const ordered: TestimonialRow[] = [];
  for (const slug of slugs) {
    const hit = bySlug.get(slug);
    if (hit) ordered.push(hit);
    else console.warn(`[fetchTestimonialsBySlugs] unknown slug dropped: ${slug}`);
  }
  return ordered;
}
