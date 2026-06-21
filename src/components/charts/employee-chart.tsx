"use client";
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { utilizationStyle } from "@/lib/thresholds";

export function EmployeeChart({ data }: { data: { name: string; utilizationPct: number }[] }) {
  const height = Math.max(220, data.length * 30);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, (m: number) => Math.max(120, Math.ceil(m))]} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value} %`, "Utilisation"]} />
        <ReferenceLine x={100} stroke="#dc2626" strokeDasharray="4 4" />
        <Bar dataKey="utilizationPct" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={utilizationStyle(d.utilizationPct).hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
