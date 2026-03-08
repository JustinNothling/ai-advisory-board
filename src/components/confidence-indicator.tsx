"use client";

import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  level: "high" | "medium" | "low" | null;
  compact?: boolean;
}

const config = {
  high: {
    dots: 3,
    color: "text-emerald-400",
    bgActive: "bg-emerald-400",
    bgInactive: "bg-muted",
    label: "High Confidence",
    description: "Well-documented in source material",
  },
  medium: {
    dots: 2,
    color: "text-amber-400",
    bgActive: "bg-amber-400",
    bgInactive: "bg-muted",
    label: "Medium Confidence",
    description: "Partially grounded, some inference",
  },
  low: {
    dots: 1,
    color: "text-red-400",
    bgActive: "bg-red-400",
    bgInactive: "bg-muted",
    label: "Low Confidence",
    description: "Extrapolating beyond source material",
  },
};

export function ConfidenceIndicator({ level, compact = false }: ConfidenceIndicatorProps) {
  if (!level) return null;

  const c = config[level];

  return (
    <div className={cn("flex items-center gap-2", compact ? "gap-1" : "gap-2")}>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full",
              compact ? "h-1.5 w-1.5" : "h-2 w-2",
              i <= c.dots ? c.bgActive : c.bgInactive
            )}
          />
        ))}
      </div>
      {!compact && (
        <span className={cn("text-xs", c.color)}>{c.label}</span>
      )}
    </div>
  );
}
