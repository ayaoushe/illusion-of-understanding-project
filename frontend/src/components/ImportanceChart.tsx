import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FeatureRow } from "../api/types";

interface ImportanceChartProps {
  features: FeatureRow[];
}

export function ImportanceChart({ features }: ImportanceChartProps) {
  const data = features.map((f) => ({
    name: f.name.length > 14 ? `${f.name.slice(0, 12)}…` : f.name,
    fullName: f.name,
    importance: Math.round(f.weight * 100),
  }));

  return (
    <div className="h-64 w-full rounded-2xl border border-slate-200/80 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11 }}
            stroke="#64748b"
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Importance"]}
            labelFormatter={(_, p) => (p?.[0]?.payload?.fullName as string) ?? ""}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="importance" fill="#6366f1" radius={[0, 8, 8, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
