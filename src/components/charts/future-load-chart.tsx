"use client";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FutureLoadChart({
  data,
}: {
  data: { label: string; allocated: number; capacity: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value, name) => [`${value} h`, name === "capacity" ? "Capacité" : "Charge planifiée"]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="capacity" name="Capacité" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
        <Area type="monotone" dataKey="allocated" name="Charge planifiée" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
