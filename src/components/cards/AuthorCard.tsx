import { useState } from "react";
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
 *
 * Excerpt reveal (2026-07-21): the quote is collapsed by default and expands
 * the card downward on hover or keyboard focus (WCAG 1.4.13 — hoverable via
 * :focus-within/:hover on the whole card, so moving onto the quote itself
 * doesn't close it; persistent — no auto-dismiss timer). Touch has no
 * reliable hover, so a visible toggle button drives the same state via tap;
 * that same button (and Escape) also covers "dismissible." The quote node
 * itself is never removed from the DOM or `display:none`/`aria-hidden` —
 * only visually collapsed (max-height/overflow) — so it's always
 * screen-reader reachable regardless of expanded state.
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

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AuthorCard({ card, idx }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  // No real photo on file for this person — degrade to an initials badge
  // rather than the template's 41x41 stock avatar (pixelates hard at the
  // card's 280x370 display size).
  const [photoOk, setPhotoOk] = useState(true);
  // Escape must dismiss even though the toggle button keeps keyboard focus
  // afterward (pressing a key doesn't blur its target) — so :focus-within
  // alone can't be told to close. This flag overrides hover/focus/expanded
  // until the user actually disengages (mouse leaves, or focus exits the
  // card) and re-engages, at which point it's armed to reveal again.
  const [dismissed, setDismissed] = useState(false);
  const Quote = card.quoteSlug
    ? resolveBlock(`block:${card.quoteSlug}` as BlockId)
    : null;
  const quoteId = `testimonial-quote-${card.quoteSlug ?? idx}`;

  return (
    <>
      <div
        className={`author-grid-wrap ${card.bgstickyCorner} h-100 ${expanded ? "is-expanded" : ""} ${dismissed ? "is-dismissed" : ""}`}
        key={idx}
        onMouseLeave={() => setDismissed(false)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDismissed(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setExpanded(false);
            setDismissed(true);
          }
        }}
      >
        <Link href={card.linkPost}>
          {photoOk ? (
            <Image
              src={card.img}
              alt={card.name}
              className="author-image-avator w-100 h-100"
              width={280}
              height={370}
              onError={() => setPhotoOk(false)}
            />
          ) : (
            <div className="author-image-avator author-initials-avatar" aria-hidden="true">
              <span>{initialsOf(card.name)}</span>
            </div>
          )}
        </Link>
        <div className="author-sticky-block-left-bottom">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <Link href={card.linkPost}>
              <h6 className="fs-7 mb-0">{card.name}</h6>
            </Link>
            {Quote && (
              <button
                type="button"
                className="testimonial-toggle"
                aria-expanded={expanded}
                aria-controls={quoteId}
                onClick={(e) => {
                  setExpanded((v) => !v);
                  setDismissed(false); // an explicit tap always re-arms, even right after Escape
                  // Some browsers don't focus a button on click (Safari
                  // notably never does) — force it so Escape has something
                  // to bubble from and :focus-within stays in sync with tap.
                  e.currentTarget.focus();
                }}
              >
                <span className="visually-hidden">
                  {expanded ? `Hide quote from ${card.name}` : `Show quote from ${card.name}`}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <p className="fs-7 m-0">{card.position}</p>
          {Quote && (
            <div id={quoteId} className="testimonial-quote fs-8 mt-2">
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
