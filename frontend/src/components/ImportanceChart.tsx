import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FeatureRow } from "../api/types";

interface ImportanceChartProps {
  features: FeatureRow[];
}

const POSITIVE = "#16a34a"; // green-600 — pushes toward the recommendation
const NEGATIVE = "#dc2626"; // red-600 — pushes away from the recommendation

const fmtSigned = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;

export function ImportanceChart({ features }: ImportanceChartProps) {
  // strongest drivers first, top 8 only
  const top = [...features]
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 8);

  // symmetric axis around 0, rounded up to the nearest 0.05
  const maxAbs = Math.max(0.01, ...top.map((f) => Math.abs(f.weight)));
  const bound = Math.ceil(maxAbs * 20) / 20;

  const data = top.map((f) => ({
    name: f.name.length > 14 ? `${f.name.slice(0, 12)}…` : f.name,
    fullName: f.name,
    weight: Number(f.weight.toFixed(4)),
  }));

  return (
    <div className="h-72 w-full rounded-2xl border border-slate-200/80 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <XAxis
            type="number"
            domain={[-bound, bound]}
            tickFormatter={fmtSigned}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11 }}
            stroke="#64748b"
          />
          <ReferenceLine x={0} stroke="#94a3b8" />
          <Tooltip
            formatter={(value: number) => [fmtSigned(value), "SHAP"]}
            labelFormatter={(_, p) => (p?.[0]?.payload?.fullName as string) ?? ""}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="weight" radius={[4, 4, 4, 4]} maxBarSize={22}>
            {data.map((d) => (
              <Cell key={d.fullName} fill={d.weight >= 0 ? POSITIVE : NEGATIVE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
