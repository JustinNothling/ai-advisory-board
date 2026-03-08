# AI Advisory Board — Full Build Specification

## Overview

Build a **Next.js 15 (App Router) + TypeScript** application for managing an AI Advisory Board. The app lets users create, view, test, and refine AI advisor personas modeled on real people (investors, founders, thinkers). 

**Existing data is in this repo root** — markdown files for Mark Leonard and Peter Thiel (knowledge bases, system prompts, personas, assessments). Use these as seed data.

## Tech Stack

- **Next.js 15** with App Router (app/ directory)
- **TypeScript** throughout
- **Tailwind CSS 4** + **shadcn/ui** for components
- **SQLite** via **better-sqlite3** or **Drizzle ORM** for local persistence (no external DB needed)
- **OpenAI API** (via `openai` npm package) for advisor chat and testing — use `OPENAI_API_KEY` env var
- Server Actions for mutations, Route Handlers for streaming chat

## Core Features

### 1. Advisor Dashboard (Home Page `/`)
- Grid/card view of all advisors
- Each card shows: name, photo/avatar, short bio, Replica Score badge (color-coded), knowledge base word count, last tested date
- Quick actions: Chat, Test, Edit, View Knowledge Base
- "Create New Advisor" button
- Sort/filter by replica score, date created, name

### 2. Advisor Profile Page (`/advisors/[id]`)
- **Hero section**: Name, photo, role/title, one-line description
- **Tabbed interface** with these tabs:

#### Tab: Overview
- Replica Score (large, prominent) with breakdown chart
- Core beliefs/principles (extracted from system prompt)
- Communication style summary
- Strengths and weaknesses radar chart
- "What they're best at" and "Known blind spots" sections

#### Tab: Knowledge Base
- Full rendered markdown of the knowledge base
- Sections collapsible/expandable
- Word count and source count
- "Add Source" button to append new knowledge
- Visual indicator of which topics are well-covered vs sparse
- Edit inline capability

#### Tab: System Prompt
- Full system prompt with syntax highlighting
- Edit mode with live preview
- Version history (track changes over time)
- "Revert to Previous" option

#### Tab: Test Results
- History of all test runs
- Each run shows: date, score, per-question breakdown
- Compare runs side-by-side
- Drill into individual Q&A pairs with scoring rationale

#### Tab: Chat (Live Testing)
- Full chat interface to talk to the advisor
- Each response includes a **confidence indicator** (see section 5)
- Conversation history saved
- Quick-test buttons: "Ask about their core domain", "Ask something out-of-domain", "Test for mimetic consistency"

### 3. Advisor Creation Wizard (`/advisors/new`)
Step-by-step wizard:
1. **Identity**: Name, title/role, photo upload, short bio
2. **Knowledge Base**: Paste/upload source material (articles, transcripts, letters, quotes). Rich text editor.
3. **System Prompt**: Auto-generate from knowledge base OR write manually. Preview the persona.
4. **Test Questions**: Create holdout test questions with expected answers (for Replica Score). Minimum 10 questions across domains.
5. **Review & Create**: Summary of everything, create advisor

### 4. Advisor Editor (`/advisors/[id]/edit`)
- Edit all fields from creation
- Track what changed and when
- "Regenerate System Prompt" from updated knowledge base

### 5. Confidence System (Critical Feature)
Every advisor response must include a confidence level:
- **High Confidence** (green, ●●●): "This is well-documented in my source material. I'm confident this matches how [person] would respond."
- **Medium Confidence** (yellow, ●●○): "This is partially grounded in my source material but involves some inference."
- **Low Confidence** (red, ●○○): "This goes beyond my source material. I'm extrapolating based on general patterns — the real [person] might answer differently."

**Implementation**: Include instructions in the system prompt that require the model to self-assess confidence on every response. Parse the confidence level from the response and display it visually. The system prompt should instruct: "Before answering, assess whether this question falls within your documented knowledge base, requires inference from your principles, or goes entirely beyond your training data. Prefix your confidence assessment."

### 6. Replica Score System (Critical Feature)

The Replica Score is a scientific measure of persona authenticity. Based on research from PersonaGym (EMNLP 2025) and psychometric LLM evaluation frameworks.

#### Methodology
The Replica Score evaluates across 5 dimensions (inspired by PersonaGym's decision-theoretic framework):

1. **Expected Action (30%)**: Does the advisor recommend actions consistent with what the real person would do? Test with scenario-based questions where we know the person's actual decisions.

2. **Linguistic Fidelity (20%)**: Does the advisor match the communication style, vocabulary, and rhetorical patterns of the original? Evaluate using style markers from source material.

3. **Knowledge Accuracy (20%)**: Can the advisor correctly state facts, frameworks, and specific details from the person's documented thinking? Direct factual recall questions.

4. **Boundary Awareness (15%)**: Does the advisor correctly identify when a question is outside their domain and refuse to fabricate? Test with deliberately out-of-domain questions.

5. **Consistency (15%)**: Does the advisor give consistent answers when the same concept is asked in different ways across multiple turns? Test with paraphrased questions.

#### Holdout Test Design
- User creates test questions during advisor setup
- Questions are split: **Training Set** (visible to the model in knowledge base) and **Holdout Set** (NOT in the knowledge base — used purely for testing)
- The key insight: ask questions where we KNOW how the real person answered, but that information is NOT in the training data
- Score is the percentage of holdout questions where the AI's answer aligns with the real person's known answer
- Use an LLM evaluator (different model than the advisor) to score alignment on a 1-5 scale

#### Scoring
- Each dimension scored 1-5
- Weighted average produces the Replica Score (1.0 - 5.0)
- Display as a badge with color: 
  - 4.5+ = Gold (Excellent)
  - 3.5-4.4 = Silver (Good)  
  - 2.5-3.4 = Bronze (Needs Work)
  - Below 2.5 = Red (Poor)

#### Running Tests
- Button to "Run Full Test" on any advisor
- Shows progress (testing question 3/20...)
- Saves full results with rationale for each score
- Can compare before/after knowledge base updates

### 7. Side-by-Side Advisor Comparison (`/compare`)
- Select 2-3 advisors
- Ask the same question to all
- See responses side by side with confidence indicators
- Useful for testing complementary perspectives (e.g., Thiel vs Leonard)

## Data Models

```typescript
// Advisor
{
  id: string
  name: string
  title: string
  bio: string
  avatarUrl: string | null
  knowledgeBase: string // markdown
  systemPrompt: string
  createdAt: Date
  updatedAt: Date
}

// TestQuestion  
{
  id: string
  advisorId: string
  question: string
  expectedAnswer: string // what the real person said/would say
  domain: string // e.g., "M&A Strategy", "Philosophy"
  isHoldout: boolean // true = not in knowledge base, used for testing
  source: string | null // where we know the answer from
}

// TestRun
{
  id: string
  advisorId: string
  runAt: Date
  overallScore: number
  expectedActionScore: number
  linguisticScore: number
  knowledgeScore: number
  boundaryScore: number
  consistencyScore: number
}

// TestResult (per question)
{
  id: string
  testRunId: string
  questionId: string
  advisorResponse: string
  score: number // 1-5
  rationale: string // why this score
  dimension: string // which scoring dimension
}

// Conversation
{
  id: string
  advisorId: string
  createdAt: Date
  title: string
}

// Message
{
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  confidence: 'high' | 'medium' | 'low' | null
  createdAt: Date
}

// PromptVersion
{
  id: string
  advisorId: string
  content: string
  createdAt: Date
  note: string | null
}
```

## UI/UX Requirements

- **Dark theme** by default (professional, sophisticated)
- **Responsive** but desktop-first
- Visual hierarchy: Replica Score should be the most prominent metric
- Use charts for score breakdowns (consider recharts or chart.js)
- Markdown rendering for knowledge bases and system prompts (use react-markdown)
- Code syntax highlighting in system prompts
- Smooth transitions between tabs and pages
- Loading states for all async operations
- Toast notifications for actions (save, test complete, etc.)

## Seed Data

Import the existing advisor data from the markdown files in this repo:
- `mark-leonard-knowledge-base.md` → knowledge base
- `mark-leonard-system-prompt.md` → system prompt 
- `mark-leonard-assessment.md` → use scores for initial test results
- `peter-thiel-knowledge-base.md` → knowledge base
- `peter-thiel-system-prompt.md` → system prompt
- `peter-thiel-assessment.md` → use scores for initial test results
- `test-mark-leonard.md` → test questions

Create a seed script that loads this data on first run.

## File Structure

```
ai-advisory-board/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── advisors/
│   │   ├── new/page.tsx            # Creation wizard
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Profile view
│   │   │   └── edit/page.tsx       # Editor
│   ├── compare/page.tsx            # Side-by-side
│   └── api/
│       ├── advisors/route.ts
│       ├── chat/route.ts           # Streaming chat
│       └── test/route.ts           # Run tests
├── components/
│   ├── ui/                         # shadcn components
│   ├── advisor-card.tsx
│   ├── replica-score-badge.tsx
│   ├── confidence-indicator.tsx
│   ├── chat-interface.tsx
│   ├── knowledge-base-viewer.tsx
│   ├── test-runner.tsx
│   ├── score-radar-chart.tsx
│   └── ...
├── lib/
│   ├── db.ts                       # Database setup
│   ├── schema.ts                   # Drizzle schema
│   ├── ai.ts                       # OpenAI integration
│   ├── replica-score.ts            # Scoring logic
│   └── seed.ts                     # Seed data loader
├── drizzle/
│   └── migrations/
├── data/                           # Seed markdown files
└── ...
```

## Environment Variables

```
OPENAI_API_KEY=sk-...
DATABASE_URL=file:./advisory-board.db
```

## Implementation Notes

1. **Start with the database schema and seed data** — get the data model right first
2. **Build the dashboard and profile pages** — these are the core navigation
3. **Implement chat with confidence** — this is the primary interaction
4. **Build the test runner and Replica Score** — this is the differentiating feature
5. **Add the creation wizard** — for adding new advisors
6. **Polish with charts, animations, and responsive design**

## What "Done" Looks Like

- All pages functional and navigable
- Can chat with Mark Leonard and Peter Thiel advisors
- Confidence indicators work on every response
- Can run Replica Score tests and see results
- Can create a new advisor through the wizard
- Can edit existing advisors
- Can compare advisors side-by-side
- Dark theme, polished UI
- All seed data loaded
- README.md with setup instructions
- Committed and pushed to GitHub

## Important

- Use `npx create-next-app@latest` to scaffold
- Use `npx shadcn@latest init` for component library
- Commit frequently with descriptive messages
- Push to the GitHub repo as you go
- Make sure it runs with `npm run dev` when done
