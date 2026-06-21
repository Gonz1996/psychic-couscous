"use client";
import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlagBadge } from "@/components/shared/flag-badge";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { fmtHours, fmtPct, fmtSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ProjectRowDTO {
  id: string;
  number: string;
  name: string;
  client: string;
  pm: string;
  discipline: string;
  status: string;
  budgetHours: number;
  consumed: number;
  pctHoursUsed: number;
  pctComplete: number;
  scheduleVariancePct: number;
  marginPct: number;
  riskScore: number;
  flags: string[];
}

function budgetColor(pct: number) {
  if (pct > 100) return "bg-red-500";
  if (pct >= 90) return "bg-amber-500";
  return "bg-emerald-500";
}

export function ProjectsTable({ rows }: { rows: ProjectRowDTO[] }) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const statuses = React.useMemo(() => [...new Set(rows.map((r) => r.status))], [rows]);
  const filtered = React.useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          (q === "" || `${r.number} ${r.name} ${r.client}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, status],
  );

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un projet…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">Tous les statuts</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground sm:ml-auto">{filtered.length} projet(s)</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projet</TableHead>
            <TableHead className="hidden lg:table-cell">Chargé de projet</TableHead>
            <TableHead className="min-w-[130px]">Avancement</TableHead>
            <TableHead className="min-w-[130px]">Budget (h)</TableHead>
            <TableHead className="text-right">Écart éch.</TableHead>
            <TableHead className="hidden text-right md:table-cell">Marge</TableHead>
            <TableHead>Risque</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Link href={`/projets/${r.id}`} className="group block">
                  <div className="font-medium group-hover:underline">
                    {r.number} — {r.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5",
                        PROJECT_STATUS_BADGE[r.status] ?? "",
                      )}
                    >
                      {PROJECT_STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <span>{r.client}</span>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden text-sm lg:table-cell">{r.pm}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={r.pctComplete} className="w-16" />
                  <span className="text-xs tabular-nums text-muted-foreground">{fmtPct(r.pctComplete)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs tabular-nums">
                  {fmtHours(r.consumed)} / {fmtHours(r.budgetHours)}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", budgetColor(r.pctHoursUsed))}
                    style={{ width: `${Math.min(100, r.pctHoursUsed)}%` }}
                  />
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-sm tabular-nums",
                  r.scheduleVariancePct < -10 ? "text-red-600" : r.scheduleVariancePct < 0 ? "text-amber-600" : "text-emerald-600",
                )}
              >
                {fmtSigned(r.scheduleVariancePct)} %
              </TableCell>
              <TableCell
                className={cn(
                  "hidden text-right text-sm tabular-nums md:table-cell",
                  r.marginPct < 15 ? "text-red-600" : r.marginPct < 30 ? "text-amber-600" : "text-emerald-600",
                )}
              >
                {fmtPct(r.marginPct)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {r.flags.map((f) => (
                    <FlagBadge key={f} flag={f} />
                  ))}
                  {r.flags.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
