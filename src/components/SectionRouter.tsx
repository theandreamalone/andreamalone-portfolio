/**
 * SectionRouter — dispatches a SectionSpec to its rendering component.
 *
 * Home.tsx (and later AdaptiveHome.tsx) map over RouterResponse.sections
 * and render <SectionRouter spec={s} /> for each. Adding a new section kind
 * = add a case here + export the component.
 *
 * Missing components render nothing (with a dev-mode console warning) —
 * the section is dropped rather than crashing the page. This preserves
 * contract invariant 5 (unknown IDs / missing renderers drop silently in
 * prod).
 */

import type { SectionSpec } from '@/lib/viewContract';

// Reuse existing sections until Option 2 refactors them to consume record_ids.
// For Option 1 static baseline, most sections render their existing content.
import SectionIntro from '@/components/sections/home/SectionIntro';
import Section2 from '@/components/sections/home/Section2';
import Section3 from '@/components/sections/home/Section3';
import Section4Client from '@/components/sections/home-4/Section4Client';
import Section5 from '@/components/sections/home/Section5';
import Section9 from '@/components/sections/home/Section9';

interface SectionRouterProps {
  spec: SectionSpec;
}

export default function SectionRouter({ spec }: SectionRouterProps) {
  switch (spec.kind) {
    case 'Hero':
      return <SectionIntro />;

    case 'SkillTicker':
      return <Section2 />;

    case 'CaseStudyFeature':
      return <Section9 displayBtn="d-none" />;

    case 'CaseStudyBento':
      return <Section3 />;

    case 'Testimonials':
      return <Section5 />;

    case 'CareerHighlights':
      return <Section4Client />;

    case 'Outcomes':
    case 'CTABar':
    case 'CaseStudyArchive':
    case 'FallbackAnswer':
    case 'Contact':
      // Option 1: these render their existing (non-composable) implementations
      // OR nothing at all until we build/refactor them. Silent skip is
      // intentional per contract invariant 5.
      if (import.meta.env.DEV) {
        console.info(
          `[SectionRouter] section kind "${spec.kind}" not yet implemented; skipping.`
        );
      }
      return null;

    default: {
      // Exhaustiveness check — TypeScript will error if a SectionKind is added
      // to viewContract.ts without a case here.
      const _exhaustive: never = spec.kind;
      return _exhaustive;
    }
  }
}
