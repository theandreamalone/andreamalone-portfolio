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
// never show client name, so these live on `CaseStudyDetailRow` in
// caseStudyBySlug.ts, not on this leaner card-level CaseStudyRow. When
// disclosure is "anonymized", CaseStudyDetail.tsx also renders
// <ClientDisclosureNote /> alongside the public descriptor.

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
    img: cs.thumbnail_url,
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
    img: cs.thumbnail_url,
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
    img: cs.thumbnail_url,
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
// Requires markup addition to AuthorCard: quote text block below name/role.
// ============================================================================

export type TestimonialRow = {
  person_name: string;
  role_and_company: string;    // e.g. "Design Director, T-Mobile"
  photo_url: string;
  quote: string;               // NEW element added to AuthorCard markup
};

export type TestimonialCardData = {
  name: string;                // AuthorCard's existing field
  role: string;                // AuthorCard's existing "Travel Editor" slot
  imgAvatar: string;           // AuthorCard's existing photo field
  quote: string;               // rendered by markup addition
};

export function mapTestimonialToCard(t: TestimonialRow): TestimonialCardData {
  return {
    name: t.person_name,
    role: t.role_and_company,
    imgAvatar: t.photo_url,
    quote: t.quote,
  };
}

// ============================================================================
// 5. Outcomes / metrics
// Decision #11 — OdometerCounter (unused elsewhere in template) powers stat blocks.
// Same component wraps individual stats on Home and About outcomes rows.
// ============================================================================

export type OutcomeRow = {
  label: string;               // "task completion faster"
  count: number;               // 40
  prefix: string | null;       // e.g. "+" or "$"
  suffix: string | null;       // e.g. "%" or " min"
};

export type OdometerData = {
  count: number;
  prefix: string;
  suffix: string;
  label: string;
};

export function mapOutcomeToOdometer(o: OutcomeRow): OdometerData {
  return {
    count: o.count,
    prefix: o.prefix ?? "",
    suffix: o.suffix ?? "",
    label: o.label,
  };
}

// ============================================================================
// 6. CTAs
// Decision #12 — TitleDark bar becomes a parameterized CTA component.
// Template additions: linkHref & linkLabel become props (not hardcoded).
// Decision #18 — Any CTA with target=contact scrolls to #contact-form.
// ============================================================================

export const CONTACT_ANCHOR = "#contact-form";

export type CTARow = {
  audience: string | null;     // "recruiter" | "hiring-manager" | "collaborator" | null
  title: string;               // top bar text
  description: string;         // subtext (may be empty)
  target: "contact" | "resume" | "case-studies" | "external";
  external_href: string | null;
  link_label: string;          // "Contact me" | "Download resume" | etc.
};

export type CTABarData = {
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
};

export function mapCTAToBar(cta: CTARow): CTABarData {
  const linkHref = (() => {
    switch (cta.target) {
      case "contact":       return CONTACT_ANCHOR;
      case "resume":        return "/assets/resume.pdf";   // static asset path; confirm before wiring
      case "case-studies":  return "/case-studies";
      case "external":      return cta.external_href ?? "#";
    }
  })();
  return {
    title: cta.title,
    description: cta.description,
    linkHref,
    linkLabel: cta.link_label,
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
//                    to CaseStudyCardArchive1Data via portfolio-archive-1 style).
// /page-author     → route remains but unlinked.