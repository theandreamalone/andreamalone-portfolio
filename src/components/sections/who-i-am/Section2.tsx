import Section4Client from "@/components/sections/home-4/Section4Client";

/**
 * who-i-am/Section2 — Career Highlights, replacing the template's fake
 * "Creative Team" grid (cardPages.json → AuthorCard, a single-person site
 * has no team to feature, dropped rather than repopulated).
 *
 * Section4Client is the existing self-fetching Work Experience / Education
 * tabs component (home-4) — reused as-is, not rebuilt. Degrades honestly
 * to "Nothing added yet." per tab when career_highlights is empty, which
 * is the real current state, not a placeholder.
 */
export default function Section2() {
  return (
    <>
      <section className="sec-2-about sec-padding">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <h2 className="mb-4 text-center">Career Highlights</h2>
            </div>
            <div className="col-12">
              <Section4Client />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
