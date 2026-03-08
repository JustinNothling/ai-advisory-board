"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Pencil, Save, X } from "lucide-react";

interface KnowledgeBaseViewerProps {
  content: string;
  advisorId: string;
  editable?: boolean;
}

export function KnowledgeBaseViewer({
  content,
  advisorId,
  editable = true,
}: KnowledgeBaseViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);

  const wordCount = content.split(/\s+/).length;
  const sections = content.split(/^## /m).filter(Boolean).length;

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/advisors/${advisorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledgeBase: editContent }),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <BookOpen className="h-3 w-3 mr-1" />
            {wordCount.toLocaleString()} words
          </Badge>
          <Badge variant="outline">{sections} sections</Badge>
        </div>
        {editable && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(content); }}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
        />
      ) : (
        <div className="prose prose-sm prose-invert max-w-none p-4 bg-muted/30 rounded-lg border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
