import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const advisors = sqliteTable("advisors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  knowledgeBase: text("knowledge_base").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const testQuestions = sqliteTable("test_questions", {
  id: text("id").primaryKey(),
  advisorId: text("advisor_id").notNull().references(() => advisors.id),
  question: text("question").notNull(),
  expectedAnswer: text("expected_answer").notNull(),
  domain: text("domain").notNull(),
  isHoldout: integer("is_holdout", { mode: "boolean" }).notNull().default(false),
  source: text("source"),
});

export const testRuns = sqliteTable("test_runs", {
  id: text("id").primaryKey(),
  advisorId: text("advisor_id").notNull().references(() => advisors.id),
  runAt: integer("run_at", { mode: "timestamp" }).notNull(),
  overallScore: real("overall_score").notNull(),
  expectedActionScore: real("expected_action_score").notNull(),
  linguisticScore: real("linguistic_score").notNull(),
  knowledgeScore: real("knowledge_score").notNull(),
  boundaryScore: real("boundary_score").notNull(),
  consistencyScore: real("consistency_score").notNull(),
});

export const testResults = sqliteTable("test_results", {
  id: text("id").primaryKey(),
  testRunId: text("test_run_id").notNull().references(() => testRuns.id),
  questionId: text("question_id").notNull().references(() => testQuestions.id),
  advisorResponse: text("advisor_response").notNull(),
  score: real("score").notNull(),
  rationale: text("rationale").notNull(),
  dimension: text("dimension").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  advisorId: text("advisor_id").notNull().references(() => advisors.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  title: text("title").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const promptVersions = sqliteTable("prompt_versions", {
  id: text("id").primaryKey(),
  advisorId: text("advisor_id").notNull().references(() => advisors.id),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  note: text("note"),
});
