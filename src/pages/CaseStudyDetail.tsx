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
import Layout from '@/components/layout/Layout';
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
      <Layout headerStyle={2} footerStyle={4}>
        <section className="container py-5">
          <p>Loading…</p>
        </section>
      </Layout>
    );
  }

  if (state.status === 'not-found') {
    return (
      <Layout headerStyle={2} footerStyle={4}>
      <section className="container py-5">
        <h1 className="ds-6">Case study not found</h1>
        <p>The case study <code>{slug}</code> doesn’t exist or isn’t published.</p>
        <Link to="/case-studies">← Back to all case studies</Link>
      </section>
      </Layout>
    );
  }

  if (state.status === 'error') {
    return (
      <Layout headerStyle={2} footerStyle={4}>
        <section className="container py-5">
          <h1 className="ds-6">Something went wrong</h1>
          <p>{state.message}</p>
        </section>
      </Layout>
    );
  }

  const cs = state.data;

  return (
    <Layout headerStyle={2} footerStyle={4}>
    <section className="sec-1-portfolio-archive pb-100">
      {/* Breadcrumb */}
      <div className="container">
        <div className="row">
          <div className="col-12">
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
          </div>
        </div>

        {/* Title */}
        <div className="row align-items-end">
          <div className="col-lg-7 col-12">
            <div className="title">
              <h1 className="mb-0 ds-4 text-uppercase">{cs.title}</h1>
              {cs.short_description && <p className="fs-7 mb-0">{cs.short_description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      {cs.thumbnail_url && (
        <div className="custom-container-3 mt-5">
          <div className="d-flex justify-content-center">
            <div className="block-banner rounded-16 overflow-hidden">
              <img src={cs.thumbnail_url} alt={cs.cover_alt_text} className="w-100 h-auto d-block" />
            </div>
          </div>
        </div>
      )}

      {/* Brief + body */}
      <div className="container pt-100">
        <div className="row g-lg-5 g-4">
          <div className="col-lg-4 pe-lg-5">
            <div className="block-brief rounded-16 p-4 border-200 bg-white">
              <div className="title border-bottom-200 pb-2 mb-4 m-2">
                <h5 className="mb-0">Project brief</h5>
              </div>
              <div className="content">
                <ul className="text-secondary ps-3 fs-18 m-2">
                  {cs.client && (
                    <li>Client: <span className="text-dark">{cs.client}</span></li>
                  )}
                  {cs.industry && (
                    <li>Industry: <span className="text-dark">{cs.industry}</span></li>
                  )}
                  {cs.role_title && (
                    <li>Role: <span className="text-dark">{cs.role_title}</span></li>
                  )}
                  {cs.when && (
                    <li>Timeline: <span className="text-dark">{cs.when}</span></li>
                  )}
                </ul>
                {cs.skills.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 m-2 pt-2">
                    {cs.skills.map((sk) => (
                      <span key={sk.slug} className="bg-200 fs-8 rounded-8 py-2 px-3">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                )}
                {cs.showClientDisclosureNote && (
                  <div className="m-2">
                    <ClientDisclosureNote />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <CaseStudyBody slug={slug!} />
          </div>
        </div>
      </div>
    </section>
    </Layout>
  );
}
