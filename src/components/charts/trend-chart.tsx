"use client";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: { label: string; utilizationPct: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={[0, 120]} unit="%" />
        <Tooltip formatter={(value) => [`${value} %`, "Utilisation"]} />
        <ReferenceLine y={85} stroke="#ca8a04" strokeDasharray="4 4" />
        <ReferenceLine y={100} stroke="#dc2626" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="utilizationPct" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
