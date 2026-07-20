/**
 * SectionRouter — dispatches a SectionSpec to its rendering component.
 *
 * Home.tsx (and later AdaptiveHome.tsx) map over RouterResponse.sections and
 * render <SectionRouter spec={s} /> for each. Adding a new section kind = add
 * a case here.
 *
 * Missing components render nothing (dev-mode console note). The section is
 * dropped rather than crashing the page — contract invariant 5.
 */

import type { SectionSpec } from '@/lib/viewContract';

import SectionIntro from '@/components/sections/home/SectionIntro';
import QuestionHero from '@/components/sections/home/QuestionHero';
import Section2 from '@/components/sections/home/Section2';
import Section3 from '@/components/sections/home/Section3';
import Section4Client from '@/components/sections/home-4/Section4Client';
import Section5 from '@/components/sections/home/Section5';
import Section9 from '@/components/sections/home/Section9';
import FallbackAnswer from '@/components/sections/FallbackAnswer';
import Contact from '@/components/sections/Contact';
import Outcomes from '@/components/sections/Outcomes';
import CTABar from '@/components/sections/CTABar';

interface SectionRouterProps {
  spec: SectionSpec;
}

function renderSection(spec: SectionSpec) {
  switch (spec.kind) {
    case 'Hero':
      // NOT YET REFACTORED — renders its own adaptive block via AdaptiveBlock.
      return <SectionIntro />;

    case 'SkillTicker':
      // NOT YET REFACTORED — renders hardcoded template tags. Stage B.
      return <Section2 />;

    case 'CaseStudyFeature':
      return <Section9 displayBtn="d-none" record_ids={spec.record_ids} />;

    case 'CaseStudyBento':
      return <Section3 record_ids={spec.record_ids} />;

    case 'Testimonials':
      return <Section5 record_ids={spec.record_ids} />;

    case 'CareerHighlights':
      // Self-fetching; no record_ids needed today.
      return <Section4Client />;

    case 'FallbackAnswer':
      return <FallbackAnswer record_ids={spec.record_ids} />;

    case 'Contact':
      return <Contact />;

    case 'Outcomes':
      return <Outcomes record_ids={spec.record_ids} />;

    case 'CTABar':
      return <CTABar record_ids={spec.record_ids} variant={spec.variant} />;

    case 'CaseStudyArchive':
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
