import Link from "@/components/common/Link";
import Image from "@/components/common/Image";
import { resolveBlock } from "@/lib/blockRegistry";
import type { BlockId } from "@/lib/viewContract";
import "./AuthorCard.css";

/**
 * AuthorCard — repurposed as TestimonialCard per templateGlossary decision #10.
 *
 * `quoteSlug` is optional. When present, the quote prose is resolved from the
 * bundled MDX registry — never from the database (Option A: prose never enters
 * Supabase). When absent, the card renders as the original author card.
 *
 * Existing call sites that pass only {img, linkPost, name, position,
 * bgstickyCorner} keep working unchanged.
 */

type CardProps = {
  card: {
    img: string;
    linkPost: string;
    name: string;
    position: string;
    bgstickyCorner: string;
    quoteSlug?: string;
  };
  idx: number;
};

export default function AuthorCard({ card, idx }: CardProps) {
  const Quote = card.quoteSlug
    ? resolveBlock(`block:${card.quoteSlug}` as BlockId)
    : null;

  return (
    <>
      <div className={`author-grid-wrap ${card.bgstickyCorner} h-100`} key={idx}>
        <Link href={card.linkPost}>
          <Image
            src={card.img}
            alt={card.name}
            className="author-image-avator w-100 h-100"
            width={280}
            height={370}
            onError={(e) => {
              // Derived local photo path can 404 for a new person without a
              // file in /media/testimonials — degrade to the template avatar
              // instead of a broken image.
              const el = e.currentTarget;
              const fallback = "/assets/imgs/template/author/author-5.png";
              if (!el.src.endsWith(fallback)) el.src = fallback;
            }}
          />
        </Link>
        <div className="author-sticky-block-left-bottom">
          <Link href={card.linkPost}>
            <h6 className="fs-7 mb-0">{card.name}</h6>
          </Link>
          <p className="fs-7 m-0">{card.position}</p>
          {Quote && (
            <div className="testimonial-quote fs-8 mt-2">
              <Quote />
            </div>
          )}
          {/* Corners live INSIDE the block (moved 2026-07-20) so the wavy
              cutouts anchor to the block's real edges. As siblings they were
              pinned to the template's fixed 136×52 size and detached the
              moment a name or title wrapped. */}
          <div className="author-sticky-corner-left-top" />
          <div className="author-sticky-corner-right-bottom" />
        </div>
      </div>
    </>
  );
}
