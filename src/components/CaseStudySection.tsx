/**
 * CaseStudySection — renders a case-study section block's MDX prose.
 * Referenced by frontmatter `component: CaseStudySection` in
 * content/case-studies/*.mdx section files.
 * Contract: docs/mdx-block-conventions.md
 */

import type { ReactNode } from 'react';

interface CaseStudySectionProps {
  children: ReactNode;
  title?: string;
}

export default function CaseStudySection({ children, title }: CaseStudySectionProps) {
  return (
    <section className="case-study-section" aria-label={title}>
      {title && <h2 className="case-study-section__title">{title}</h2>}
      <div className="case-study-section__body">{children}</div>
    </section>
  );
}