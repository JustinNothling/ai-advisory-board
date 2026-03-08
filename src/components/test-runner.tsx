"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReplicaScoreBadge, ReplicaScoreBar } from "@/components/replica-score-badge";
import { ScoreRadarChart } from "@/components/score-radar-chart";
import { FlaskConical, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface TestQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  domain: string;
  isHoldout: boolean;
}

interface TestRunResult {
  overallScore: number;
  expectedActionScore: number;
  linguisticScore: number;
  knowledgeScore: number;
  boundaryScore: number;
  consistencyScore: number;
  results: {
    questionId: string;
    question: string;
    expectedAnswer: string;
    advisorResponse: string;
    score: number;
    rationale: string;
    dimension: string;
  }[];
}

interface TestRunnerProps {
  advisorId: string;
  advisorName: string;
  questions: TestQuestion[];
  previousRuns?: {
    id: string;
    runAt: Date;
    overallScore: number;
    expectedActionScore: number;
    linguisticScore: number;
    knowledgeScore: number;
    boundaryScore: number;
    consistencyScore: number;
  }[];
}

export function TestRunner({ advisorId, advisorName, questions, previousRuns = [] }: TestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const holdoutCount = questions.filter((q) => q.isHoldout).length;
  const trainingCount = questions.length - holdoutCount;

  async function runTest() {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Test failed");
      }

      // Stream results
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "progress") {
              setProgress(event.progress);
              setCurrentQuestion(event.question || "");
            } else if (event.type === "complete") {
              setResult(event.result);
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    }

    setIsRunning(false);
  }

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Replica Score Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-xs text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{trainingCount}</div>
              <div className="text-xs text-muted-foreground">Training Set</div>
            </div>
            <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">{holdoutCount}</div>
              <div className="text-xs text-emerald-400/80">Holdout Set</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Tests {advisorName}&apos;s persona across 5 dimensions using questions where we know the real person&apos;s answer. Holdout questions are NOT in the knowledge base — they measure true replication fidelity.
          </p>

          <Button onClick={runTest} disabled={isRunning || questions.length === 0} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing ({Math.round(progress)}%)...
              </>
            ) : (
              <>
                <FlaskConical className="h-4 w-4 mr-2" />
                Run Full Test
              </>
            )}
          </Button>

          {isRunning && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground truncate">{currentQuestion}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Test Results</h3>
                  <p className="text-sm text-muted-foreground">Replica Score Breakdown</p>
                </div>
                <ReplicaScoreBadge score={result.overallScore} size="lg" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <ScoreRadarChart
                    scores={{
                      expectedAction: result.expectedActionScore,
                      linguistic: result.linguisticScore,
                      knowledge: result.knowledgeScore,
                      boundary: result.boundaryScore,
                      consistency: result.consistencyScore,
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <ReplicaScoreBar score={result.expectedActionScore} label="Expected Action (30%)" />
                  <ReplicaScoreBar score={result.linguisticScore} label="Linguistic Fidelity (20%)" />
                  <ReplicaScoreBar score={result.knowledgeScore} label="Knowledge Accuracy (20%)" />
                  <ReplicaScoreBar score={result.boundaryScore} label="Boundary Awareness (15%)" />
                  <ReplicaScoreBar score={result.consistencyScore} label="Consistency (15%)" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Results */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Question-by-Question Results</h3>
            {result.results.map((r, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {r.dimension}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {r.score >= 4 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      )}
                      <span className={r.score >= 4 ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                        {r.score.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-2">{r.question}</p>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 bg-muted/30 rounded text-xs">
                      <div className="font-medium text-muted-foreground mb-1">Expected</div>
                      <p>{r.expectedAnswer}</p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded text-xs">
                      <div className="font-medium text-primary mb-1">AI Response</div>
                      <p>{r.advisorResponse}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">{r.rationale}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Previous Runs */}
      {previousRuns.length > 0 && !result && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Previous Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(run.runAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      EA: {run.expectedActionScore.toFixed(1)} | LF: {run.linguisticScore.toFixed(1)} | KA: {run.knowledgeScore.toFixed(1)} | BA: {run.boundaryScore.toFixed(1)} | CO: {run.consistencyScore.toFixed(1)}
                    </div>
                  </div>
                  <ReplicaScoreBadge score={run.overallScore} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
