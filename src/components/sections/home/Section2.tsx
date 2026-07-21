/**
 * Section2 — client logo ticker (SkillTicker slot).
 *
 * Logos live in public/media/logos/ (SVG or transparent PNG, no processing).
 * Add a client = drop the file in + one line in LOGOS.
 *
 * `h` = render height in px, per logo, because aspect ratios differ:
 * square marks (IBM, BBBS) need more height to read at the same visual
 * weight as wide wordmarks. Tune per logo by eye.
 */

import Marquee from "@/util/Marquee2";

// srcLight = charcoal variant for light mode. Where absent (AT&T), the white
// logo is CSS-inverted in light mode as a stopgap.
const LOGOS: { src: string; srcLight?: string; alt: string; h: number }[] = [
  { src: "/media/logos/ibm-logo-white.png", srcLight: "/media/logos/ibm-charcoal-logo.png", alt: "IBM", h: 40 },
  { src: "/media/logos/att-logo-white.png", alt: "AT&T", h: 40 },
  { src: "/media/logos/community-boost-logo-white.svg", srcLight: "/media/logos/community-boost-charcoal-logo.svg", alt: "Community Boost", h: 34 },
  { src: "/media/logos/northlight-logo-white.png", srcLight: "/media/logos/northlight-charcoal-logo.png", alt: "Northlight Theatre", h: 38 },
  { src: "/media/logos/bbbs-logo-white.png", srcLight: "/media/logos/bbbs-charcoal-logo.png", alt: "Big Brothers Big Sisters", h: 44 },
  { src: "/media/logos/simidigi-logo-white.png", srcLight: "/media/logos/simidigi-charcoal-logo.png", alt: "SimiDigi", h: 34 },
  { src: "/media/logos/t-mobile-logo-white.png", srcLight: "/media/logos/t-mobile-charcoal-logo.png", alt: "T-Mobile", h: 40 },
];

export default function Section2() {
  return (
    <>
      {/* Home 1 Section 2 — client logos */}
      <style data-id="logo-theme-styles">{`
        [data-bs-theme="dark"] .logo-light-only { display: none; }
        [data-bs-theme="light"] .logo-dark-only { display: none; }
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
                    style={{ height: logo.h }}
                    loading="lazy"
                  />
                  {logo.srcLight && (
                    <img
                      className="logo-light-only"
                      src={logo.srcLight}
                      alt={logo.alt}
                      style={{ height: logo.h }}
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
            width: auto;
            max-width: 180px;
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
