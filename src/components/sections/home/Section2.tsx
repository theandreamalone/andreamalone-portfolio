/**
 * Section2 — client logo ticker (SkillTicker slot).
 *
 * Logos live in public/media/logos/ (SVG or transparent PNG, no processing).
 * Add a client = drop the file in + one line in LOGOS.
 *
 * Every logo renders at a uniform 44px height (.logo-chip img) — width is
 * capped at 200px so wide wordmarks (T-Mobile, AT&T) don't blow out the
 * chip; object-fit: contain preserves each mark's own aspect ratio within
 * that box rather than stretching it.
 */

import Marquee from "@/util/Marquee2";

// srcLight = charcoal variant for light mode. Where absent (AT&T), the white
// logo is CSS-inverted in light mode as a stopgap.
const LOGOS: { src: string; srcLight?: string; alt: string }[] = [
  { src: "/media/logos/ibm-logo-white.png", srcLight: "/media/logos/ibm-charcoal-logo.png", alt: "IBM" },
  { src: "/media/logos/att-logo-white.png", alt: "AT&T" },
  { src: "/media/logos/community-boost-logo-white.svg", srcLight: "/media/logos/community-boost-charcoal-logo.svg", alt: "Community Boost" },
  { src: "/media/logos/northlight-logo-white.png", srcLight: "/media/logos/northlight-charcoal-logo.png", alt: "Northlight Theatre" },
  { src: "/media/logos/bbbs-logo-white.png", srcLight: "/media/logos/bbbs-charcoal-logo.png", alt: "Big Brothers Big Sisters" },
  { src: "/media/logos/simidigi-logo-white.png", srcLight: "/media/logos/simidigi-charcoal-logo.png", alt: "SimiDigi" },
  { src: "/media/logos/t-mobile-logo-white.png", srcLight: "/media/logos/t-mobile-charcoal-logo.png", alt: "T-Mobile" },
];

export default function Section2() {
  return (
    <>
      {/* Home 1 Section 2 — client logos */}
      <style data-id="logo-theme-styles">{`
        [data-bs-theme="dark"] .sec-2-home-1 .logo-light-only { display: none; }
        [data-bs-theme="light"] .sec-2-home-1 .logo-dark-only { display: none; }
        [data-bs-theme="light"] .logo-invert-on-light { filter: invert(1); }
      `}</style>
      <section className="sec-2-home-1 bg-100 mask-image py-5">
        <div className="carouselTicker carouselTicker-left position-relative z-1 wow img-custom-anim-top">
          <Marquee
            direction="left"
            speed={40}
            pauseOnHover={true}
            className="carouselTicker__list"
          >
            {LOGOS.map((logo) => (
              <div key={logo.src} className="carouselTicker__item logo-item">
                <span className="tag-item logo-chip">
                  <img
                    className={logo.srcLight ? "logo-dark-only" : "logo-invert-on-light"}
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                  />
                  {logo.srcLight && (
                    <img
                      className="logo-light-only"
                      src={logo.srcLight}
                      alt={logo.alt}
                      loading="lazy"
                    />
                  )}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
        <style>{`
          .sec-2-home-1 .logo-item {
            margin: 0 32px;              /* breathing room between chips */
          }
          .sec-2-home-1 .logo-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 180px;
            min-height: 64px;      /* was 96 — container read ~32px too tall */
            padding: 12px 32px;
          }
          .sec-2-home-1 .logo-chip img {
            height: 44px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
            display: block;
            opacity: 0.9;
            transition: opacity .15s ease;
          }
          .sec-2-home-1 .logo-chip:hover img { opacity: 1; }
          @media (max-width: 767px) {
            .sec-2-home-1 .logo-item { margin: 0 16px; }
            .sec-2-home-1 .logo-chip { min-width: 140px; min-height: 52px; padding: 10px 20px; }
          }
        `}</style>
      </section>
    </>
  );
}
