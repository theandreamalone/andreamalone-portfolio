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

const LOGOS: { src: string; alt: string; h: number }[] = [
  { src: "/media/logos/ibm-logo-white.png", alt: "IBM", h: 40 },
  { src: "/media/logos/att-logo-white.png", alt: "AT&T", h: 40 },
  { src: "/media/logos/community-boost-logo-white.svg", alt: "Community Boost", h: 34 },
  { src: "/media/logos/northlight-logo-white.png", alt: "Northlight Theatre", h: 38 },
  { src: "/media/logos/bbbs-logo-white.png", alt: "Big Brothers Big Sisters", h: 44 },
  { src: "/media/logos/simidigi-logo-white.png", alt: "SimiDigi", h: 34 },
  // T-Mobile chip — enable only after disclosure permission (master plan item 25).
  // { src: "/media/logos/t-mobile-logo-white.png", alt: "T-Mobile", h: 40 },
];

export default function Section2() {
  return (
    <>
      {/* Home 1 Section 2 — client logos */}
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
                    src={logo.src}
                    alt={logo.alt}
                    style={{ height: logo.h }}
                    loading="lazy"
                  />
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
