// ============================================================================
// templateGlossary.ts
// Single source of truth for template ↔ schema mappings.
// Covers all 20 decisions from the terminology mapping session.
//
// Rule: React components import ONLY from this file when translating
// Supabase-shaped data into template-component props. When swapping
// templates, only mappers here change — call sites do not.
// ============================================================================

// ============================================================================
// 1. Shared helpers
// ============================================================================

export const MEDIA_FALLBACK = "/assets/imgs/page/img-4.png";

/**
 * Card-slot format: "2025 · 6 weeks"
 * Decision #5 — case study cards repurpose blog's date/readTime slots.
 */
export function formatYearDuration(year: number | null, timeline: string | null): string {
  if (year && timeline) return `${year} · ${timeline}`;
  if (year) return String(year);
  if (timeline) return timeline;
  return "";
}

/**
 * Skill pill suffix: "8 yrs"
 * Decision #8 — "yrs" suffix disambiguates the number out of context.
 * Returns empty string when years is null so the badge slot can be hidden.
 */
export function formatYearsExperience(years: number | null): string {
  return years == null ? "" : `${years} yrs`;
}

// ============================================================================
// 2. Case Study — schema shape (from Supabase RPC returns)
// ============================================================================

export type CaseStudyRow = {
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url: string;
  project_year: number | null;     // Phase 1 schema addition
  timeline: string | null;         // e.g. "6 weeks"
  skills: Array<{ slug: string; name: string }>;   // ordered; first two used as badges
  has_demo_video: boolean;         // drives ArticleCard7 play-icon visibility
};

// Decision #21 — Client name disclosure control.
// Some case studies (NDA / anonymized client) can't show the real client
// name publicly. `client_disclosure` ("anonymized" | "named") picks between
// `client_name` (real) and `client_name_public` (a safe descriptor, e.g.
// "a Fortune 100 telecommunications company"). Detail-page-only — cards
// never show client name, so these fields live on `CaseStudyDetailRow`
// below, not on this leaner card-level CaseStudyRow. mapCaseStudyToDetail
// resolves the disclosure branch, and CaseStudyDetail.tsx renders
// <ClientDisclosureNote /> when showClientDisclosureNote is true.

/**
 * Extended row shape used ONLY on the detail page. Card-level components
 * use the leaner CaseStudyRow above. Fetched by fetchCaseStudyBySlug
 * (caseStudyBySlug.ts), which imports this type rather than defining its
 * own — this file is the single place row shapes live (see file header).
 */
export type CaseStudyDetailRow = CaseStudyRow & {
  client_name: string | null;
  client_disclosure: string | null;
  client_name_public: string | null;
  industry: string | null;
  role_title: string | null;
  cover_alt_text: string | null;
};

/**
 * Decision #14 (detail-page variant) — CaseStudyDetail.tsx.
 * Resolves the client-disclosure branch and skill link hrefs once here,
 * so the page component only renders — it doesn't decide anything.
 */
export type CaseStudyDetailData = {
  title: string;
  short_description: string;
  thumbnail_url: string;
  cover_alt_text: string;
  client: string | null;              // resolved named/anonymized value
  showClientDisclosureNote: boolean;  // true when disclosure is "anonymized"
  industry: string | null;
  role_title: string | null;
  when: string;                       // formatYearDuration output
  skills: Array<{ slug: string; name: string; linkHref: string }>;
};

export function mapCaseStudyToDetail(cs: CaseStudyDetailRow): CaseStudyDetailData {
  return {
    title: cs.title,
    short_description: cs.short_description,
    thumbnail_url: cs.thumbnail_url || MEDIA_FALLBACK,
    cover_alt_text: cs.cover_alt_text ?? cs.title,
    client: cs.client_disclosure === "named" ? cs.client_name : cs.client_name_public,
    showClientDisclosureNote: cs.client_disclosure === "anonymized",
    industry: cs.industry,
    role_title: cs.role_title,
    when: formatYearDuration(cs.project_year, cs.timeline),
    skills: cs.skills.map((s) => ({ ...s, linkHref: `/skills/${s.slug}` })),
  };
}

// ---- Case study card variants ---------------------------------------------

/**
 * Decision #14 — Case study grid page (route: /case-studies)
 * Template component: ArticleCard7 on the archive-1 layout.
 * Slots repurposed: readTime → "year · duration", layoutVideo → prototype demo flag.
 */
export type CaseStudyCardArchive1Data = {
  linkPost: string;         // "/case-studies/{slug}"
  img: string;
  title: string;
  readTime: string;         // "2025 · 6 weeks"
  classBadge1: string;      // template's bg-1/bg-3 class — cosmetic
  classBadge2: string;      // "d-none" if only one skill tagged
  badge1: string;           // primary skill name
  badge2: string;           // second skill name (or "")
  linkBadge: string;        // "/skills/{primary_skill_slug}"
  linkVideo: string;        // demo link — only meaningful when layoutVideo != d-none
  layoutVideo: string;      // "d-flex" if has_demo_video, "d-none" otherwise
  description: string;      // short_description
};

export function mapCaseStudyToArchive1Card(cs: CaseStudyRow): CaseStudyCardArchive1Data {
  const [s1, s2] = [cs.skills[0], cs.skills[1]];
  return {
    linkPost: `/case-studies/${cs.slug}`,
    img: cs.thumbnail_url || MEDIA_FALLBACK,
    title: cs.title,
    readTime: formatYearDuration(cs.project_year, cs.timeline),
    classBadge1: "bg-1",
    classBadge2: s2 ? "bg-3" : "d-none",
    badge1: s1?.name ?? "",
    badge2: s2?.name ?? "",
    linkBadge: s1 ? `/skills/${s1.slug}` : "#",
    linkVideo: cs.has_demo_video ? `/case-studies/${cs.slug}#demo` : "#",
    layoutVideo: cs.has_demo_video ? "d-flex" : "d-none",
    description: cs.short_description,
  };
}

/**
 * Decision #2 — Home Section3 bento, LEFT large card.
 * Template component: ArticleCard2.
 * Slots dropped: author/imgAuthor (single-author site), linkAuthor.
 * Slots repurposed: date → year, readTime → duration (kept as separate slots
 * to preserve the two-item visual rhythm).
 */
export type CaseStudyCardBentoLargeData = {
  img: string;
  linkBadge: string;
  linkPost: string;
  badge: string;
  bgBadge: string;
  date: string;             // project_year as string
  readTime: string;         // timeline
  title: string;
  // Fields kept in type for template compat but not visually rendered:
  linkAuthor: string;
  author: string;
  imgAuthor: string;
};

export function mapCaseStudyToBentoLarge(cs: CaseStudyRow): CaseStudyCardBentoLargeData {
  const s1 = cs.skills[0];
  return {
    img: cs.thumbnail_url || MEDIA_FALLBACK,
    linkBadge: s1 ? `/skills/${s1.slug}` : "#",
    linkPost: `/case-studies/${cs.slug}`,
    badge: s1?.name ?? "",
    bgBadge: "bg-1",
    date: cs.project_year ? String(cs.project_year) : "",
    readTime: cs.timeline ?? "",
    title: cs.title,
    // Author fields hidden via ArticleCard2 markup modification.
    linkAuthor: "",
    author: "",
    imgAuthor: "",
  };
}

/**
 * Decision #2 — Home Section3 bento, RIGHT stacked small cards.
 * Template component: ArticleCard3.
 * Slots dropped: comment/readNum (no fake engagement metrics).
 * Slots repurposed: readTime → "year · duration" combined (only one slot available).
 */
export type CaseStudyCardBentoSmallData = {
  img: string;
  linkBadge: string;
  linkPost: string;
  badge: string;
  bgBadge: string;
  readTime: string;         // "2025 · 6 weeks"
  title: string;
  // Kept for type compat, hidden via prop-conditional rendering:
  linkComment: string;
  comment: string;
  readNum: string;
};

export function mapCaseStudyToBentoSmall(cs: CaseStudyRow): CaseStudyCardBentoSmallData {
  const s1 = cs.skills[0];
  return {
    img: cs.thumbnail_url || MEDIA_FALLBACK,
    linkBadge: s1 ? `/skills/${s1.slug}` : "#",
    linkPost: `/case-studies/${cs.slug}`,
    badge: s1?.name ?? "",
    bgBadge: "bg-3",
    readTime: formatYearDuration(cs.project_year, cs.timeline),
    title: cs.title,
    linkComment: "",
    comment: "",
    readNum: "",
  };
}

/**
 * Decision #23 — Home Section9 full-bleed feature, repurposed as
 * CaseStudyFeature. Section9 had no glossary mapping; this adds it.
 * Slots repurposed: author → resolved client name, date → "year · duration".
 * Needs CaseStudyDetailRow (not the lean CaseStudyRow) because the client
 * disclosure branch lives on the detail shape.
 */
export type CaseStudyFeatureData = {
  bg: string;               // thumbnail_url — rendered as full-bleed background
  badge: string;            // primary skill name
  linkBadge: string;        // "/skills/{primary_skill_slug}"
  title: string;
  link: string;             // "/case-studies/{slug}"
  description: string;      // short_description
  client: string | null;    // resolved named/anonymized value — was "author" slot
  showClientDisclosureNote: boolean;
  when: string;             // "2025 · 6 weeks" — was "date" slot
};

export function mapCaseStudyToFeature(cs: CaseStudyDetailRow): CaseStudyFeatureData {
  const s1 = cs.skills[0];
  return {
    bg: cs.thumbnail_url || MEDIA_FALLBACK,
    badge: s1?.name ?? "",
    linkBadge: s1 ? `/skills/${s1.slug}` : "#",
    title: cs.title,
    link: `/case-studies/${cs.slug}`,
    description: cs.short_description,
    client: cs.client_disclosure === "named" ? cs.client_name : cs.client_name_public,
    showClientDisclosureNote: cs.client_disclosure === "anonymized",
    when: formatYearDuration(cs.project_year, cs.timeline),
  };
}

// ============================================================================
// 3. Skills
// ============================================================================

export type SkillRow = {
  slug: string;
  name: string;
  icon_url: string | null;
  years_experience: number | null;   // Phase 1 schema addition
  case_study_count: number;
};

/**
 * Decision #8 — Home Section2 ticker AND About-page static/stacked variant.
 * Decision #19 — About reuses the SAME pill markup, just wraps in flex instead
 * of the carouselTicker component. Only the wrapper differs.
 */
export type SkillPillData = {
  name: string;
  suffix: string;           // "8 yrs" or "" — hides the number badge if empty
  linkHref: string;         // "/skills/{slug}" — future-proofs a skill detail page
};

export function mapSkillToPill(skill: SkillRow): SkillPillData {
  return {
    name: skill.name,
    suffix: formatYearsExperience(skill.years_experience),
    linkHref: `/skills/${skill.slug}`,
  };
}

// ============================================================================
// 4. Testimonials
// Decision #10 — Home Section5 AuthorCard repurposed as TestimonialCard.
//
// Three bugs in the old version, all confirmed against the live schema
// (2026-07-14):
//   1. TestimonialCardData used {name, role, imgAvatar, quote} but AuthorCard's
//      real props are {img, linkPost, name, position, bgstickyCorner}. The
//      mapper produced props no component accepts.
//   2. TestimonialRow declared `quote: string` sourced from Supabase. The
//      testimonials table has NO quote column — confirmed. Quote prose lives
//      in MDX and resolves through blockRegistry (Option A). Reading quote
//      text from the DB would have violated the prose boundary.
//   3. TestimonialRow declared `photo_url`. The real column is
//      `photo_media_id` (uuid FK → media_assets), same pattern as
//      case_studies.cover_media_id. The query resolves the join; this type
//      takes the resolved URL.
//
// Real schema: id, quote_slug, person_name, title, company, rating,
//              photo_media_id, featured, client, created_at, updated_at
// ============================================================================

export type TestimonialRow = {
  quote_slug: string;          // key into the MDX registry — NOT prose
  person_name: string;
  title: string | null;        // e.g. "Design Director"
  company: string | null;      // e.g. "T-Mobile"
  client: string | null;       // which engagement this relates to
  photo_url: string | null;    // resolved from photo_media_id join at query time
  featured: boolean;
};

export type TestimonialCardData = {
  img: string;
  linkPost: string;            // testimonials don't link out — "#"
  name: string;
  position: string;            // "title, company" composed here
  bgstickyCorner: string;      // cosmetic template class
  quoteSlug: string;           // AuthorCard resolves this via blockRegistry
};

const TESTIMONIAL_FALLBACK_AVATAR = "/assets/imgs/template/author/author-5.png";

function composeRoleAndCompany(title: string | null, company: string | null): string {
  if (title && company) return `${title}, ${company}`;
  return title ?? company ?? "";
}

export function mapTestimonialToCard(t: TestimonialRow): TestimonialCardData {
  return {
    img: t.photo_url ?? TESTIMONIAL_FALLBACK_AVATAR,
    linkPost: "#",
    name: t.person_name,
    position: composeRoleAndCompany(t.title, t.company),
    bgstickyCorner: "bg-1",
    quoteSlug: t.quote_slug,
  };
}

// ============================================================================
// 5. Outcomes / metrics
// Decision #11 — OdometerCounter (unused elsewhere in template) powers stat blocks.
// Same component wraps individual stats on Home and About outcomes rows.
//
// Old OutcomeRow was {label, count, prefix, suffix} — none of those are column
// names. Real columns: case_study_id, metric_name, metric_value, metric_type,
// metric_prefix, metric_count, metric_suffix, sort_order.
//
// Row type now mirrors the schema (consistent with TestimonialRow). The mapper
// produces OdometerCounter's props.
//
// metric_count (int) drives the odometer animation. metric_value (text) is the
// authored display string and acts as a static fallback when metric_count is
// null — a known number rendered flat beats a metric silently dropped.
// ============================================================================

export type OutcomeRow = {
  metric_name: string;          // display label, e.g. "Task completion time"
  metric_value: string | null;  // authored display string, e.g. "-38%"
  metric_count: number | null;  // integer the odometer animates to
  metric_prefix: string | null; // e.g. "-" or "$"
  metric_suffix: string | null; // e.g. "%" or " min"
  metric_type: string | null;   // "percentage" | "count" | ...
  sort_order: number;
};

export type OdometerData = {
  count: number | null;   // null → render staticValue instead of animating
  prefix: string;
  suffix: string;
  label: string;
  staticValue: string;    // fallback text when count is null
};

export function mapOutcomeToOdometer(o: OutcomeRow): OdometerData {
  return {
    count: o.metric_count,
    prefix: o.metric_prefix ?? "",
    suffix: o.metric_suffix ?? "",
    label: o.metric_name,
    staticValue: o.metric_value ?? "",
  };
}

// ============================================================================
// 6. CTAs
// Decision #12 — TitleDark bar becomes a parameterized CTA component.
// Template additions: linkHref & linkLabel become props (not hardcoded).
// Decision #18 — Any CTA with target=contact scrolls to #contact-form.
//
// Old CTARow was {audience, title, description, target, external_href,
// link_label} — only title and description exist. There is no audience column,
// no target enum, no external_href.
//
// Real columns: id, title, description, button_text, target_url, cta_type,
// priority, active.
//
// The target→href switch is gone: target_url is already the href. cta_type
// stays as the selector the router/variant addresses ("contact", "resume").
//
// CONTACT_ANCHOR is retained: a CTA row with target_url = "/contact" is
// rewritten to the on-page anchor so the CTA scrolls rather than navigates
// (decision #18).
// ============================================================================

export const CONTACT_ANCHOR = "#contact-form";

export type CTARow = {
  title: string;
  description: string | null;
  button_text: string;
  target_url: string;
  cta_type: string;            // "contact" | "resume" | "case-studies" | "external"
  priority: string | null;     // "high" | "medium" | "low"
  active: boolean;
};

export type CTABarData = {
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
};

/** Explicit order — priority is text, so alphabetical sorting is a coincidence. */
export const CTA_PRIORITY_RANK: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function mapCTAToBar(cta: CTARow): CTABarData {
  // Decision #18 — contact CTAs scroll to the on-page form, they don't navigate.
  const linkHref = cta.cta_type === "contact" ? CONTACT_ANCHOR : cta.target_url;
  return {
    title: cta.title,
    description: cta.description ?? "",
    linkHref,
    linkLabel: cta.button_text,
  };
}

// ============================================================================
// 7. Content Blocks (case study body)
// Decision #15 — Layout variant sourced from MDX frontmatter.
// Runtime renders pre-bundled MDX keyed by slug, wrapped in a layout container.
// ============================================================================

export type BlockLayoutVariant =
  | "text-image"
  | "image-text"
  | "two-col-text"
  | "full-width"
  | "stat-row";

export type ContentBlockRow = {
  id: string;
  slug: string;                     // key into pre-bundled MDX registry
  layout_variant: BlockLayoutVariant;
  order: number;
};

/**
 * Component NAMES, not imports — actual React components live in
 * src/components/case-study-blocks/ and get registered in BlockRenderer.
 * Keeping this as a name map avoids circular imports and lets BlockRenderer
 * lazy-load layouts if we ever want to.
 */
export const LAYOUT_COMPONENT_NAME: Record<BlockLayoutVariant, string> = {
  "text-image":   "TextImageBlock",
  "image-text":   "ImageTextBlock",
  "two-col-text": "TwoColTextBlock",
  "full-width":   "FullWidthBlock",
  "stat-row":     "StatRowBlock",
};

// ============================================================================
// 8. Contact form
// Decisions #18 + #20 — Site-wide form appended via Layout, anchor #contact-form.
// Fields: Name, Email, Role/Title, Company/Organization, Message (optional).
// ============================================================================

export type ContactFormSubmission = {
  name: string;                  // required
  email: string;                 // required, validated by Supabase CHECK constraint
  role_title: string | null;     // optional
  organization: string | null;   // optional
  message: string | null;        // optional per decision #20
};

// ============================================================================
// 9. Blog — PARKED (decisions #6, #7, #16, #17)
// Types stubbed so the codebase compiles when parked pages exist unwired.
// No mappers yet; wire when blog is prioritized.
// ============================================================================

export type BlogPostRow = {
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url: string;
  published_at: string;       // ISO date
  read_time_minutes: number;  // computed from word count
};

// Cards used by parked blog pages (leave unmapped):
// - ArticleCard11 + ArticleCard6 : Home Section10 blog preview
//                                  (comment/view counts become optional props → hidden)
// - archive-2 page cards         : Blog archive
// - archive-5 page cards         : Search results (paused)

// ============================================================================
// 10. Deliberately unmapped / custom builds
// ============================================================================

// Decision #4  — Home Section4: newsletter + socials + client-logo ticker.
//                Content is hardcoded, no schema mapping. Client logos are
//                static SVGs in /assets/imgs/template/icons/.
//
// Decision #9  — Home Section11: work-image swiper.
//                Hardcoded case study images, no Instagram integration.
//
// Decision #13 — Intent-transparency widget: fully custom, not in template.
//                Displays classified audience hypothesis + correction control.
//                Built last (Phase 3) so its design is informed by everything above.
//
// Home Section5's "Become an author" button → removed (single-author site).
// AuthorCard's original "author" semantics → repurposed for testimonials only.
//
// ArticleCard1     → not used anywhere (Home Section1 hero swap sends users
//                    to CaseStudyCardArchive1Data via the /case-studies archive).
// /page-author     → route remains but unlinked.

// ============================================================================
// 11. Career highlights (Work Experience / Education tabs)
// Decision #22 — home-4/Section4Client's Tabs ("Work Experience" /
// "Education"), reused on the About page. Requires a new career_highlights
// table — not in the current schema; hand off the CREATE TABLE separately
// (no DDL access from here, same as the skills.slug fix).
//
// This mapper produces one card's data, matching the "block-experience"
// markup rendered inside each tab — it does NOT build the Tabs component's
// `tabs` prop (id/title/content) itself. Grouping rows by category into
// the two tabs, and wrapping each group's cards in the tab content JSX,
// stays call-site logic in Section4Client.tsx, consistent with how this
// file only ever hands components plain data, never JSX (see file header).
// ============================================================================

export type CareerHighlightRow = {
  start_year: number;
  end_year: number | null;      // null = "Present"
  role_title: string;
  organization: string;
  category: "work" | "education";
  sort_order: number;
};

export type CareerHighlightCardData = {
  date: string;                 // "2012 - 2014" or "2019 - Present"
  title: string;                // role_title
  subtitle: string;             // organization
};

export function mapCareerHighlightToCard(row: CareerHighlightRow): CareerHighlightCardData {
  return {
    date: `${row.start_year} - ${row.end_year ?? "Present"}`,
    title: row.role_title,
    subtitle: row.organization,
  };
}