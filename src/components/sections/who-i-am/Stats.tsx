import OdometerCounter from "@/components/elements/OdometerCounter";

/**
 * who-i-am/Stats — "at a glance" credential strip (route: /page-about).
 *
 * Fixed, Andrea-confirmed numbers (2026-07-21) — not case-study outcomes, so
 * this bypasses the Supabase-backed Outcomes.tsx pattern entirely (ground
 * truth: a DB round trip only earns its keep when order or selection is
 * dynamic; these four numbers are neither). Reuses the same OdometerCounter
 * + .block-outcome markup as Outcomes.tsx for visual consistency.
 */

const STATS: { count: number; suffix?: string; label: string }[] = [
  { count: 6, label: "AI Product UIs Designed" },
  { count: 55, suffix: "+", label: "Heuristic Findings Resolved" },
  { count: 4, label: "Fortune 100 & Enterprise Clients" },
  { count: 100, suffix: "+", label: "Screens Designed & Accessibility-Annotated" },
];

export default function Stats({ classList = "pt-0" }: { classList?: string }) {
  // classList default preserves the About placement (flush under the hero);
  // Home passes "" to keep normal section padding mid-page.
  return (
    <section className={`sec-outcomes sec-padding ${classList}`}>
      <div className="container">
        <div className="row g-4 justify-content-center text-center">
          {STATS.map((stat) => (
            <div className="col-md-3 col-6" key={stat.label}>
              <div className="block-outcome">
                <h3 className="mb-1">
                  <OdometerCounter count={stat.count} suffix={stat.suffix} />
                </h3>
                <p className="fs-7 m-0">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
