import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { streamChat } from "@/lib/ai";
import { seed } from "@/lib/db/seed";

seed();

export async function POST(req: NextRequest) {
  const { advisorId, messages, message } = await req.json();

  const advisor = db.select().from(advisors).where(eq(advisors.id, advisorId)).get();
  if (!advisor) {
    return new Response("Advisor not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(advisor.systemPrompt, messages || [], message)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
