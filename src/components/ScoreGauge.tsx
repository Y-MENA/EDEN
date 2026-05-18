"use client";

interface Props {
  score: number;
  verdict: string;
}

const VERDICT_COLORS: Record<string, string> = {
  Excelente: "#22c55e",
  Bueno: "#84cc16",
  Regular: "#f59e0b",
  Saturado: "#ef4444",
};

export function ScoreGauge({ score, verdict }: Props) {
  const color = VERDICT_COLORS[verdict] ?? "#6b7280";
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f2937" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">
          {score}
        </text>
        <text x="70" y="85" textAnchor="middle" fill="#9ca3af" fontSize="11">
          / 100
        </text>
      </svg>
      <span className="text-lg font-semibold" style={{ color }}>
        {verdict}
      </span>
    </div>
  );
}
