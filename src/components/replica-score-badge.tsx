"use client";

import { cn } from "@/lib/utils";

interface ReplicaScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 4.5) return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", label: "Excellent" };
  if (score >= 3.5) return { bg: "bg-slate-300/20", text: "text-slate-300", border: "border-slate-400/50", label: "Good" };
  if (score >= 2.5) return { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50", label: "Needs Work" };
  return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", label: "Poor" };
}

export function ReplicaScoreBadge({ score, size = "md", showLabel = true }: ReplicaScoreBadgeProps) {
  const colors = getScoreColor(score);
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-xl",
    lg: "h-24 w-24 text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold border-2",
          colors.bg,
          colors.text,
          colors.border,
          sizeClasses[size]
        )}
      >
        {score.toFixed(1)}
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", colors.text)}>
          {colors.label}
        </span>
      )}
    </div>
  );
}

export function ReplicaScoreBar({ score, label, maxScore = 5 }: { score: number; label: string; maxScore?: number }) {
  const pct = (score / maxScore) * 100;
  const colors = getScoreColor(score);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", colors.text)}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bg.replace("/20", ""))}
          style={{ width: `${pct}%`, backgroundColor: score >= 4.5 ? "#f59e0b" : score >= 3.5 ? "#94a3b8" : score >= 2.5 ? "#f97316" : "#ef4444" }}
        />
      </div>
    </div>
  );
}
