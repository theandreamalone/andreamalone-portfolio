PARKED — orchestrator gap content (needs structure decision first)

WHY-AI (problem): I used AI to interpret the visitor's question, not to
invent the answer. Filters work only when visitors can translate their
question into the portfolio's taxonomy; real visitors ask things like "has
she designed accountable AI workflows?" A router maps natural-language
intent to verified, pre-authored evidence. Open generation was deliberately
excluded: dynamically generated portfolio claims create hallucination and
consistency risk during a hiring decision.

ROADMAP (sequencing): I sequenced the product around its highest-risk
assumption: whether natural-language intent could reliably retrieve the
right evidence. Built first: pre-authored verified content, MDX as source
of truth, intent classification and retrieval, Supabase as a derived
metadata index, static fallback, React rendering of selected content.
Deferred: open-ended generation, deep behavioral personalization, richer
orchestration — they added complexity and trust risk without proving the
core value.

MEASUREMENT (outcomes): I would measure whether the system shortens the
path from a visitor's question to credible evidence: routing success rate,
fallback rate, engagement with surfaced proof, time to role-relevant
content, and the questions the content system still cannot answer.
