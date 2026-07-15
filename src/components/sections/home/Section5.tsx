import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/elements/TitleWhite";
import AuthorCard from "@/components/cards/AuthorCard";
import SwiperDynamic from "@/components/shared/SwiperDynamic";
import { fetchTestimonials, fetchTestimonialsBySlugs } from "@/lib/queries/testimonials";
import { mapTestimonialToCard, type TestimonialCardData } from "@/lib/templateGlossary";
import type { RecordId } from "@/lib/viewContract";

/**
 * Section5 — the Testimonials section.
 *
 * Consumes `record_ids` (`tm:` prefix). When empty, falls back to fetching all
 * testimonials, featured first — that's the static-baseline behaviour.
 *
 * Quote prose is NOT fetched here. Each card carries a `quoteSlug`; AuthorCard
 * resolves the prose from bundled MDX via blockRegistry (Option A — prose never
 * enters the database).
 *
 * Changes from the original Magzin Section5:
 *  - Dropped cardHome-1.json import.
 *  - Dropped the "Become an author" CTA (templateGlossary: single-author site).
 *  - Dropped the "Leading experts…" blog blurb.
 *  - Section title is a prop, not hardcoded blog copy.
 *  - slidesPerView and loop adapt to card count — a 4-up loop with one card
 *    renders broken and triggers Swiper's loop warning.
 *
 * Renders nothing when no testimonials resolve.
 */

interface Section5Props {
  record_ids?: RecordId[];
  title?: string;
  description?: string;
}

export default function Section5({
  record_ids = [],
  title = "What collaborators say",
  description = "",
}: Section5Props) {
  const [cards, setCards] = useState<TestimonialCardData[]>([]);

  const slugs = useMemo(
    () =>
      record_ids
        .filter((id) => {
          if (id.startsWith("tm:")) return true;
          console.warn(`[Section5] non-testimonial id dropped: ${id}`);
          return false;
        })
        .map((id) => id.slice("tm:".length)),
    [record_ids.join("|")]
  );

  useEffect(() => {
    let cancelled = false;

    const load = slugs.length > 0 ? fetchTestimonialsBySlugs(slugs) : fetchTestimonials();

    load
      .then((rows) => {
        if (!cancelled) setCards(rows.map(mapTestimonialToCard));
      })
      .catch((err) => {
        console.warn("[Section5] fetch failed", err);
        if (!cancelled) setCards([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs.join("|")]);

  if (cards.length === 0) return null;

  const perView = Math.min(4, cards.length);
  const canLoop = cards.length > perView;

  return (
    <>
      {/* Home 1 Section 5 — Testimonials */}
      <section
        className="sec-5-home-1 sec-padding overflow-hidden"
        data-background="/assets/imgs/page/bg-home1-sec5.png"
      >
        <div className="container">
          <div className="row">
            <div className="col-12">
              <SectionTitle title={title} description={description} />
            </div>
          </div>
          <div className="row py-5">
            <div className="col-md-12 col-8 mx-auto position-relative">
              <SwiperDynamic
                className="swiper slider-4 rounded-16"
                slidesPerView={perView}
                spaceBetween={30}
                slidesPerGroup={1}
                centeredSlides={false}
                loop={canLoop}
                autoplay={canLoop ? { delay: 5000 } : false}
                breakpoints={{
                  1200: { slidesPerView: perView },
                  992: { slidesPerView: Math.min(3, cards.length) },
                  768: { slidesPerView: Math.min(2, cards.length) },
                  576: { slidesPerView: 1 },
                  0: { slidesPerView: 1 },
                }}
                navigation={{
                  nextEl: ".swiper-btn-next",
                  prevEl: ".swiper-btn-prev",
                }}
              >
                {cards.map((card, idx) => (
                  <div key={idx}>
                    <AuthorCard card={card} idx={idx} />
                  </div>
                ))}
              </SwiperDynamic>
              {canLoop && (
                <div className="d-flex align-items-center gap-2 swiper-btn">
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
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
