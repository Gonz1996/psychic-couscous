"use client";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { utilizationStyle } from "@/lib/thresholds";

export function MiniLoadChart({
  data,
}: {
  data: { label: string; allocated: number; capacity: number; utilizationPct: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value, name) => [`${value} h`, name === "capacity" ? "Capacité" : "Charge"]} />
        <Line type="monotone" dataKey="capacity" name="Capacité" stroke="#64748b" strokeDasharray="4 4" dot={false} />
        <Bar dataKey="allocated" name="Charge" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={utilizationStyle(d.utilizationPct).hex} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
