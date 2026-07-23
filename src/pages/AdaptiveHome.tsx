import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SectionRouter from "@/components/SectionRouter";
import type { VoiceMode } from "@/components/VoiceGlow";
import QuestionHero from "@/components/sections/home/QuestionHero";
import ResponseComposition from "@/components/sections/home/ResponseComposition";
import ReasoningPanel, { HilBanner } from "@/components/sections/home/ReasoningPanel";
import FeedbackWidget from "@/components/sections/home/FeedbackWidget";
import { route, SUGGESTED_QUESTIONS } from "@/lib/hardcodedRouter";
import { STATIC_BASELINE } from "@/lib/staticBaseline";
import { logEvent } from "@/lib/events";
import { INTENT_LABELS } from "@/lib/intentFrames";
import { useMicLevel } from "@/lib/voice/useMicLevel";
import { useSpeechOutput } from "@/lib/voice/useSpeechOutput";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import type { RouterResponse } from "@/lib/viewContract";

/**
 * AdaptiveHome — the site's primary home (`/`). Question-driven composition.
 *
 * The page becomes the answer to the visitor's question, composed from
 * pre-authored evidence. Free text is the product; the chips are training
 * wheels (D3).
 *
 * Cold load (phase === "idle") renders STATIC_BASELINE sections directly —
 * the same content /fallback serves. On Ask, a 4-phase timeline collapses the
 * hero, reveals the answer, then cascades the new section composition in.
 * Nothing on this page depends on the router itself succeeding; an error
 * boundary in router.tsx redirects to /fallback on runtime failure.
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

type AskPhase = "idle" | "collapsing" | "revealing-header" | "revealing-answer" | "revealing-sections";

export default function AdaptiveHome() {
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<RouterResponse>(STATIC_BASELINE);
  const [asked, setAsked] = useState<string | null>(null);
  const [phase, setPhase] = useState<AskPhase>("idle");
  const [eventId, setEventId] = useState<string | null>(null);

  const mic = useMicLevel();
  const tts = useSpeechOutput();
  const voiceSubmitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks the three phase-transition setTimeouts scheduled by ask() so a
  // second Ask fired mid-sequence can cancel the first cleanly. Without this,
  // stale timers fire late and stomp newer phase transitions out of order.
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearPhaseTimers() {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
  }

  /** The one submit path — form, chips, and voice all funnel through this. */
  function ask(q: string): RouterResponse {
    clearPhaseTimers(); // guard against back-to-back asks stomping the sequence
    setQuestion(q);
    const trimmed = q.trim();
    setAsked(trimmed || null);
    const startedAt = performance.now();
    const res = route(q);
    setResponse(res);
    setPhase("collapsing");
    phaseTimers.current.push(
      setTimeout(() => setPhase("revealing-header"), 350),
      setTimeout(() => setPhase("revealing-answer"), 650),
      setTimeout(() => setPhase("revealing-sections"), 1200),
    );

    // An empty submit routes to STATIC_BASELINE, not a real routed answer —
    // don't log it as an event.
    if (trimmed) {
      setEventId(
        logEvent({ question: trimmed, response: res, latencyMs: Math.round(performance.now() - startedAt) })
      );
    }
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
      clearPhaseTimers();
    };
  }, []);

  // Honor a `?q=` handed off from QuestionHero on the home page — arriving
  // here should compose the answer immediately, not drop the question.
  useEffect(() => {
    const initial = searchParams.get("q");
    if (initial && initial.trim()) ask(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startVoice() {
    tts.cancel(); // interrupting the AI is always allowed
    voice.start();
    mic.start();
  }

  function reset() {
    clearPhaseTimers();
    tts.cancel();
    stopVoice();
    setQuestion("");
    setAsked(null);
    setResponse(STATIC_BASELINE);
    setPhase("idle");
    setEventId(null);
  }

  const mode: VoiceMode = tts.speaking
    ? "ai-speaking"
    : voice.listening
      ? "user-speaking"
      : "idle";
  const level = tts.speaking ? tts.level : mic.level;

  // QuestionHero above already covers the Hero slot (same reasoning as Home.tsx) —
  // without this filter, SectionRouter's Hero case (SectionIntro) renders a second,
  // redundant "hero" block right under it.
  const orderedSections = [...response.sections]
    .filter((spec) => spec.kind !== "Hero")
    .sort((a, b) => a.order - b.order);

  return (
    <Layout>
      <QuestionHero
        value={question}
        onChange={setQuestion}
        onAsk={ask}
        chips={SUGGESTED_QUESTIONS}
        voiceControl={{
          supported: voice.supported,
          listening: voice.listening,
          glowActive: mode !== "idle",
          interim: voice.interim,
          level,
          onToggle: voice.listening ? stopVoice : startVoice,
        }}
        belowForm={
          asked && (
            <div className="qh-status" role="status">
              <span>Composed for: {response.intent_tag ?? "default"}</span>
              <button type="button" className="qh-status-reset" onClick={reset}>
                Reset
              </button>
            </div>
          )
        }
      />

      {asked && <ResponseComposition response={response} askedKey={asked} />}

      {asked && (
        <div className="container">
          <HilBanner hilTriggered={response.hil_triggered} />
          <ReasoningPanel
            intentLabel={INTENT_LABELS[response.intent_tag ?? "general_overview"] ?? response.intent_tag ?? ""}
            confidence={response.confidence}
            reasoning={response.reasoning}
            sectionCount={response.sections.length}
            hilTriggered={response.hil_triggered}
          />
          {eventId && <FeedbackWidget eventId={eventId} />}
        </div>
      )}

      {phase === "idle" && orderedSections.map((spec, idx) => (
        <SectionRouter key={`baseline-${spec.kind}-${spec.order}-${idx}`} spec={spec} />
      ))}

      <AnimatePresence mode="popLayout">
        {phase === "revealing-sections" && orderedSections.map((spec, idx) => (
          <motion.div
            key={`cascade-${spec.kind}-${spec.order}-${idx}`}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
          >
            <SectionRouter spec={spec} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Layout>
  );
}
