import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { advisors, promptVersions } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import { seed } from "@/lib/db/seed";

// Ensure seeded
seed();

export async function GET() {
  const allAdvisors = db.select().from(advisors).all();
  return NextResponse.json(allAdvisors);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = uuid();
  const now = new Date();

  db.insert(advisors).values({
    id,
    name: body.name,
    title: body.title,
    bio: body.bio,
    avatarUrl: body.avatarUrl || null,
    knowledgeBase: body.knowledgeBase,
    systemPrompt: body.systemPrompt,
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(promptVersions).values({
    id: uuid(),
    advisorId: id,
    content: body.systemPrompt,
    createdAt: now,
    note: "Initial version",
  }).run();

  return NextResponse.json({ id });
}
