"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReplicaScoreBadge, ReplicaScoreBar } from "@/components/replica-score-badge";
import { ScoreRadarChart } from "@/components/score-radar-chart";
import { ChatInterface } from "@/components/chat-interface";
import { KnowledgeBaseViewer } from "@/components/knowledge-base-viewer";
import { TestRunner } from "@/components/test-runner";
import { ConfidenceIndicator } from "@/components/confidence-indicator";
import { LinkButton } from "@/components/link-button";
import { User, BookOpen, Code, FlaskConical, MessageSquare, Pencil, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AdvisorData {
  advisor: {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string | null;
    knowledgeBase: string;
    systemPrompt: string;
    createdAt: string;
    updatedAt: string;
  };
  questions: {
    id: string;
    advisorId: string;
    question: string;
    expectedAnswer: string;
    domain: string;
    isHoldout: boolean;
    source: string | null;
  }[];
  runs: {
    id: string;
    runAt: string;
    overallScore: number;
    expectedActionScore: number;
    linguisticScore: number;
    knowledgeScore: number;
    boundaryScore: number;
    consistencyScore: number;
  }[];
  versions: {
    id: string;
    content: string;
    createdAt: string;
    note: string | null;
  }[];
}

export default function AdvisorProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const defaultTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    fetch(`/api/advisors/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [params.id]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading advisor...</div>
      </div>
    );
  }

  const { advisor, questions, runs, versions } = data;
  const latestRun = runs[0];
  const wordCount = advisor.knowledgeBase.split(/\s+/).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <LinkButton href="/" variant="ghost" size="sm" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </LinkButton>

      {/* Hero */}
      <div className="flex items-start gap-6 mb-8">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{advisor.name}</h1>
            <LinkButton href={`/advisors/${advisor.id}/edit`} variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </LinkButton>
          </div>
          <p className="text-muted-foreground">{advisor.title}</p>
          <p className="text-sm mt-2">{advisor.bio}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary">
              <BookOpen className="h-3 w-3 mr-1" />
              {wordCount.toLocaleString()} words
            </Badge>
            <Badge variant="secondary">{questions.length} test questions</Badge>
            <Badge variant="secondary">{runs.length} test runs</Badge>
          </div>
        </div>
        {latestRun && (
          <div className="flex-shrink-0">
            <ReplicaScoreBadge score={latestRun.overallScore} size="lg" />
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-1.5">
            <Code className="h-3.5 w-3.5" />
            System Prompt
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {latestRun && (
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle>Replica Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ScoreRadarChart
                      scores={{
                        expectedAction: latestRun.expectedActionScore,
                        linguistic: latestRun.linguisticScore,
                        knowledge: latestRun.knowledgeScore,
                        boundary: latestRun.boundaryScore,
                        consistency: latestRun.consistencyScore,
                      }}
                    />
                    <div className="space-y-4">
                      <ReplicaScoreBar score={latestRun.expectedActionScore} label="Expected Action (30%)" />
                      <ReplicaScoreBar score={latestRun.linguisticScore} label="Linguistic Fidelity (20%)" />
                      <ReplicaScoreBar score={latestRun.knowledgeScore} label="Knowledge Accuracy (20%)" />
                      <ReplicaScoreBar score={latestRun.boundaryScore} label="Boundary Awareness (15%)" />
                      <ReplicaScoreBar score={latestRun.consistencyScore} label="Consistency (15%)" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Confidence Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ConfidenceIndicator level="high" />
                    <span className="text-sm text-muted-foreground">Well-documented in source material</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConfidenceIndicator level="medium" />
                    <span className="text-sm text-muted-foreground">Partially grounded, some inference</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConfidenceIndicator level="low" />
                    <span className="text-sm text-muted-foreground">Extrapolating beyond source material</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Test Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questions.slice(0, 5).map((q) => (
                      <div key={q.id} className="flex items-center gap-2 text-sm">
                        <Badge variant={q.isHoldout ? "default" : "secondary"} className="text-xs flex-shrink-0">
                          {q.isHoldout ? "Holdout" : "Training"}
                        </Badge>
                        <span className="truncate text-muted-foreground">{q.question}</span>
                      </div>
                    ))}
                    {questions.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{questions.length - 5} more questions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge">
          <KnowledgeBaseViewer
            content={advisor.knowledgeBase}
            advisorId={advisor.id}
          />
        </TabsContent>

        {/* System Prompt Tab */}
        <TabsContent value="prompt">
          <div className="space-y-4">
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="prose prose-sm prose-invert max-w-none p-4 bg-muted/30 rounded-lg border font-mono text-sm">
                  <ReactMarkdown>{advisor.systemPrompt}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {versions.length > 0 && (
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {versions.map((v, i) => (
                      <div key={v.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div>
                          <span className="text-sm font-medium">
                            v{versions.length - i}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {v.note || "No note"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="test">
          <TestRunner
            advisorId={advisor.id}
            advisorName={advisor.name}
            questions={questions}
            previousRuns={runs.map((r) => ({ ...r, runAt: new Date(r.runAt) }))}
          />
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <ChatInterface advisorId={advisor.id} advisorName={advisor.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
