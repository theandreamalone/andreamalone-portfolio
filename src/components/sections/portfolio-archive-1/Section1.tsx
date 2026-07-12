import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Link from "@/components/common/Link";
import ArticleCard7 from "@/components/cards/ArticleCard7";
import BodyClassManager from "./BodyClassManager";
import { fetchCaseStudies } from "@/lib/queries/caseStudies";
import { mapCaseStudyToArchive1Card } from "@/lib/templateGlossary";
import type { CaseStudyRow } from "@/lib/templateGlossary";

type FetchState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; data: CaseStudyRow[] };

const ITEMS_PER_PAGE = 8;

export default function Section1() {
    const [searchParams] = useSearchParams();
    const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;

    const [state, setState] = useState<FetchState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        fetchCaseStudies()
            .then((data) => {
                if (!cancelled) setState({ status: "loaded", data });
            })
            .catch((err) => {
                if (!cancelled) setState({ status: "error", message: err?.message ?? "Unknown error" });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const buildUrl = (page: number) => `/case-studies?page=${page}`;

    return (
        <>
            <BodyClassManager />
            <section className="sec-1-portfolio-archive" data-background="/assets/imgs/page/bg-home1-sec1.png">
                <div className="container">
                    {/* Breadcumb */}
                    <div className="row">
                        <div className="col-12">
                            <nav aria-label="breadcrumb">
                                <ul className="breadcrumb list-unstyled d-flex flex-row gap-2 align-items-center m-0 ps-0 py-4">
                                    <li className="breadcrumb-item">
                                        <Link href="/" className="text-600 fs-7 hover-dark">
                                            Home
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <span className="icon-shape icon-xxs">
                                            <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none">
                                                <path d="M6.125 4.5625L9.5625 7.84375L6.125 11.125" stroke="#626568" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </li>
                                    <li className="breadcrumb-item active text-dark fs-7" aria-current="page">
                                        Case Studies
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    <div className="row align-items-end">
                        <div className="col-lg-6 col-md-8 col-12">
                            <div className="title">
                                <h4 className="mb-0 ds-4">
                                    <span className="text-anime-style-2 text-uppercase">Case Studies</span>
                                    {state.status === "loaded" && (
                                        <span className="text-600 fw-regular fs-6 bg-white rounded-8 p-2 ms-2">
                                            {state.data.length} {state.data.length === 1 ? "case study" : "case studies"}
                                        </span>
                                    )}
                                </h4>
                                <p className="fs-7 mb-0 text-anime-style-1">Personal projects and creative discoveries built through the years.</p>
                            </div>
                        </div>
                    </div>

                    {state.status === "loading" && (
                        <div className="row pt-md-5 pt-4">
                            <div className="col-12">
                                <p>Loading…</p>
                            </div>
                        </div>
                    )}

                    {state.status === "error" && (
                        <div className="row pt-md-5 pt-4">
                            <div className="col-12">
                                <p>Something went wrong: {state.message}</p>
                            </div>
                        </div>
                    )}

                    {state.status === "loaded" && (() => {
                        const totalPages = Math.max(1, Math.ceil(state.data.length / ITEMS_PER_PAGE));
                        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                        const pageItems = state.data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                        return (
                            <>
                                {pageItems.length === 0 && (
                                    <div className="row pt-md-5 pt-4">
                                        <div className="col-12">
                                            <p>No published case studies yet.</p>
                                        </div>
                                    </div>
                                )}

                                {pageItems.length > 0 && (
                                    <div className="row g-lg-5 g-4 pt-md-5 pt-4">
                                        {pageItems.map((cs, idx) => (
                                            <div className="col-lg-3 col-md-6 col-12" key={cs.slug}>
                                                <ArticleCard7 card={mapCaseStudyToArchive1Card(cs)} idx={idx} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="row mt-5">
                                        <div className="col-12 d-flex justify-content-center align-items-center">
                                            <nav aria-label="Page navigation">
                                                <ul className="pagination">
                                                    {currentPage > 1 && (
                                                        <li className="page-item">
                                                            <Link href={buildUrl(currentPage - 1)} className="page-link icon-lg pagination_item rounded-circle icon-shape">
                                                                ←
                                                            </Link>
                                                        </li>
                                                    )}
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                        <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                                                            <Link href={buildUrl(page)} className={`page-link icon-lg pagination_item rounded-circle icon-shape fs-18 fw-semi-bold ${page === currentPage ? "active" : ""}`}>
                                                                {page}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                    {currentPage < totalPages && (
                                                        <li className="page-item">
                                                            <Link href={buildUrl(currentPage + 1)} className="page-link icon-lg pagination_item rounded-circle icon-shape">
                                                                →
                                                            </Link>
                                                        </li>
                                                    )}
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </section>
        </>
    );
}
