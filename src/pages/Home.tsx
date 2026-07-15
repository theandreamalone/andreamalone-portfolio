/**
 * Home — the `/` route.
 *
 * Renders the static baseline composition (`src/lib/staticBaseline.ts`)
 * via SectionRouter. This is the D6-mandated shippable fallback: even if
 * every downstream adaptive path fails, this page works.
 *
 * When AdaptiveHome (Option 2) is ready, `/` may switch to it or coexist —
 * this file remains the guaranteed-working baseline either way.
 */

import Layout from '@/components/layout/Layout';
import SectionRouter from '@/components/SectionRouter';
import { STATIC_BASELINE } from '@/lib/staticBaseline';

export default function Home() {
  const orderedSections = [...STATIC_BASELINE.sections].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Layout>
      {orderedSections.map((spec, idx) => (
        <SectionRouter key={`${spec.kind}-${spec.order}-${idx}`} spec={spec} />
      ))}
    </Layout>
  );
}
