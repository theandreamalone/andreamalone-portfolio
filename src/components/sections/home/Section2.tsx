/**
 * Section2 — client logo ticker (SkillTicker slot).
 *
 * Replaces the template's filler tag chips with real client logos from
 * public/media/logos/. Edit the LOGOS array to add or remove one —
 * files go in public/media/logos/ (SVG or transparent PNG, no processing).
 *
 * Logos are site-wide brand evidence, deliberately NOT tied to any single
 * case study (anonymized studies stay anonymized; the resume/LinkedIn
 * already names these clients).
 */

import Marquee from "@/util/Marquee2";

const LOGOS: { src: string; alt: string }[] = [
  { src: "/media/logos/ibm-logo-white.svg", alt: "IBM" },
  { src: "/media/logos/att-logo-white.png", alt: "AT&T" },
  { src: "/media/logos/community-boost-logo-white.svg", alt: "Community Boost" },
  { src: "/media/logos/northlight-logo-white.png", alt: "Northlight Theatre" },
  { src: "/media/logos/bbbs-logo-white.png", alt: "Big Brothers Big Sisters" },
  { src: "/media/logos/simidigi-logo-white.png", alt: "SimiDigi" },
];

export default function Section2() {
  return (
    <>
      {/* Home 1 Section 2 — client logos */}
      <section className="sec-2-home-1 bg-100 mask-image py-5">
        <div className="carouselTicker carouselTicker-left position-relative z-1 wow img-custom-anim-top">
          <Marquee
            direction="left"
            speed={50}
            pauseOnHover={true}
            className="carouselTicker__list"
          >
            {LOGOS.map((logo) => (
              <div key={logo.src} className="carouselTicker__item mx-3">
                <span className="tag-item logo-chip">
                  <img src={logo.src} alt={logo.alt} loading="lazy" />
                </span>
              </div>
            ))}
          </Marquee>
        </div>
        <style>{`
          .sec-2-home-1 .logo-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 28px;
          }
          .sec-2-home-1 .logo-chip img {
            height: 28px;
            width: auto;
            display: block;
            opacity: 0.85;
            transition: opacity .15s ease;
          }
          .sec-2-home-1 .logo-chip:hover img { opacity: 1; }
        `}</style>
      </section>
    </>
  );
}
