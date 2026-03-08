import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { advisors, testQuestions, testRuns, promptVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { seed } from "@/lib/db/seed";

seed();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const advisor = db.select().from(advisors).where(eq(advisors.id, id)).get();
  if (!advisor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const questions = db
    .select()
    .from(testQuestions)
    .where(eq(testQuestions.advisorId, id))
    .all();

  const runs = db
    .select()
    .from(testRuns)
    .where(eq(testRuns.advisorId, id))
    .orderBy(desc(testRuns.runAt))
    .all();

  const versions = db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.advisorId, id))
    .orderBy(desc(promptVersions.createdAt))
    .all();

  return NextResponse.json({ advisor, questions, runs, versions });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const now = new Date();

  const updates: Record<string, unknown> = { updatedAt: now };

  if (body.name) updates.name = body.name;
  if (body.title) updates.title = body.title;
  if (body.bio) updates.bio = body.bio;
  if (body.knowledgeBase) updates.knowledgeBase = body.knowledgeBase;
  if (body.systemPrompt) {
    updates.systemPrompt = body.systemPrompt;
    // Save version
    db.insert(promptVersions).values({
      id: uuid(),
      advisorId: id,
      content: body.systemPrompt,
      createdAt: now,
      note: body.versionNote || "Updated",
    }).run();
  }

  db.update(advisors)
    .set(updates)
    .where(eq(advisors.id, id))
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.delete(testQuestions).where(eq(testQuestions.advisorId, id)).run();
  db.delete(testRuns).where(eq(testRuns.advisorId, id)).run();
  db.delete(promptVersions).where(eq(promptVersions.advisorId, id)).run();
  db.delete(advisors).where(eq(advisors.id, id)).run();
  return NextResponse.json({ ok: true });
}
