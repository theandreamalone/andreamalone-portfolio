import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SectionRouter from "@/components/SectionRouter";
import { route, SUGGESTED_QUESTIONS } from "@/lib/hardcodedRouter";
import { STATIC_BASELINE } from "@/lib/staticBaseline";
import type { RouterResponse } from "@/lib/viewContract";

/**
 * AdaptiveHome — the question-driven composition surface (`/adaptive`).
 *
 * The page becomes the answer to the visitor's question, composed from
 * pre-authored evidence. Free text is the product; the chips are training
 * wheels (D3).
 *
 * Cold load renders the static baseline — identical to `/`. Nothing about the
 * page depends on the router succeeding.
 *
 * The active-intent chip is the accountability pillar demonstrating itself
 * (plan item 13): tailoring is visible and reversible, never silent. A dark
 * pattern is one the visitor can't see.
 *
 * No animation yet. Plan item 9 specifies Framer Motion, which isn't installed
 * — GSAP is. That discrepancy needs resolving before the transition work; it
 * is polish, not a blocker.
 */

export default function AdaptiveHome() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<RouterResponse>(STATIC_BASELINE);
  const [asked, setAsked] = useState<string | null>(null);

  function ask(q: string) {
    setQuestion(q);
    setAsked(q.trim() || null);
    setResponse(route(q));
  }

  function reset() {
    setQuestion("");
    setAsked(null);
    setResponse(STATIC_BASELINE);
  }

  const orderedSections = [...response.sections].sort((a, b) => a.order - b.order);

  return (
    <Layout>
      <section className="sec-ask sec-padding-sm">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-12 mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(question);
                }}
              >
                <label className="form-label fs-8" htmlFor="ask-input">
                  Ask what you actually came to find out
                </label>
                <div className="d-flex gap-2">
                  <input
                    id="ask-input"
                    className="form-control"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Has she led teams at scale?"
                    autoComplete="off"
                  />
                  <button type="submit" className="btn btn-dark hover-up">
                    Ask
                  </button>
                </div>
              </form>

              <div className="d-flex flex-wrap gap-2 mt-3">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="badge bg-1 fs-8 border-0"
                    onClick={() => ask(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {asked && (
                <div
                  className="d-flex flex-wrap align-items-center gap-2 mt-3"
                  role="status"
                >
                  <span className="fs-8 m-0">
                    Composed for: {response.intent_tag ?? "default"}
                    {response.confidence === "low" && " (no close match)"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={reset}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {orderedSections.map((spec, idx) => (
        <SectionRouter key={`${spec.kind}-${spec.order}-${idx}`} spec={spec} />
      ))}
    </Layout>
  );
}
