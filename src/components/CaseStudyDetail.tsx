// ============================================================================
// CaseStudyDetail.tsx
// Page route: /case-studies/:slug
//
// Renders header + sidebar from a live Supabase row, routed through
// templateGlossary's mapCaseStudyToDetail — this component only renders
// the resulting CaseStudyDetailData, it doesn't decide anything itself
// (see templateGlossary.ts file header).
// Body renders section blocks in authored order via CaseStudyBody (shipped 2026-07-19).
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCaseStudyBySlug } from '@/lib/queries/caseStudyBySlug';
import { mapCaseStudyToDetail, type CaseStudyDetailData } from '@/lib/templateGlossary';
import ClientDisclosureNote from '@/components/elements/ClientDisclosureNote';
import CaseStudyBody from '@/components/CaseStudyBody';

type FetchState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: CaseStudyDetailData };

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    if (!slug) {
      setState({ status: 'not-found' });
      return;
    }
    let cancelled = false;
    fetchCaseStudyBySlug(slug)
      .then((row) => {
        if (cancelled) return;
        if (!row) setState({ status: 'not-found' });
        else setState({ status: 'loaded', data: mapCaseStudyToDetail(row) });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', message: err?.message ?? 'Unknown error' });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.status === 'loading') {
    return (
      <section className="container py-5">
        <p>Loading…</p>
      </section>
    );
  }

  if (state.status === 'not-found') {
    return (
      <section className="container py-5">
        <h1 className="ds-6">Case study not found</h1>
        <p>The case study <code>{slug}</code> doesn’t exist or isn’t published.</p>
        <Link to="/case-studies">← Back to all case studies</Link>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="container py-5">
        <h1 className="ds-6">Something went wrong</h1>
        <p>{state.message}</p>
      </section>
    );
  }

  const cs = state.data;

  return (
    <section className="container py-5">
      {/* Breadcrumb */}
      <nav className="mb-4 fs-8">
        <Link to="/">Home</Link> / <Link to="/case-studies">Case Studies</Link> / {cs.title}
      </nav>

      {/* Header */}
      <div className="row mb-5">
        <div className="col-lg-8">
          <h1 className="ds-3 mb-3">{cs.title}</h1>
          {cs.short_description && <p className="fs-5">{cs.short_description}</p>}
        </div>
      </div>

      {/* Cover image */}
      {cs.thumbnail_url && (
        <div className="row mb-5">
          <div className="col-12">
            <img
              src={cs.thumbnail_url}
              alt={cs.cover_alt_text}
              className="w-100 rounded-4"
            />
          </div>
        </div>
      )}

      {/* Body + Sidebar */}
      <div className="row">
        {/* Body — section blocks in authored order, resolved via blockRegistry */}
        <div className="col-lg-8 mb-5">
          <CaseStudyBody slug={slug!} />
        </div>

        {/* Sidebar: project brief */}
        <aside className="col-lg-4">
          <div className="p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h5 className="mb-3">Project Brief</h5>
            <dl className="fs-7">
              {cs.client && (
                <>
                  <dt className="text-600">Client</dt>
                  <dd className="mb-2">{cs.client}</dd>
                </>
              )}
              {cs.industry && (
                <>
                  <dt className="text-600">Industry</dt>
                  <dd className="mb-2">{cs.industry}</dd>
                </>
              )}
              {cs.role_title && (
                <>
                  <dt className="text-600">Role</dt>
                  <dd className="mb-2">{cs.role_title}</dd>
                </>
              )}
              {cs.when && (
                <>
                  <dt className="text-600">When</dt>
                  <dd className="mb-2">{cs.when}</dd>
                </>
              )}
            </dl>
            {cs.showClientDisclosureNote && (
              <ClientDisclosureNote />
            )}
            {/* Skills chips */}
            {cs.skills.length > 0 && (
              <>
                <h6 className="mt-4 mb-2">Skills used</h6>
                <div className="d-flex flex-wrap gap-2">
                  {cs.skills.map((s) => (
                    <Link
                      key={s.slug}
                      to={s.linkHref}
                      className="badge bg-1 fs-8 text-decoration-none"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
