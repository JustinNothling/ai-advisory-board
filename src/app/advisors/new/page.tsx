"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LinkButton } from "@/components/link-button";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Brain } from "lucide-react";

interface TestQuestion {
  question: string;
  expectedAnswer: string;
  domain: string;
  isHoldout: boolean;
  source: string;
}

export default function NewAdvisor() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [questions, setQuestions] = useState<TestQuestion[]>([
    { question: "", expectedAnswer: "", domain: "", isHoldout: false, source: "" },
  ]);

  function addQuestion() {
    setQuestions([
      ...questions,
      { question: "", expectedAnswer: "", domain: "", isHoldout: false, source: "" },
    ]);
  }

  function removeQuestion(idx: number) {
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: keyof TestQuestion, value: string | boolean) {
    const updated = [...questions];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      // Create advisor
      const res = await fetch("/api/advisors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, bio, knowledgeBase, systemPrompt }),
      });
      const { id } = await res.json();

      // Add test questions
      for (const q of questions) {
        if (q.question.trim()) {
          await fetch("/api/advisors/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ advisorId: id, ...q }),
          });
        }
      }

      router.push(`/advisors/${id}`);
    } catch (error) {
      console.error("Failed to create:", error);
    }
    setSaving(false);
  }

  const steps = [
    { num: 1, label: "Identity" },
    { num: 2, label: "Knowledge Base" },
    { num: 3, label: "System Prompt" },
    { num: 4, label: "Test Questions" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <LinkButton href="/" variant="ghost" size="sm" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </LinkButton>

      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        Create New Advisor
      </h1>
      <p className="text-muted-foreground mb-8">
        Build an AI persona modeled on a real person
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="h-3 w-3" /> : <span>{s.num}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className="w-4 h-px bg-muted-foreground/30" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Warren Buffett"
              />
            </div>
            <div>
              <Label>Title / Role</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chairman & CEO, Berkshire Hathaway"
              />
            </div>
            <div>
              <Label>Short Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief description of who this person is and why they're a valuable advisor..."
                rows={3}
              />
            </div>
            <Button onClick={() => setStep(2)} disabled={!name || !title}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Knowledge Base */}
      {step === 2 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">
              Paste the source material: articles, transcripts, letters, quotes, interviews.
              The richer the data, the more authentic the persona.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              placeholder="# Knowledge Base&#10;&#10;Paste shareholder letters, interview transcripts, book excerpts, quotes, and any other primary source material here..."
              rows={15}
              className="font-mono text-sm"
            />
            <div className="text-sm text-muted-foreground">
              {knowledgeBase.split(/\s+/).filter(Boolean).length} words
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!knowledgeBase.trim()}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: System Prompt */}
      {step === 3 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define the persona — who they are, how they think, how they communicate, and what they won&apos;t do.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`# ${name || "Advisor"} AI Advisor — System Prompt\n\nYou are an AI advisor modeled on **${name || "[Name]"}**...\n\n## Who You Are\n\n## Your Core Beliefs\n\n## Your Communication Style\n\n## How You Advise\n\n## What You Won't Do`}
              rows={15}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!systemPrompt.trim()}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Test Questions */}
      {step === 4 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Test Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add questions where you know how the real person would answer.
              Mark some as &quot;Holdout&quot; — these are NOT included in the knowledge base and test true replication fidelity.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuestion(idx, "isHoldout", !q.isHoldout)}
                      className="flex items-center gap-1"
                    >
                      <Badge variant={q.isHoldout ? "default" : "secondary"} className="cursor-pointer">
                        {q.isHoldout ? "Holdout" : "Training"}
                      </Badge>
                    </button>
                    {questions.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeQuestion(idx)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <Input
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                  placeholder="What would you ask this person?"
                />
                <Textarea
                  value={q.expectedAnswer}
                  onChange={(e) => updateQuestion(idx, "expectedAnswer", e.target.value)}
                  placeholder="How would the real person answer? (Be specific)"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={q.domain}
                    onChange={(e) => updateQuestion(idx, "domain", e.target.value)}
                    placeholder="Domain (e.g., Strategy, Philosophy)"
                  />
                  <Input
                    value={q.source}
                    onChange={(e) => updateQuestion(idx, "source", e.target.value)}
                    placeholder="Source (where you know the answer from)"
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(5)}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{title}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Bio</Label>
              <p className="text-sm">{bio}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {knowledgeBase.split(/\s+/).filter(Boolean).length}
                </div>
                <div className="text-xs text-muted-foreground">KB Words</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {systemPrompt.split(/\s+/).filter(Boolean).length}
                </div>
                <div className="text-xs text-muted-foreground">Prompt Words</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {questions.filter((q) => q.question.trim()).length}
                </div>
                <div className="text-xs text-muted-foreground">Test Questions</div>
              </div>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="flex-1">
                {saving ? "Creating..." : "Create Advisor"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
