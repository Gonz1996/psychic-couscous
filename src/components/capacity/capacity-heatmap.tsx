"use client";
import type { CapacityMatrixDTO } from "@/lib/capacity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CELL: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-900",
  yellow: "bg-amber-100 text-amber-900",
  orange: "bg-orange-200 text-orange-900",
  red: "bg-red-200 text-red-900",
};

export function CapacityHeatmap({ matrix }: { matrix: CapacityMatrixDTO }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de charge — 12 semaines</CardTitle>
        <CardDescription>
          Utilisation par employé et par semaine (vert &lt; 85 %, jaune 85–100 %, orange 100–115 %, rouge &gt; 115 %)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card p-2 text-left font-medium">Employé</th>
                {matrix.weeks.map((w) => (
                  <th key={w.key} className="min-w-[42px] p-1 text-center font-medium text-muted-foreground">
                    {w.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.id}>
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-card p-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {row.discipline} · moy. {row.avgUtilization} %
                    </div>
                  </td>
                  {row.cells.map((c) => (
                    <td key={c.key} className="p-0.5">
                      <div
                        className={cn("rounded py-1.5 text-center font-medium tabular-nums", CELL[c.band])}
                        title={`${c.label} : ${c.allocated} h / ${c.capacity} h (${c.utilizationPct} %)`}
                      >
                        {c.utilizationPct}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
