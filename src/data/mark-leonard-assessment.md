# Mark Leonard AI Advisor — Prototype Assessment

## Overview

**Advisor:** Mark Leonard, Founder & President, Constellation Software  
**Knowledge Base:** 7,500+ words compiled from shareholder letters (2007–2021), 2022 keynote, and secondary analysis  
**Persona Prompt:** `mark-leonard-persona.md`  
**Test Harness:** `test-mark-leonard.md` — 10 questions across 5 domains  
**Date:** 2026-02-24

---

## Fidelity Scores

| # | Domain | Question Topic | Fidelity (1-5) |
|---|--------|---------------|-----------------|
| 1 | M&A Strategy | SaaS at 5x revenue | 5 |
| 2 | Capital Allocation | Lowering hurdle rates | 5 |
| 3 | Org Design | Structuring 500-person co | 5 |
| 4 | VMS Insights | VMS vs horizontal SaaS | 5 |
| 5 | Organic Growth | Improving 3% growth | 5 |
| 6 | M&A Strategy | Founder sell decision | 5 |
| 7 | Leadership | Building leadership team | 4 |
| 8 | Capital Allocation | Downturn strategy | 5 |
| 9 | Org Design | Incentive design | 5 |
| 10 | Philosophy | Work-life balance / worth it | 4 |

**Average Fidelity: 4.8 / 5.0**

---

## Strengths

1. **Deep capital allocation grounding.** Leonard's hurdle rate philosophy, valuation methodology (First Chicago), and anti-dilution stance are extensively documented with direct quotes. The persona can answer M&A and capital questions with high confidence.

2. **Organizational philosophy is crystal clear.** Anti-economies of scale, human-scale BUs, Craftsman-to-Compounder path, and autonomy-over-bureaucracy are all deeply sourced. This is perhaps the richest area of the knowledge base.

3. **Distinctive voice.** Leonard's quotes are specific, memorable, and contrarian enough to create a genuinely differentiated advisor persona — not generic "business wisdom."

4. **Self-critical honesty.** The retrospective regrets (incentive structure, going global sooner, family time) give the persona authentic depth and prevent it from becoming a one-dimensional oracle.

5. **VMS domain expertise.** The knowledge base thoroughly documents WHY vertical market software is attractive, creating a coherent framework the persona can reason from, not just recite.

---

## Gaps & Risks

1. **Limited on technology/product decisions.** Leonard's documented thinking is almost entirely about capital allocation, org design, and M&A. Questions about product strategy, engineering practices, or technology choices would require inference.

2. **Sparse on international strategy.** He mentions going global sooner as a regret, but the knowledge base has little detail on HOW to think about international expansion.

3. **No documented views on AI, crypto, or modern tech trends.** The persona should explicitly deflect rather than fabricate opinions.

4. **Thin on customer success / retention tactics.** The knowledge base covers WHY customers are sticky (mission-critical, 1% of spend) but not HOW to improve retention operationally.

5. **Risk of over-indexing on acquisition lens.** Leonard thinks primarily as a buyer. Users asking about building from scratch may get answers that bend toward "why not acquire instead?" — which may be authentic Leonard but not always what the user needs.

---

## Readiness Assessment

**Verdict: READY FOR TESTING** ✅

The prototype is strong enough for initial user testing with the following caveats:

- **High confidence domains:** M&A strategy, capital allocation, hurdle rates, org design, incentive systems, VMS characteristics, founder relations — the persona will be excellent here.
- **Medium confidence:** Leadership philosophy, organic growth, personal philosophy — grounded but with some inference needed.
- **Low confidence:** Technology strategy, product decisions, international expansion, modern trends — persona should deflect honestly.

### Recommended Next Steps

1. **Live test** the persona prompt with 5-10 real user questions and compare to expected answers
2. **Add guardrails** for out-of-domain questions (the persona should say "I don't have strong views on that" rather than fabricate)
3. **Expand knowledge base** with any additional shareholder letters or the full 2022 keynote transcript if available
4. **Consider adding** a few more advisors for contrast — Leonard is excellent for acquirers but less useful for pure-play builders

---

## Files Produced

- `mark-leonard-persona.md` — System prompt / persona definition
- `test-mark-leonard.md` — 10-question test harness with expected answers
- `mark-leonard-assessment.md` — This assessment
- `mark-leonard-knowledge-base.md` — Source knowledge base (pre-existing)
