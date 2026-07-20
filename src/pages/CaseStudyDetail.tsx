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
    <section className="sec-1-single-1 pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
            {/* Breadcrumb — template single-1 pattern */}
            <nav aria-label="breadcrumb">
              <ul className="breadcrumb list-unstyled d-flex flex-row gap-2 align-items-center m-0 ps-0 py-4">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-600 fs-7 hover-dark">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <span className="icon-shape icon-xxs">
                    <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none">
                      <path d="M6.125 4.5625L9.5625 7.84375L6.125 11.125" stroke="#626568" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/case-studies" className="text-600 fs-7 hover-dark">Case Studies</Link>
                </li>
                <li className="breadcrumb-item">
                  <span className="icon-shape icon-xxs">
                    <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none">
                      <path d="M6.125 4.5625L9.5625 7.84375L6.125 11.125" stroke="#626568" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </li>
                <li className="breadcrumb-item active text-dark fs-7" aria-current="page">
                  {cs.title}
                </li>
              </ul>
            </nav>

            {/* Badges + title — template card-info pattern */}
            <div className="article card-info d-flex flex-wrap align-items-center gap-2 mt-4">
              {cs.industry && <span className="badge bg-1 fs-8">{cs.industry}</span>}
              {cs.client && <span className="badge bg-2 fs-8">{cs.client}</span>}
              {cs.when && (
                <ul className="d-flex align-items-center text-600 m-0 ps-3">
                  <li><p className="fs-8 m-0">{cs.when}</p></li>
                </ul>
              )}
              <h1 className="ds-4 mb-0 w-100">{cs.title}</h1>
              {cs.short_description && (
                <p className="fs-6 text-600 mt-2 mb-0">{cs.short_description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-top mt-4" />

        {/* Meta row — role + year */}
        <div className="row">
          <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
            <div className="bottom mt-auto d-flex flex-wrap align-items-center gap-2 pt-4">
              {cs.role_title && <span className="fs-7 text-dark fw-regular">{cs.role_title}</span>}
              {cs.skills.length > 0 && (
                <div className="ms-md-auto d-flex flex-wrap align-items-center gap-2">
                  {cs.skills.map((sk) => (
                    <span key={sk.slug} className="bg-200 fs-8 rounded-8 py-2 px-3">
                      {sk.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cover — full-bleed, template treatment */}
      {cs.thumbnail_url && (
        <div className="custom-container-2 py-5">
          <img
            src={cs.thumbnail_url}
            alt={cs.cover_alt_text}
            className="rounded-16 cover-image"
          />
        </div>
      )}

      {/* Body */}
      <div className="container">
        <div className="row">
          <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
            <CaseStudyBody slug={slug!} />
            {cs.showClientDisclosureNote && <ClientDisclosureNote />}
          </div>
        </div>
      </div>
    </section>
  );
}
