import { useEffect, useMemo, useRef, useState } from "react";
import SwiperDynamic from "@/components/shared/SwiperDynamic";
import Image from "@/components/common/Image";
import { fetchCaseStudyBySlug } from "@/lib/queries/caseStudyBySlug";
import { mapCaseStudyToFeature, type CaseStudyFeatureData } from "@/lib/templateGlossary";
import type { RecordId } from "@/lib/viewContract";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Section9 — the CaseStudyFeature section (full-bleed featured case study).
 *
 * Consumes `record_ids` from the router/static baseline. Renders one slide per
 * `cs:` ID, in the order given (contract invariant 2 — router order is the
 * design). Non-`cs:` IDs and unresolvable slugs are dropped and logged
 * (invariant 5).
 *
 * Renders nothing when it has no resolvable records — an empty shell would be
 * worse than an absent section.
 *
 * Template markup preserved from the original Magzin Section9; only the data
 * source changed. The original hardcoded slides array is gone.
 */

interface Section9Props {
  displayBtn?: string;
  record_ids?: RecordId[];
}

export default function Section9({ displayBtn = "d-none", record_ids = [] }: Section9Props) {
  const [slides, setSlides] = useState<CaseStudyFeatureData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const slugs = useMemo(
    () =>
      record_ids
        .filter((id) => {
          if (id.startsWith("cs:")) return true;
          console.warn(`[Section9] non-case-study id dropped: ${id}`);
          return false;
        })
        .map((id) => id.slice("cs:".length)),
    [record_ids.join("|")]
  );

  useEffect(() => {
    if (slugs.length === 0) {
      setSlides([]);
      return;
    }
    let cancelled = false;

    Promise.all(slugs.map((slug) => fetchCaseStudyBySlug(slug)))
      .then((rows) => {
        if (cancelled) return;
        const resolved = rows
          .map((row, i) => {
            if (!row) {
              console.warn(`[Section9] unknown case study dropped: cs:${slugs[i]}`);
              return null;
            }
            return mapCaseStudyToFeature(row);
          })
          .filter((r): r is CaseStudyFeatureData => r !== null);
        setSlides(resolved);
      })
      .catch((err) => {
        console.warn("[Section9] fetch failed", err);
        if (!cancelled) setSlides([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs.join("|")]);

  if (slides.length === 0) return null;

  const handleSlideChange = (swiper: any) => setCurrentSlideIndex(swiper.realIndex);
  const handleSwiperInit = (swiper: any) => (swiperRef.current = swiper);

  return (
    <>
      {/* Home 1 Section 9 — CaseStudyFeature */}
      <section className="sec-9-home-1">
        <div className="custom-container position-relative">
          <div className={`swiper-btn ${displayBtn} align-items-center justify-content-between`}>
            <div className="swiper-btn-next">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M10.25 6.75L4.75 12L10.25 17.25" stroke="#0e0e0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.25 12H5" stroke="#0e0e0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="swiper-btn-prev">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="#0e0e0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 12H4.75" stroke="#0e0e0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="block-card-swiper">
            <div className="container">
              <div className="row align-items-stretch g-5">
                <div className="col-lg-6">
                  <div
                    id="gallery-background"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      zIndex: 0,
                      transition: "background-image 0.8s ease-in-out",
                      backgroundImage: `url(${slides[currentSlideIndex]?.bg})`,
                    }}
                  />
                  <SwiperDynamic
                    className="gallery-left position-relative"
                    spaceBetween={10}
                    slidesPerView={1}
                    loop={slides.length > 1}
                    autoplay={slides.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
                    pagination={{ clickable: true, el: ".swiper-pagination", type: "bullets" }}
                    navigation={{ nextEl: ".swiper-btn-next", prevEl: ".swiper-btn-prev" }}
                    onSlideChange={handleSlideChange}
                    onSwiper={handleSwiperInit}
                  >
                    {slides.map((slide, index) => (
                      <div key={index}>
                        <div className="article">
                          <div className="card-body">
                            <a href={slide.linkBadge} className="badge bg-2 fs-8 mb-3">
                              {slide.badge}
                            </a>
                            <h5 className="card-title mb-0 text-white changeless">
                              <a href={slide.link}>{slide.title}</a>
                            </h5>
                            <p className="card-text text-white mb-0 fs-7 mt-3 changeless">
                              {slide.description}
                            </p>
                            <div className="bottom mt-auto d-flex flex-wrap align-items-center gap-2 pt-5">
                              {slide.client && (
                                <span className="fs-7 text-white fw-regular changeless">
                                  {slide.client}
                                </span>
                              )}
                              {slide.when && (
                                <ul className="d-flex align-items-center gap-4 text-white m-0 ps-3 changeless">
                                  <li>
                                    <p className="fs-7 m-0 text-white changeless">{slide.when}</p>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </SwiperDynamic>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <style>{`
          /* Solid container (2026-07-20): the gradient scrim read as a smear
             over light cover images. Solid template grey instead — same grey
             as the hero input (--tc-bg-2). */
          .sec-9-home-1 .gallery-left .article .card-body {
            background: var(--tc-bg-2, #17181a);
            border-radius: 16px;
            padding: 24px;
          }
          .swiper-pagination-bullet {
            width: 12px !important;
            height: 12px !important;
            background: rgba(255, 255, 255, 0.5) !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            opacity: 1 !important;
            margin: 0 4px !important;
          }
          .swiper-pagination-bullet-active {
            background: #ffffff !important;
            transform: scale(1.2) !important;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
          }
          .swiper-pagination-bullet:hover {
            background: rgba(255, 255, 255, 0.8) !important;
            transform: scale(1.1) !important;
          }
        `}</style>
      </section>
    </>
  );
}
