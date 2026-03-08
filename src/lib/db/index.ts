import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "advisory-board.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS advisors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    avatar_url TEXT,
    knowledge_base TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS test_questions (
    id TEXT PRIMARY KEY,
    advisor_id TEXT NOT NULL REFERENCES advisors(id),
    question TEXT NOT NULL,
    expected_answer TEXT NOT NULL,
    domain TEXT NOT NULL,
    is_holdout INTEGER NOT NULL DEFAULT 0,
    source TEXT
  );

  CREATE TABLE IF NOT EXISTS test_runs (
    id TEXT PRIMARY KEY,
    advisor_id TEXT NOT NULL REFERENCES advisors(id),
    run_at INTEGER NOT NULL,
    overall_score REAL NOT NULL,
    expected_action_score REAL NOT NULL,
    linguistic_score REAL NOT NULL,
    knowledge_score REAL NOT NULL,
    boundary_score REAL NOT NULL,
    consistency_score REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_run_id TEXT NOT NULL REFERENCES test_runs(id),
    question_id TEXT NOT NULL REFERENCES test_questions(id),
    advisor_response TEXT NOT NULL,
    score REAL NOT NULL,
    rationale TEXT NOT NULL,
    dimension TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    advisor_id TEXT NOT NULL REFERENCES advisors(id),
    created_at INTEGER NOT NULL,
    title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    confidence TEXT CHECK(confidence IN ('high', 'medium', 'low')),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompt_versions (
    id TEXT PRIMARY KEY,
    advisor_id TEXT NOT NULL REFERENCES advisors(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    note TEXT
  );
`);
