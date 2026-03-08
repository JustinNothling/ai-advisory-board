import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { advisors, testQuestions, testRuns, testResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { generateAdvisorResponse, evaluateResponse } from "@/lib/ai";
import { seed } from "@/lib/db/seed";

seed();

export async function POST(req: NextRequest) {
  const { advisorId } = await req.json();

  const advisor = db.select().from(advisors).where(eq(advisors.id, advisorId)).get();
  if (!advisor) {
    return new Response(JSON.stringify({ error: "Advisor not found" }), { status: 404 });
  }

  const questions = db
    .select()
    .from(testQuestions)
    .where(eq(testQuestions.advisorId, advisorId))
    .all();

  if (questions.length === 0) {
    return new Response(JSON.stringify({ error: "No test questions configured" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const results: {
        questionId: string;
        question: string;
        expectedAnswer: string;
        advisorResponse: string;
        score: number;
        rationale: string;
        dimension: string;
      }[] = [];

      const dimensions = [
        "Expected Action",
        "Linguistic Fidelity",
        "Knowledge Accuracy",
        "Boundary Awareness",
        "Consistency",
      ];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "progress",
              progress: ((i + 1) / questions.length) * 100,
              question: q.question.substring(0, 60) + "...",
            }) + "\n"
          )
        );

        try {
          // Get advisor response
          const response = await generateAdvisorResponse(advisor.systemPrompt, q.question);

          // Determine dimension based on question type
          const dimension = q.isHoldout
            ? dimensions[Math.min(i % dimensions.length, dimensions.length - 1)]
            : dimensions[Math.min(i % dimensions.length, dimensions.length - 1)];

          // Evaluate response
          const evaluation = await evaluateResponse(
            advisor.name,
            q.question,
            q.expectedAnswer,
            response,
            dimension
          );

          results.push({
            questionId: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            advisorResponse: response,
            score: evaluation.score,
            rationale: evaluation.rationale,
            dimension,
          });
        } catch (error) {
          results.push({
            questionId: q.id,
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            advisorResponse: "Error generating response",
            score: 1,
            rationale: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
            dimension: "Expected Action",
          });
        }
      }

      // Calculate dimension scores
      const dimScores: Record<string, number[]> = {};
      for (const r of results) {
        if (!dimScores[r.dimension]) dimScores[r.dimension] = [];
        dimScores[r.dimension].push(r.score);
      }

      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

      const expectedActionScore = avg(dimScores["Expected Action"] || [3]);
      const linguisticScore = avg(dimScores["Linguistic Fidelity"] || [3]);
      const knowledgeScore = avg(dimScores["Knowledge Accuracy"] || [3]);
      const boundaryScore = avg(dimScores["Boundary Awareness"] || [3]);
      const consistencyScore = avg(dimScores["Consistency"] || [3]);

      // Weighted overall score
      const overallScore =
        expectedActionScore * 0.3 +
        linguisticScore * 0.2 +
        knowledgeScore * 0.2 +
        boundaryScore * 0.15 +
        consistencyScore * 0.15;

      // Save to database
      const runId = uuid();
      db.insert(testRuns).values({
        id: runId,
        advisorId,
        runAt: new Date(),
        overallScore,
        expectedActionScore,
        linguisticScore,
        knowledgeScore,
        boundaryScore,
        consistencyScore,
      }).run();

      for (const r of results) {
        db.insert(testResults).values({
          id: uuid(),
          testRunId: runId,
          questionId: r.questionId,
          advisorResponse: r.advisorResponse,
          score: r.score,
          rationale: r.rationale,
          dimension: r.dimension,
        }).run();
      }

      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            type: "complete",
            result: {
              overallScore,
              expectedActionScore,
              linguisticScore,
              knowledgeScore,
              boundaryScore,
              consistencyScore,
              results,
            },
          }) + "\n"
        )
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
