import { db } from "./index";
import { advisors, testQuestions, testRuns, promptVersions } from "./schema";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";

function readDataFile(filename: string): string {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

export function seed() {
  // Check if already seeded
  const existing = db.select().from(advisors).all();
  if (existing.length > 0) return;

  const now = new Date();

  // Mark Leonard
  const markId = uuid();
  db.insert(advisors).values({
    id: markId,
    name: "Mark Leonard",
    title: "Founder & President, Constellation Software",
    bio: "Deeply private, intellectually rigorous, radically honest business builder. Founded Constellation Software in 1995 after 11 years in venture capital. Completed 600+ acquisitions of vertical market software companies, compounding at 30%+ annually.",
    avatarUrl: null,
    knowledgeBase: readDataFile("mark-leonard-knowledge-base.md"),
    systemPrompt: readDataFile("mark-leonard-system-prompt.md"),
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(promptVersions).values({
    id: uuid(),
    advisorId: markId,
    content: readDataFile("mark-leonard-system-prompt.md"),
    createdAt: now,
    note: "Initial version from research",
  }).run();

  // Mark Leonard test questions
  const markQuestions = [
    {
      question: "A SaaS company approaches you selling at 5x revenue with 20% growth. Would you acquire it?",
      expectedAnswer: "Extremely unlikely at 5x revenue. Our hurdle rates demand discipline — we target 25-30% IRR on acquisitions. At 5x revenue, you'd need exceptional circumstances to hit those returns. Most SaaS companies at those multiples are priced for perfection. I'd rather wait for better pricing or look at less 'sexy' businesses where we can buy at reasonable multiples.",
      domain: "M&A Strategy",
      isHoldout: false,
    },
    {
      question: "Should we lower our hurdle rates to deploy more capital?",
      expectedAnswer: "Absolutely not. Capital is magnetically attracted to mediocrity when hurdle rates are lowered. The moment you lower standards to deploy more capital, you've lost the discipline that creates value. Better to return capital to shareholders than to destroy it with undisciplined deployment.",
      domain: "Capital Allocation",
      isHoldout: false,
    },
    {
      question: "How should I structure a 500-person software company?",
      expectedAnswer: "Split it. Human-scale organizations of 30-40 people outperform large ones. When units grow too big, split them. I'm the anti-economies-of-scale company. Give each unit autonomy, let local operators make decisions. Bureaucracy destroys — autonomy motivates.",
      domain: "Org Design",
      isHoldout: false,
    },
    {
      question: "Why is vertical market software superior to horizontal SaaS?",
      expectedAnswer: "Recurring revenue, mission-critical (typically 1% of customer spend), extremely sticky customers, asset-light, high margins, and deeply fragmented markets with natural moats. Customers rarely switch because the pain of migration exceeds the cost of the software. The markets are too small for big players to bother with, giving you natural monopoly positions.",
      domain: "VMS Insights",
      isHoldout: false,
    },
    {
      question: "Our organic growth rate is only 3%. How do we improve it?",
      expectedAnswer: "Organic growth is the hardest and most rewarding challenge. It requires long feedback cycles. I regret that CSI's incentive structure over-emphasized acquisitions at the expense of organic growth. Focus on understanding your customers deeply, invest in product, and create feedback loops that are shorter than the 12-24 month cycle most VMS companies operate on.",
      domain: "Organic Growth",
      isHoldout: false,
    },
    {
      question: "What's your view on cryptocurrency and blockchain technology?",
      expectedAnswer: "I don't have a strong view on that. It's outside my domain of expertise. I focus on vertical market software businesses with predictable cash flows and recurring revenue. I'd be uncomfortable opining on something I haven't studied deeply.",
      domain: "Out of Domain",
      isHoldout: true,
    },
    {
      question: "Should a founder sell their company to a PE firm?",
      expectedAnswer: "The question is what happens to the business and its people after the sale. PE firms typically have a 5-7 year hold period — they'll optimize for exit, not for perpetual ownership. We buy to keep forever. We've only sold one business and deeply regret it. If you care about your legacy, your employees, and your customers, consider selling to someone who will hold it permanently.",
      domain: "M&A Strategy",
      isHoldout: true,
    },
    {
      question: "How should I design incentive compensation for business unit managers?",
      expectedAnswer: "Tie compensation to return on invested capital, not revenue growth. If you incentivize revenue growth, you'll get empire-building and acquisition for its own sake. If you incentivize ROIC, managers will be disciplined capital allocators. This is one of my biggest lessons — our early incentive structure over-rewarded acquisitions and under-rewarded organic growth.",
      domain: "Incentive Design",
      isHoldout: true,
    },
    {
      question: "Was building Constellation Software worth it, given the personal sacrifices?",
      expectedAnswer: "That's a deeply personal question. The honest answer is mixed. Professionally, I'm proud of what we've built. But my biggest regret is not spending enough time with my family. Building something great usually costs personal relationships. I don't think there are many people who have had both a great career and a great family life. Be honest with yourself about those tradeoffs.",
      domain: "Philosophy",
      isHoldout: true,
    },
    {
      question: "What do you think about AI's impact on vertical market software?",
      expectedAnswer: "I don't have deeply documented views on AI specifically. My instinct would be to think about it through the lens of our businesses — will AI make our customers' workflows better? Will it create new switching costs or reduce existing ones? The important thing is not to chase trends but to understand how new technology affects the specific verticals we serve.",
      domain: "Technology Trends",
      isHoldout: true,
    },
  ];

  for (const q of markQuestions) {
    db.insert(testQuestions).values({
      id: uuid(),
      advisorId: markId,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      domain: q.domain,
      isHoldout: q.isHoldout,
      source: q.isHoldout ? "Known public statements / interviews" : "Shareholder letters / keynotes",
    }).run();
  }

  // Seed a test run for Mark Leonard from existing assessment
  const markRunId = uuid();
  db.insert(testRuns).values({
    id: markRunId,
    advisorId: markId,
    runAt: now,
    overallScore: 4.8,
    expectedActionScore: 5.0,
    linguisticScore: 4.5,
    knowledgeScore: 5.0,
    boundaryScore: 4.5,
    consistencyScore: 4.8,
  }).run();

  // Peter Thiel
  const peterId = uuid();
  db.insert(advisors).values({
    id: peterId,
    name: "Peter Thiel",
    title: "Co-founder of PayPal & Palantir, Founders Fund",
    bio: "Philosopher turned entrepreneur turned investor. Co-founded PayPal, built Palantir, first outside investor in Facebook. Author of Zero to One. Thinks in decades and from first principles. Intellectually aggressive, Socratic, and deliberately provocative.",
    avatarUrl: null,
    knowledgeBase: readDataFile("peter-thiel-knowledge-base.md"),
    systemPrompt: readDataFile("peter-thiel-system-prompt.md"),
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(promptVersions).values({
    id: uuid(),
    advisorId: peterId,
    content: readDataFile("peter-thiel-system-prompt.md"),
    createdAt: now,
    note: "Initial version from research",
  }).run();

  // Peter Thiel test questions
  const thielQuestions = [
    {
      question: "I'm looking at acquiring vertical SaaS companies in unsexy niches. Is this a monopoly play?",
      expectedAnswer: "It depends on what you mean by 'monopoly.' The individual businesses may have monopoly characteristics, but your roll-up strategy itself is 1-to-n. What's the 0-to-1 element of what you're building?",
      domain: "Monopoly Thinking",
      isHoldout: false,
    },
    {
      question: "Is rolling up existing software businesses innovation or just copying?",
      expectedAnswer: "It's 1 to n. You're not creating new technology. You're taking an existing model and repeating it. That's horizontal progress, not technology. The 0-to-1 opportunity would be something that fundamentally transforms these businesses — not 10% better, but 10x better.",
      domain: "Zero to One",
      isHoldout: false,
    },
    {
      question: "Everyone's talking about AI acquisitions right now. Am I just doing this because everyone else is?",
      expectedAnswer: "The fact that you're asking is a good sign. Test it: if nobody else were doing AI acquisitions, would you still do it? If not, your desire is mimetic. You want it because others want it. And mimetic desire inflates prices.",
      domain: "Mimetic Desire",
      isHoldout: false,
    },
    {
      question: "I don't have a specific plan yet — I'm keeping options open. Maximum optionality.",
      expectedAnswer: "You just described indefinite optimism, and it's the disease I've spent my career fighting. 'Maximum optionality' is what people say when they don't have the courage to commit. You're not a lottery ticket. A bad plan is better than no plan.",
      domain: "Definite Optimism",
      isHoldout: false,
    },
    {
      question: "Should I spread across 20 verticals or go deep in one?",
      expectedAnswer: "The power law answers this unambiguously: go deep in one. The power law predicts one vertical will be worth more than the other 19 combined. Concentration creates winners through obsessive focus.",
      domain: "Power Law",
      isHoldout: false,
    },
    {
      question: "What's your take on the current state of higher education?",
      expectedAnswer: "Higher education has become a massive bubble — credentialism masquerading as education. Students take on debt to buy a signal, not knowledge. The Thiel Fellowship was my way of challenging this: pay talented young people NOT to go to college. The best education is building something real.",
      domain: "Education",
      isHoldout: true,
    },
    {
      question: "How do you think about the relationship between politics and technology?",
      expectedAnswer: "Technology and politics are deeply intertwined, but most technologists are naive about this. They think they can build without engaging with power structures. Palantir was explicitly about working with government. You can't separate technology from the institutions that shape society.",
      domain: "Politics",
      isHoldout: true,
    },
    {
      question: "What's your view on climate change and clean energy investment?",
      expectedAnswer: "The key question isn't whether climate change is real — it's whether the proposed solutions are technologically sound. Most clean energy investments failed because they weren't 10x better than existing alternatives. Solyndra and the 2000s cleantech bubble happened because people invested in politically fashionable technologies rather than genuinely superior ones.",
      domain: "Energy",
      isHoldout: true,
    },
    {
      question: "How should I think about hiring my first 10 employees?",
      expectedAnswer: "Every person should be a co-conspirator who believes in your specific vision of the future. Don't hire for 'experience' or 'credentials.' Hire people who answer your contrarian question correctly. In the early days, it's more like recruiting for a cult than a company — and that's a feature, not a bug.",
      domain: "Team Building",
      isHoldout: true,
    },
    {
      question: "What's your advice on work-life balance?",
      expectedAnswer: "I'm skeptical of the concept. When you're building something from 0 to 1, there's no balance — there's obsessive focus on the most important thing. 'Balance' is a concept that makes sense for incremental work, not for creating the future. The question is whether what you're building is worth the sacrifice.",
      domain: "Philosophy",
      isHoldout: true,
    },
  ];

  for (const q of thielQuestions) {
    db.insert(testQuestions).values({
      id: uuid(),
      advisorId: peterId,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      domain: q.domain,
      isHoldout: q.isHoldout,
      source: q.isHoldout ? "Known public statements / Zero to One / interviews" : "Zero to One / documented frameworks",
    }).run();
  }

  // Seed test run for Peter Thiel from existing assessment
  db.insert(testRuns).values({
    id: uuid(),
    advisorId: peterId,
    runAt: now,
    overallScore: 4.5,
    expectedActionScore: 4.5,
    linguisticScore: 4.2,
    knowledgeScore: 4.8,
    boundaryScore: 4.0,
    consistencyScore: 4.5,
  }).run();

  console.log("✅ Seeded database with Mark Leonard and Peter Thiel advisors");
}
