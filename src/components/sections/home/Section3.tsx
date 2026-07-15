import { useEffect, useMemo, useState } from "react";
import ArticleCard2 from "@/components/cards/ArticleCard2";
import ArticleCard3 from "@/components/cards/ArticleCard3";
import TitleWhite from "@/components/elements/TitleWhite";
import { fetchCaseStudiesBySlugs } from "@/lib/queries/caseStudies";
import {
  mapCaseStudyToBentoLarge,
  mapCaseStudyToBentoSmall,
  type CaseStudyRow,
} from "@/lib/templateGlossary";
import type { RecordId } from "@/lib/viewContract";

/**
 * Section3 — the CaseStudyBento section (1 large card + N stacked small cards).
 *
 * Consumes `record_ids` from the router/static baseline. Position 0 becomes the
 * large card (ArticleCard2); the rest stack as small cards (ArticleCard3), in
 * the order given — contract invariant 2.
 *
 * Changes from the original Magzin Section3:
 *  - Dropped the hardcoded card2data array and cardHome-1.json import.
 *  - Dropped the ArticleCard4 swiper row: templateGlossary decision #2 maps
 *    only the large + stacked-small bento, and ArticleCard4 has no mapping.
 *  - Section title is a prop, not hardcoded blog copy.
 *
 * Renders nothing when no records resolve — an empty bento is worse than none.
 */

interface Section3Props {
  record_ids?: RecordId[];
  title?: string;
  description?: string;
}

export default function Section3({
  record_ids = [],
  title = "Selected work",
  description = "",
}: Section3Props) {
  const [rows, setRows] = useState<CaseStudyRow[]>([]);

  const slugs = useMemo(
    () =>
      record_ids
        .filter((id) => {
          if (id.startsWith("cs:")) return true;
          console.warn(`[Section3] non-case-study id dropped: ${id}`);
          return false;
        })
        .map((id) => id.slice("cs:".length)),
    [record_ids.join("|")]
  );

  useEffect(() => {
    if (slugs.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;

    fetchCaseStudiesBySlugs(slugs)
      .then((r) => {
        if (!cancelled) setRows(r);
      })
      .catch((err) => {
        console.warn("[Section3] fetch failed", err);
        if (!cancelled) setRows([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs.join("|")]);

  if (rows.length === 0) return null;

  const [feature, ...rest] = rows;
  const large = mapCaseStudyToBentoLarge(feature);
  const smalls = rest.map(mapCaseStudyToBentoSmall);

  return (
    <>
      {/* Home 1 Section 3 — CaseStudyBento */}
      <section className="sec-3-home-1 sec-padding overflow-hidden">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <TitleWhite title={title} description={description} />
            </div>
          </div>
          <div className="row mt-3 g-4 align-items-stretch">
            <div className="col-lg-7 col-12">
              <ArticleCard2 card={large} idx={0} />
            </div>
            {smalls.length > 0 && (
              <div className="col-lg-5 col-12 d-flex flex-column gap-2 justify-content-between">
                {smalls.map((card, idx) => (
                  <ArticleCard3 key={idx} card={card} idx={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
