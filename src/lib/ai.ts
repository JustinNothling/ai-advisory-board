import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
});

export async function* streamChat(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  const confidenceInstruction = `

IMPORTANT: For EVERY response, you must assess your confidence level based on your knowledge base.
At the very beginning of your response, include exactly one of these tags:
[CONFIDENCE:HIGH] - This topic is well-documented in your source material. You are confident this matches how the real person would respond.
[CONFIDENCE:MEDIUM] - This is partially grounded in your source material but involves inference from your principles and documented thinking patterns.
[CONFIDENCE:LOW] - This goes beyond your source material. You are extrapolating — the real person might answer differently.

After the confidence tag, provide your response naturally.`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt + confidenceInstruction },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function evaluateResponse(
  advisorName: string,
  question: string,
  expectedAnswer: string,
  actualResponse: string,
  dimension: string
): Promise<{ score: number; rationale: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert evaluator assessing AI persona fidelity. You evaluate how well an AI advisor's response matches what the real person would say.

Score on a 1-5 scale:
5 = Perfect match — response is essentially what the real person would say
4 = Strong match — captures the essence with minor deviations
3 = Partial match — gets some elements right but misses key aspects
2 = Weak match — superficially related but misses the person's actual perspective
1 = No match — contradicts or completely diverges from the real person's views

Evaluate specifically on the "${dimension}" dimension.

Respond in JSON format: {"score": <number>, "rationale": "<explanation>"}`,
      },
      {
        role: "user",
        content: `Advisor: ${advisorName}
Dimension: ${dimension}

Question: ${question}

Expected Answer (what the real person said/would say):
${expectedAnswer}

AI Advisor's Response:
${actualResponse}

Evaluate the fidelity of the AI's response to the real person's known position.`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: Math.max(1, Math.min(5, result.score || 3)),
      rationale: result.rationale || "No rationale provided",
    };
  } catch {
    return { score: 3, rationale: "Evaluation parsing error" };
  }
}

export async function generateAdvisorResponse(
  systemPrompt: string,
  question: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "";
}

export function parseConfidence(
  text: string
): { confidence: "high" | "medium" | "low" | null; cleanText: string } {
  const highMatch = text.match(/\[CONFIDENCE:HIGH\]\s*/i);
  const medMatch = text.match(/\[CONFIDENCE:MEDIUM\]\s*/i);
  const lowMatch = text.match(/\[CONFIDENCE:LOW\]\s*/i);

  if (highMatch) {
    return { confidence: "high", cleanText: text.replace(highMatch[0], "").trim() };
  }
  if (medMatch) {
    return { confidence: "medium", cleanText: text.replace(medMatch[0], "").trim() };
  }
  if (lowMatch) {
    return { confidence: "low", cleanText: text.replace(lowMatch[0], "").trim() };
  }

  return { confidence: null, cleanText: text };
}
