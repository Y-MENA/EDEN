"use client";

interface Props {
  label: string;
  score: number;
  maxScore?: number;
  detail: string;
}

export function CriteriaBar({ label, score, maxScore = 25, detail }: Props) {
  const pct = (score / maxScore) * 100;
  const color =
    pct >= 80 ? "#22c55e" : pct >= 55 ? "#84cc16" : pct >= 35 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-gray-400">
          {score}/{maxScore}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  );
}
