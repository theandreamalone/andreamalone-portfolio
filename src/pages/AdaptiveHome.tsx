import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import SectionRouter from "@/components/SectionRouter";
import { VoiceGlow, type VoiceMode } from "@/components/VoiceGlow";
import { VoiceUnavailable } from "@/components/VoiceUnavailable";
import { route, SUGGESTED_QUESTIONS } from "@/lib/hardcodedRouter";
import { STATIC_BASELINE } from "@/lib/staticBaseline";
import { useMicLevel } from "@/lib/voice/useMicLevel";
import { useSpeechOutput } from "@/lib/voice/useSpeechOutput";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
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
 * Voice layer: mic input feeds the same ask() path as typing; the glow is
 * audio-reactive on the mic and cadence-driven during TTS. Spoken output is
 * authored UI copy (SPOKEN_CONFIRMATIONS) — never generated. Voice is a
 * render/input mode; the claims boundary is unchanged.
 */

/** Authored spoken copy per intent — review like any UI string. */
const SPOKEN_CONFIRMATIONS: Record<string, string> = {
  default: "Here's an overview of Andrea's work.",
  // Add one line per intent_tag your router emits, e.g.:
  // leadership: "Here's the evidence on team leadership.",
  // ai_agentic_work: "Here's Andrea's AI product work.",
};

/**
 * Endpointing pause between a final voice transcript and auto-submit.
 * Standard speech-UI debounce window so a mid-thought breath doesn't
 * submit half a question. Purely a timing buffer — recognition itself
 * has already ended by the time this fires (continuous: false).
 */
const VOICE_SUBMIT_DEBOUNCE_MS = 900;

export default function AdaptiveHome() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<RouterResponse>(STATIC_BASELINE);
  const [asked, setAsked] = useState<string | null>(null);

  const mic = useMicLevel();
  const tts = useSpeechOutput();
  const voiceSubmitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** The one submit path — form, chips, and voice all funnel through this. */
  function ask(q: string): RouterResponse {
    setQuestion(q);
    setAsked(q.trim() || null);
    const res = route(q);
    setResponse(res);
    return res;
  }

  function stopVoice() {
    if (voiceSubmitTimer.current) {
      clearTimeout(voiceSubmitTimer.current);
      voiceSubmitTimer.current = null;
    }
    voice.stop();
    mic.stop();
  }

  const voice = useVoiceInput((finalText) => {
    // Show the transcript immediately; submission itself waits out the
    // debounce below, same as the form's own submit path — voice never
    // calls route()/setResponse() directly.
    setQuestion(finalText);
    if (voiceSubmitTimer.current) clearTimeout(voiceSubmitTimer.current);
    voiceSubmitTimer.current = setTimeout(() => {
      voiceSubmitTimer.current = null;
      stopVoice(); // recognition already ended; guarantees mic/level UI
                   // doesn't linger or re-trigger before the next mic press.
      const res = ask(finalText);
      const line =
        SPOKEN_CONFIRMATIONS[res.intent_tag ?? "default"] ??
        SPOKEN_CONFIRMATIONS.default;
      tts.speak(line);
    }, VOICE_SUBMIT_DEBOUNCE_MS);
  });

  useEffect(() => {
    return () => {
      if (voiceSubmitTimer.current) clearTimeout(voiceSubmitTimer.current);
    };
  }, []);

  function startVoice() {
    tts.cancel(); // interrupting the AI is always allowed
    voice.start();
    mic.start();
  }

  function reset() {
    tts.cancel();
    stopVoice();
    setQuestion("");
    setAsked(null);
    setResponse(STATIC_BASELINE);
  }

  const mode: VoiceMode = tts.speaking
    ? "ai-speaking"
    : voice.listening
      ? "user-speaking"
      : "idle";
  const level = tts.speaking ? tts.level : mic.level;

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
                <VoiceGlow mode={mode} level={level}>
                  <div className="d-flex gap-2">
                    <input
                      id="ask-input"
                      className="form-control"
                      type="text"
                      value={voice.interim || question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Has she led teams at scale?"
                      autoComplete="off"
                    />
                    {voice.supported ? (
                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={voice.listening ? stopVoice : startVoice}
                        aria-pressed={voice.listening}
                        aria-label={
                          voice.listening ? "Stop listening" : "Ask by voice"
                        }
                      >
                        {voice.listening ? "◼" : "🎤"}
                      </button>
                    ) : (
                      <VoiceUnavailable />
                    )}
                    <button type="submit" className="btn btn-dark hover-up">
                      Ask
                    </button>
                  </div>
                </VoiceGlow>
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
