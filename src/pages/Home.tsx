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
import QuestionHero from '@/components/sections/home/QuestionHero';
import Stats from '@/components/sections/who-i-am/Stats';
import { STATIC_BASELINE } from '@/lib/staticBaseline';

export default function Home() {
  // QuestionHero replaces the Hero section here directly — it isn't routed
  // through SectionRouter's 'Hero' case because that case is shared with
  // every hardcodedRouter response, which would double up the ask UI on
  // AdaptiveHome (it already renders its own ask box).
  const orderedSections = [...STATIC_BASELINE.sections]
    .filter((spec) => spec.kind !== 'Hero')
    .sort((a, b) => a.order - b.order);

  return (
    <Layout>
      <QuestionHero />
      {orderedSections.map((spec, idx) =>
        spec.kind === 'Outcomes' ? (
          // Static home shows the same at-a-glance strip as /page-about
          // (Andrea-confirmed fixed numbers, 2026-07-21) instead of the
          // NetHive-only Supabase outcomes. Router-driven pages (AdaptiveHome)
          // still render the real Outcomes section via SectionRouter.
          <Stats key={`Stats-${spec.order}-${idx}`} classList="" />
        ) : (
          <SectionRouter key={`${spec.kind}-${spec.order}-${idx}`} spec={spec} />
        )
      )}
    </Layout>
  );
}
