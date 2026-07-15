/**
 * SectionRouter — dispatches a SectionSpec to its rendering component.
 *
 * Home.tsx (and later AdaptiveHome.tsx) map over RouterResponse.sections and
 * render <SectionRouter spec={s} /> for each. Adding a new section kind = add
 * a case here.
 *
 * Sections that consume router payloads receive `record_ids`. Sections not yet
 * refactored render their existing content and ignore the payload — they are
 * marked below and get converted in Stage A/B.
 *
 * Missing components render nothing (dev-mode console note). The section is
 * dropped rather than crashing the page — contract invariant 5.
 */

import type { SectionSpec } from '@/lib/viewContract';

import SectionIntro from '@/components/sections/home/SectionIntro';
import Section2 from '@/components/sections/home/Section2';
import Section3 from '@/components/sections/home/Section3';
import Section4Client from '@/components/sections/home-4/Section4Client';
import Section5 from '@/components/sections/home/Section5';
import Section9 from '@/components/sections/home/Section9';

interface SectionRouterProps {
  spec: SectionSpec;
}

function renderSection(spec: SectionSpec) {
  switch (spec.kind) {
    case 'Hero':
      // NOT YET REFACTORED — renders its own adaptive block.
      return <SectionIntro />;

    case 'SkillTicker':
      // NOT YET REFACTORED — renders hardcoded template tags.
      return <Section2 />;

    case 'CaseStudyFeature':
      return <Section9 displayBtn="d-none" record_ids={spec.record_ids} />;

    case 'CaseStudyBento':
      // NOT YET REFACTORED — Stage A pending.
      return <Section3 />;

    case 'Testimonials':
      // NOT YET REFACTORED — Stage A pending.
      return <Section5 />;

    case 'CareerHighlights':
      // Self-fetching; no record_ids needed today.
      return <Section4Client />;

    case 'Outcomes':
    case 'CTABar':
    case 'CaseStudyArchive':
    case 'FallbackAnswer':
    case 'Contact':
      // Stage B builds these. Silent skip is intentional.
      if (import.meta.env.DEV) {
        console.info(`[SectionRouter] "${spec.kind}" not yet implemented; skipping.`);
      }
      return null;

    default: {
      const _exhaustive: never = spec.kind;
      return _exhaustive;
    }
  }
}

export default function SectionRouter({ spec }: SectionRouterProps) {
  const rendered = renderSection(spec);
  if (!rendered) return null;

  // Dev-only marker so section order is verifiable while content is still
  // template placeholder. Stripped from production builds.
  if (import.meta.env.DEV) {
    return (
      <div data-section-kind={spec.kind} data-section-order={spec.order}>
        <div
          style={{
            background: '#7F77DD',
            color: '#fff',
            font: '500 11px/1.8 monospace',
            padding: '2px 10px',
            letterSpacing: '0.04em',
          }}
        >
          {spec.order} · {spec.kind}
          {spec.emphasis ? ` · ${spec.emphasis}` : ''}
          {spec.record_ids.length ? ` · ${spec.record_ids.join(', ')}` : ''}
        </div>
        {rendered}
      </div>
    );
  }

  return rendered;
}
