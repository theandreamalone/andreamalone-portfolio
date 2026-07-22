import { useEffect, useState } from "react";
import Link from "@/components/common/Link";
import { resolveBlock } from "@/lib/blockRegistry";
import { fetchSkills } from "@/lib/queries/skills";
import { mapSkillToPill } from "@/lib/templateGlossary";
import type { SkillRow } from "@/lib/templateGlossary";
import type { BlockId } from "@/lib/viewContract";

/**
 * who-i-am/Section1 — hero + positioning (route: /page-about).
 *
 * Prose is reused, never authored here (Option A): home-hero.mdx +
 * home-intro-hiring-manager.mdx + home-intro-recruiter.mdx are the same
 * published blocks already rendered on `/`. No new bio copy is written —
 * a fuller narrative bio has no reviewed source yet (see the [NEED:] note
 * below the intro prose, a source comment only, never rendered).
 *
 * Skills render as pills (templateGlossary decision #19 — About reuses the
 * skill-pill data shape, wrapped in flex here since the carouselTicker
 * variant is Home-only). Self-fetching; renders nothing if the table is
 * empty rather than a fake/static list.
 */

const HERO_BLOCK = "block:home-hero" as BlockId;
const HIRING_MANAGER_BLOCK = "block:home-intro-hiring-manager" as BlockId;
const RECRUITER_BLOCK = "block:home-intro-recruiter" as BlockId;

// [NEED: a longer-form narrative bio — background, path into AI/UX,
// what she looks for in a next role. No reviewed source exists yet;
// author via brief → ChatGPT → Claude review pipeline, same as other
// content blocks. Do not write this prose directly in code.]

function SkillPills() {
  const [skills, setSkills] = useState<SkillRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchSkills()
      .then((rows) => {
        if (!cancelled) setSkills(rows);
      })
      .catch((err) => {
        console.warn("[who-i-am/Section1] fetchSkills failed", err);
        if (!cancelled) setSkills([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (skills.length === 0) return null;

  return (
    <div className="d-flex flex-wrap gap-2 mt-4">
      {skills.map((skill) => {
        const pill = mapSkillToPill(skill);
        // Plain spans, not links — there is no /skills/:slug route, so the
        // glossary's linkHref 404s. Matches CaseStudyDetail's skill chips.
        // If a skill detail page ships later, restore <Link href={pill.linkHref}>.
        return (
          <span key={skill.slug} className="bg-200 fs-8 rounded-8 py-2 px-3 text-dark">
            {pill.name}
            {pill.suffix && <span className="text-600"> · {pill.suffix}</span>}
          </span>
        );
      })}
    </div>
  );
}

export default function Section1() {
  const Hero = resolveBlock(HERO_BLOCK);
  const HiringManagerIntro = resolveBlock(HIRING_MANAGER_BLOCK);
  const RecruiterIntro = resolveBlock(RECRUITER_BLOCK);
  const [headshotOk, setHeadshotOk] = useState(true);

  return (
    <>
      <section className="sec-1-about sec-padding">
        <div className="container">
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
                    Who I Am
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <div className="rounded-16 overflow-hidden" style={{ maxWidth: 375 }}>
                {headshotOk ? (
                  <img
                    src="/media/site/headshot-v2.webp"
                    alt="Andrea Malone"
                    width={757}
                    height={1024}
                    className="w-100 h-auto d-block"
                    onError={() => setHeadshotOk(false)}
                  />
                ) : (
                  <div className="bg-100 d-flex align-items-center justify-content-center" style={{ aspectRatio: "4 / 5" }}>
                    <span className="fs-7 text-600 text-center px-4">
                      Headshot placeholder
                      <br />
                      public/media/site/headshot-v2.webp
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-7">
              <p className="fs-7 text-600 mb-2">Andrea Malone · Lead AI Product Designer</p>
              {Hero && (
                <div className="ds-4 mb-4">
                  <Hero />
                </div>
              )}
              {HiringManagerIntro && (
                <div className="fs-6 mb-3">
                  <HiringManagerIntro />
                </div>
              )}
              {RecruiterIntro && (
                <div className="fs-7 text-600">
                  <RecruiterIntro />
                </div>
              )}
              <SkillPills />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
