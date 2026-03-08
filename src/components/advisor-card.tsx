"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReplicaScoreBadge } from "@/components/replica-score-badge";
import { LinkButton } from "@/components/link-button";
import { MessageSquare, FlaskConical, Pencil, BookOpen, User } from "lucide-react";

interface AdvisorCardProps {
  advisor: {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string | null;
    knowledgeBase: string;
    updatedAt: Date;
  };
  latestScore?: number | null;
}

export function AdvisorCard({ advisor, latestScore }: AdvisorCardProps) {
  const wordCount = advisor.knowledgeBase.split(/\s+/).length;

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {advisor.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {advisor.title}
              </p>
            </div>
          </div>
          {latestScore !== null && latestScore !== undefined && (
            <ReplicaScoreBadge score={latestScore} size="sm" showLabel={false} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {advisor.bio}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            {wordCount.toLocaleString()} words
          </Badge>
          {latestScore !== null && latestScore !== undefined && (
            <Badge
              variant="outline"
              className={
                latestScore >= 4.5
                  ? "border-amber-500/50 text-amber-400"
                  : latestScore >= 3.5
                  ? "border-slate-400/50 text-slate-300"
                  : "border-orange-500/50 text-orange-400"
              }
            >
              Score: {latestScore.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/advisors/${advisor.id}?tab=chat`} size="sm" className="flex-1">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Chat
          </LinkButton>
          <LinkButton href={`/advisors/${advisor.id}?tab=test`} size="sm" variant="outline" className="flex-1">
            <FlaskConical className="h-3.5 w-3.5 mr-1" />
            Test
          </LinkButton>
          <LinkButton href={`/advisors/${advisor.id}/edit`} size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" />
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
