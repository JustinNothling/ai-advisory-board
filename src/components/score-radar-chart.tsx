"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ScoreRadarChartProps {
  scores: {
    expectedAction: number;
    linguistic: number;
    knowledge: number;
    boundary: number;
    consistency: number;
  };
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const data = [
    { dimension: "Expected Action", score: scores.expectedAction, fullMark: 5 },
    { dimension: "Linguistic", score: scores.linguistic, fullMark: 5 },
    { dimension: "Knowledge", score: scores.knowledge, fullMark: 5 },
    { dimension: "Boundary", score: scores.boundary, fullMark: 5 },
    { dimension: "Consistency", score: scores.consistency, fullMark: 5 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fill: "#6b7280", fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#f9fafb",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
