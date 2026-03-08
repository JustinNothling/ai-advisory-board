# AI Advisory Board

Visual interface for creating, testing, and managing AI persona advisors modeled on real people.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![SQLite](https://img.shields.io/badge/SQLite-Local-green)

## Features

- **Advisor Dashboard** — Grid view of all advisors with Replica Scores
- **Advisor Profiles** — Tabbed view with overview, knowledge base, system prompt, test results, and live chat
- **Replica Score System** — Scientific 5-dimension evaluation of persona authenticity:
  - Expected Action (30%) — matches known decisions
  - Linguistic Fidelity (20%) — communication style match
  - Knowledge Accuracy (20%) — factual recall
  - Boundary Awareness (15%) — knows what it doesn't know
  - Consistency (15%) — stable across phrasings
- **Holdout Testing** — Questions where the real answer is known but NOT in training data
- **Confidence Indicators** — Every response tagged as High/Medium/Low confidence
- **Creation Wizard** — Step-by-step advisor building
- **Side-by-Side Comparison** — Same question to multiple advisors
- **Version History** — Track system prompt changes over time

## Quick Start

```bash
# Install dependencies
npm install

# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."

# Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database auto-creates on first run and seeds with Mark Leonard and Peter Thiel advisors.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **SQLite** via better-sqlite3 (zero config, local DB)
- **OpenAI API** (gpt-4o for chat and evaluation)
- **Recharts** for score visualizations
- **React Markdown** for knowledge base rendering

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for chat and testing |

## Replica Score Methodology

Based on research from [PersonaGym](https://personagym.com/) (EMNLP 2025) and psychometric LLM evaluation frameworks.

The holdout test design is the key innovation:
1. Create test questions where the real person's answer is known
2. Split into **Training** (visible in knowledge base) and **Holdout** (not in knowledge base)
3. The AI advisor answers holdout questions purely from its persona understanding
4. An independent LLM evaluator scores alignment on a 1-5 scale
5. Weighted scores across 5 dimensions produce the Replica Score

## Seeded Advisors

- **Mark Leonard** — Founder & President, Constellation Software (4.8/5.0 fidelity)
- **Peter Thiel** — Co-founder PayPal & Palantir, Founders Fund (4.5/5.0 fidelity)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (chat, test, advisors)
│   ├── advisors/          # Advisor pages (profile, edit, new)
│   └── compare/           # Side-by-side comparison
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── advisor-card.tsx
│   ├── chat-interface.tsx
│   ├── confidence-indicator.tsx
│   ├── knowledge-base-viewer.tsx
│   ├── replica-score-badge.tsx
│   ├── score-radar-chart.tsx
│   └── test-runner.tsx
├── lib/
│   ├── db/               # Database (schema, seed, connection)
│   └── ai.ts             # OpenAI integration
└── data/                  # Seed data (markdown files)
```

## License

MIT
