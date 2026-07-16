import { useEffect, useMemo, useState } from "react";
import OdometerCounter from "@/components/elements/OdometerCounter";
import { fetchOutcomesByCaseStudySlugs } from "@/lib/queries/outcomes";
import { mapOutcomeToOdometer, type OdometerData } from "@/lib/templateGlossary";
import type { RecordId } from "@/lib/viewContract";

/**
 * Outcomes — metric stat blocks (templateGlossary decision #11).
 *
 * Addressed by `cs:` IDs, not `outcome:` IDs — outcomes have no slug, only a
 * case_study_id FK, so they're fetched through their parent case study.
 *
 * Each metric animates via OdometerCounter when metric_count is present.
 * When it's null, the authored metric_value string renders flat instead. A
 * known number shown statically beats a metric silently dropped; a metric with
 * neither is dropped and logged.
 *
 * Renders nothing when no metrics resolve.
 */

interface OutcomesProps {
  record_ids?: RecordId[];
}

export default function Outcomes({ record_ids = [] }: OutcomesProps) {
  const [metrics, setMetrics] = useState<OdometerData[]>([]);

  const slugs = useMemo(
    () =>
      record_ids
        .filter((id) => {
          if (id.startsWith("cs:")) return true;
          console.warn(`[Outcomes] non-case-study id dropped: ${id}`);
          return false;
        })
        .map((id) => id.slice("cs:".length)),
    [record_ids.join("|")]
  );

  useEffect(() => {
    if (slugs.length === 0) {
      setMetrics([]);
      return;
    }
    let cancelled = false;

    fetchOutcomesByCaseStudySlugs(slugs)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(mapOutcomeToOdometer).filter((m) => {
          if (m.count === null && !m.staticValue) {
            console.warn(`[Outcomes] metric with no value dropped: ${m.label}`);
            return false;
          }
          return true;
        });
        setMetrics(mapped);
      })
      .catch((err) => {
        console.warn("[Outcomes] fetch failed", err);
        if (!cancelled) setMetrics([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs.join("|")]);

  if (metrics.length === 0) return null;

  return (
    <section className="sec-outcomes sec-padding">
      <div className="container">
        <div className="row g-4 justify-content-center text-center">
          {metrics.map((m, idx) => (
            <div className="col-md-4 col-6" key={`${m.label}-${idx}`}>
              <div className="block-outcome">
                <h3 className="mb-1">
                  {m.count !== null ? (
                    <OdometerCounter count={m.count} prefix={m.prefix} suffix={m.suffix} />
                  ) : (
                    <span>{m.staticValue}</span>
                  )}
                </h3>
                <p className="fs-7 m-0">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
