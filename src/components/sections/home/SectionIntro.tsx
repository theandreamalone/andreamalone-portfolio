import { useEffect, useState } from "react";
import AdaptiveBlock from "@/components/AdaptiveBlock";

type Audience = "recruiter" | "hiring-manager";

// Only two variants exist as authored MDX content today (see
// content/blocks/home-intro-*.mdx) — the selector only offers what
// actually changes, rather than implying adaptivity that isn't there yet.
const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "recruiter", label: "Recruiter" },
  { value: "hiring-manager", label: "Hiring Manager" },
];

const STORAGE_KEY = "audience-preference";

export default function SectionIntro() {
  const [audience, setAudience] = useState<Audience>("recruiter");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "recruiter" || stored === "hiring-manager") {
      setAudience(stored);
    }
  }, []);

  const handleChange = (value: Audience) => {
    setAudience(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <section className="sec-intro-home-1 sec-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <div className="fs-5 mb-4">
              <AdaptiveBlock
                blockPrefix="home-hero"
                audience={audience}
                fallback={
                  <>I design AI-native interfaces that adapt to intent without
                  sacrificing trust. This site is one of them.</>
                }
              />
            </div>
            <div className="fs-6 text-600 mb-4">
              <AdaptiveBlock
                blockPrefix="home-intro"
                audience={audience}
                fallback={
                  <>Senior UX designer moving into AI UI leadership — evaluating
                  and shipping adaptive, model-driven interfaces without giving
                  up claims integrity.</>
                }
              />
            </div>
            <div className="d-inline-flex align-items-center gap-2 fs-8 text-600">
              <span>This page adapts based on who&rsquo;s reading — viewing as:</span>
              <select
                className="form-select form-select-sm w-auto d-inline-block"
                value={audience}
                onChange={(e) => handleChange(e.target.value as Audience)}
                aria-label="Choose which audience view to see"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
