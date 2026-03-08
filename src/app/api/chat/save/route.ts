import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { advisorId, userMessage, assistantMessage, confidence } = await req.json();
  const now = new Date();

  // Get or create conversation
  let conversation = db
    .select()
    .from(conversations)
    .where(eq(conversations.advisorId, advisorId))
    .orderBy(desc(conversations.createdAt))
    .get();

  if (!conversation) {
    const convId = uuid();
    db.insert(conversations).values({
      id: convId,
      advisorId,
      createdAt: now,
      title: userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : ""),
    }).run();
    conversation = { id: convId, advisorId, createdAt: now, title: "" };
  }

  // Save user message
  db.insert(messages).values({
    id: uuid(),
    conversationId: conversation.id,
    role: "user",
    content: userMessage,
    confidence: null,
    createdAt: now,
  }).run();

  // Save assistant message
  db.insert(messages).values({
    id: uuid(),
    conversationId: conversation.id,
    role: "assistant",
    content: assistantMessage,
    confidence: confidence || null,
    createdAt: new Date(Date.now() + 1),
  }).run();

  return NextResponse.json({ ok: true });
}
