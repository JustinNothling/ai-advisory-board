"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfidenceIndicator } from "@/components/confidence-indicator";
import { GitCompare, Send, Loader2, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Advisor {
  id: string;
  name: string;
  title: string;
}

interface CompareResponse {
  advisorId: string;
  advisorName: string;
  content: string;
  confidence: "high" | "medium" | "low" | null;
  loading: boolean;
}

export default function ComparePage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<CompareResponse[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    fetch("/api/advisors")
      .then((r) => r.json())
      .then(setAdvisors);
  }, []);

  function toggleAdvisor(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  async function askAll() {
    if (!question.trim() || selected.length === 0) return;
    setIsAsking(true);

    const initial: CompareResponse[] = selected.map((id) => ({
      advisorId: id,
      advisorName: advisors.find((a) => a.id === id)?.name || "Unknown",
      content: "",
      confidence: null,
      loading: true,
    }));
    setResponses(initial);

    // Ask each advisor in parallel
    await Promise.all(
      selected.map(async (advisorId) => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              advisorId,
              messages: [],
              message: question,
            }),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";
          let confidence: "high" | "medium" | "low" | null = null;

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            fullContent += decoder.decode(value);

            if (!confidence) {
              if (fullContent.match(/\[CONFIDENCE:HIGH\]/i)) confidence = "high";
              else if (fullContent.match(/\[CONFIDENCE:MEDIUM\]/i)) confidence = "medium";
              else if (fullContent.match(/\[CONFIDENCE:LOW\]/i)) confidence = "low";
            }

            const cleanContent = fullContent
              .replace(/\[CONFIDENCE:(HIGH|MEDIUM|LOW)\]\s*/gi, "")
              .trim();

            setResponses((prev) =>
              prev.map((r) =>
                r.advisorId === advisorId
                  ? { ...r, content: cleanContent, confidence, loading: false }
                  : r
              )
            );
          }
        } catch {
          setResponses((prev) =>
            prev.map((r) =>
              r.advisorId === advisorId
                ? { ...r, content: "Error getting response", loading: false }
                : r
            )
          );
        }
      })
    );

    setIsAsking(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <GitCompare className="h-8 w-8 text-primary" />
        Compare Advisors
      </h1>
      <p className="text-muted-foreground mb-8">
        Ask the same question to multiple advisors and compare their responses
      </p>

      {/* Advisor Selection */}
      <Card className="bg-card/50 mb-6">
        <CardHeader>
          <CardTitle className="text-base">Select Advisors (up to 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {advisors.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAdvisor(a.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  selected.includes(a.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/50"
                )}
              >
                <User className="h-4 w-4" />
                <span className="font-medium">{a.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card className="bg-card/50 mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question to all selected advisors..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  askAll();
                }
              }}
            />
            <Button
              onClick={askAll}
              disabled={isAsking || !question.trim() || selected.length === 0}
              size="icon"
              className="h-auto"
            >
              {isAsking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      {responses.length > 0 && (
        <div className={cn("grid gap-4", responses.length === 2 ? "md:grid-cols-2" : responses.length >= 3 ? "md:grid-cols-3" : "")}>
          {responses.map((r) => (
            <Card key={r.advisorId} className="bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{r.advisorName}</CardTitle>
                  </div>
                  {r.confidence && <ConfidenceIndicator level={r.confidence} compact />}
                </div>
              </CardHeader>
              <CardContent>
                {r.loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{r.content}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
