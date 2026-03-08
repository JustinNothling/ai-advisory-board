import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testQuestions } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();

  db.insert(testQuestions).values({
    id: uuid(),
    advisorId: body.advisorId,
    question: body.question,
    expectedAnswer: body.expectedAnswer,
    domain: body.domain || "General",
    isHoldout: body.isHoldout || false,
    source: body.source || null,
  }).run();

  return NextResponse.json({ ok: true });
}
