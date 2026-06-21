"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UtilBadge } from "@/components/shared/util-indicator";

interface SimEmp {
  id: string;
  name: string;
  discipline: string;
  utilizationPct: number;
  allocated: number;
  capacity: number;
}
interface Sugg {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  hours: number;
  discipline: string;
}

const util = (alloc: number, cap: number) => (cap > 0 ? Math.round((alloc / cap) * 100) : alloc > 0 ? 999 : 0);

export function CapacitySimulator({ employees, suggestions }: { employees: SimEmp[]; suggestions: Sugg[] }) {
  const [fromId, setFromId] = React.useState(suggestions[0]?.fromId ?? employees[0]?.id ?? "");
  const [toId, setToId] = React.useState(suggestions[0]?.toId ?? employees[employees.length - 1]?.id ?? "");
  const [hours, setHours] = React.useState(suggestions[0]?.hours ?? 4);

  const from = employees.find((e) => e.id === fromId);
  const to = employees.find((e) => e.id === toId);
  const fromAfter = from ? util(from.allocated - hours, from.capacity) : 0;
  const toAfter = to ? util(to.allocated + hours, to.capacity) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation d&apos;affectation</CardTitle>
        <CardDescription>Prévisualisez l&apos;impact d&apos;un transfert d&apos;heures entre deux ressources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">De (source)</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.utilizationPct} %
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Vers (cible)</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.utilizationPct} %
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Heures / semaine</label>
            <Input type="number" value={hours} min={0} onChange={(e) => setHours(Number(e.target.value) || 0)} className="mt-1" />
          </div>
        </div>

        {from && to && (
          <div className="flex items-center justify-around gap-4 rounded-lg border p-4">
            <div className="text-center">
              <div className="text-sm font-medium">{from.name}</div>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <UtilBadge pct={from.utilizationPct} />
                <ArrowRight className="size-3 text-muted-foreground" />
                <UtilBadge pct={fromAfter} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{to.name}</div>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <UtilBadge pct={to.utilizationPct} />
                <ArrowRight className="size-3 text-muted-foreground" />
                <UtilBadge pct={toAfter} />
              </div>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-medium">Rééquilibrages suggérés automatiquement</div>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFromId(s.fromId);
                    setToId(s.toId);
                    setHours(s.hours);
                  }}
                  className="flex w-full items-center justify-between rounded-md border p-2.5 text-left text-sm hover:bg-muted/50"
                >
                  <span className="flex items-center gap-1.5">
                    {s.fromName} <ArrowRight className="size-3 text-muted-foreground" /> {s.toName}
                    <span className="text-muted-foreground">({s.discipline})</span>
                  </span>
                  <span className="font-medium tabular-nums">~{s.hours} h</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
