"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/link-button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditAdvisor() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [versionNote, setVersionNote] = useState("");

  useEffect(() => {
    fetch(`/api/advisors/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        const a = data.advisor;
        setName(a.name);
        setTitle(a.title);
        setBio(a.bio);
        setKnowledgeBase(a.knowledgeBase);
        setSystemPrompt(a.systemPrompt);
        setLoading(false);
      });
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/advisors/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          bio,
          knowledgeBase,
          systemPrompt,
          versionNote: versionNote || undefined,
        }),
      });
      toast.success("Advisor updated");
      router.push(`/advisors/${params.id}`);
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <LinkButton href={`/advisors/${params.id}`} variant="ghost" size="sm" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Profile
      </LinkButton>

      <h1 className="text-3xl font-bold mb-8">Edit {name}</h1>

      <div className="space-y-6">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">
              {knowledgeBase.split(/\s+/).filter(Boolean).length} words
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <div>
              <Label>Version Note (optional)</Label>
              <Input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="What changed in this update?"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <LinkButton href={`/advisors/${params.id}`} variant="outline">
            Cancel
          </LinkButton>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
