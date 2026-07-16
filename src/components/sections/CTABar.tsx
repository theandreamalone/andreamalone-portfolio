import { useEffect, useMemo, useState } from "react";
import TitleDark from "@/components/elements/TitleDark";
import { fetchCTAByType, fetchCTAs } from "@/lib/queries/ctas";
import { mapCTAToBar, type CTABarData } from "@/lib/templateGlossary";
import type { RecordId } from "@/lib/viewContract";

/**
 * CTABar — the call-to-action bar (templateGlossary decision #12).
 *
 * Selection order:
 *   1. `cta:{cta_type}` in record_ids
 *   2. the section `variant` (same vocabulary as cta_type)
 *   3. highest-priority active CTA
 *
 * Contact CTAs resolve to the #contact-form anchor via mapCTAToBar (decision
 * #18), so they scroll rather than navigate.
 *
 * Renders nothing when no active CTA resolves.
 */

interface CTABarProps {
  record_ids?: RecordId[];
  variant?: string;
  classList?: string;
}

export default function CTABar({ record_ids = [], variant, classList = "" }: CTABarProps) {
  const [bar, setBar] = useState<CTABarData | null>(null);

  const requestedType = useMemo(() => {
    const fromIds = record_ids.find((id) => id.startsWith("cta:"));
    if (fromIds) return fromIds.slice("cta:".length);
    return variant ?? null;
  }, [record_ids.join("|"), variant]);

  useEffect(() => {
    let cancelled = false;

    const load = requestedType
      ? fetchCTAByType(requestedType)
      : fetchCTAs().then((rows) => rows[0] ?? null);

    load
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          if (requestedType) {
            console.warn(`[CTABar] no active CTA for type: ${requestedType}`);
          }
          setBar(null);
          return;
        }
        setBar(mapCTAToBar(row));
      })
      .catch((err) => {
        console.warn("[CTABar] fetch failed", err);
        if (!cancelled) setBar(null);
      });

    return () => {
      cancelled = true;
    };
  }, [requestedType]);

  if (!bar) return null;

  return (
    <section className="sec-cta-bar sec-padding-sm">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <TitleDark
              title={bar.title}
              description={bar.description}
              classList={classList}
              linkHref={bar.linkHref}
              linkLabel={bar.linkLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
