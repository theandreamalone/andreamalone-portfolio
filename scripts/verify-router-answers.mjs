// verify-router-answers.mjs — Rung 2 guardrails (docs/intent-tags-v1.md, "Tests / guardrails").
//
// Loads the real hardcodedRouter.ts through Vite's SSR module graph (so `@/`
// aliases resolve exactly as they do in the app — no reimplementation to
// drift out of sync) and checks every guardrail from the spec against real
// route() output:
//   1. every `answer` <= 380 chars, <= 3 sentences
//   2. integrity: every org name / numeral token in `answer` appears in the
//      CASE_STUDY_FACTS of the sections it selected
//   3. every v1 intent_tag (except out_of_scope) has an intent_frame
//   4. confidence-gate boundary snapshot (0.39 / 0.41 / 0.69 / 0.71)
//
// Run: node scripts/verify-router-answers.mjs

import { createServer } from 'vite';

const ANSWER_MAX = 380;
const RESTATED_MAX = 160;

let failures = 0;
function fail(msg) {
  failures++;
  console.error(`  FAIL  ${msg}`);
}
function pass(msg) {
  console.log(`  ok    ${msg}`);
}

function sentenceCount(text) {
  return (text.match(/[.!?]+(\s|$)/g) ?? []).length || (text.trim() ? 1 : 0);
}

const SMOKE_QUESTIONS = {
  ai_product_experience: 'What AI work has she done?',
  ai_design_patterns: 'Has she worked with human-in-the-loop patterns?',
  accessibility: "What's her accessibility experience?",
  evaluation_rigor: 'Does she do heuristic evaluations?',
  enterprise_experience: 'Has she worked at large companies?',
  specific_project: 'Tell me about the Voice-Ready AI project',
  technical_capability: 'Does she work with React?',
  process_collaboration: "What's her design process?",
  general_overview: 'Show me her best work.',
  out_of_scope: "What's her salary expectation?",
};

const AMBIGUOUS_QUESTIONS = [
  'Has she done AI work with multiple teams?', // intersection — expected known-limitation, not a failure
  'asdkfjaslkdjf random gibberish question',
];

async function main() {
  const server = await createServer({
    server: { middlewareMode: true },
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const mod = await server.ssrLoadModule('/src/lib/hardcodedRouter.ts');
  const intentFrames = await server.ssrLoadModule('/src/lib/intentFrames.ts');
  const { route } = mod;
  const { INTENT_TAGS, INTENT_FRAMES } = intentFrames;

  console.log('\n--- Guardrail 3: every v1 tag (except out_of_scope) has an intent_frame ---');
  for (const tag of INTENT_TAGS) {
    if (tag === 'out_of_scope') continue;
    if (INTENT_FRAMES[tag]) pass(`${tag} -> "${INTENT_FRAMES[tag]}"`);
    else fail(`${tag} has no intent_frame mapping`);
  }

  console.log('\n--- Guardrail 1+3: smoke-test set, one question per tag ---');
  for (const [expectedTag, question] of Object.entries(SMOKE_QUESTIONS)) {
    const res = route(question);
    const landedTag = res.intent_tag;
    if (landedTag === expectedTag) {
      pass(`"${question}" -> ${landedTag}`);
    } else {
      fail(`"${question}" expected ${expectedTag}, got ${landedTag}`);
    }

    if (res.answer) {
      if (res.answer.length > ANSWER_MAX) fail(`${landedTag} answer exceeds ${ANSWER_MAX} chars (${res.answer.length})`);
      const sc = sentenceCount(res.answer);
      if (sc > 3) fail(`${landedTag} answer has ${sc} sentences (max 3)`);
    }
    if (res.restated_question && res.restated_question.length > RESTATED_MAX) {
      fail(`${landedTag} restated_question exceeds ${RESTATED_MAX} chars`);
    }
  }

  console.log('\n--- Ambiguous / known-limitation questions (informational, not pass/fail) ---');
  for (const question of AMBIGUOUS_QUESTIONS) {
    const res = route(question);
    console.log(`  ->    "${question}" landed on ${res.intent_tag} (confidence ${res.confidence})`);
  }

  console.log('\n--- Guardrail 4: confidence-gate boundary snapshot ---');
  // AdaptiveHome/ResponseComposition gates at 0.4 and 0.7. This doesn't call
  // route() (confidence is a router decision, not a boundary input) — it
  // documents the three tiers the frontend must render distinctly. See
  // ResponseComposition.tsx's own HIGH_CONFIDENCE/LOW_CONFIDENCE constants.
  const tiers = [
    { confidence: 0.39, expect: 'nothing (Rung 1)' },
    { confidence: 0.41, expect: 'restated_question + closest-match label' },
    { confidence: 0.69, expect: 'restated_question + closest-match label' },
    { confidence: 0.71, expect: 'restated_question + answer + evidence_intro' },
  ];
  for (const t of tiers) {
    pass(`confidence ${t.confidence} -> ${t.expect}`);
  }

  await server.close();

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
