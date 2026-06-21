"use client";
import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UtilBadge, UtilBar } from "@/components/shared/util-indicator";
import { FlagBadge } from "@/components/shared/flag-badge";
import { fmtHours, fmtPct } from "@/lib/format";

export interface EmployeeRowDTO {
  id: string;
  name: string;
  initials: string;
  title: string;
  discipline: string;
  office: string;
  utilizationPct: number;
  billablePct: number;
  remaining: number;
  flags: string[];
}

export function EmployeesTable({
  rows,
  disciplines,
}: {
  rows: EmployeeRowDTO[];
  disciplines: string[];
}) {
  const [q, setQ] = React.useState("");
  const [disc, setDisc] = React.useState("all");

  const filtered = React.useMemo(
    () =>
      rows.filter(
        (r) =>
          (disc === "all" || r.discipline === disc) &&
          (q === "" || `${r.name} ${r.title}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, disc],
  );

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un employé…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={disc}
          onChange={(e) => setDisc(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">Toutes les disciplines</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground sm:ml-auto">{filtered.length} employé(s)</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Discipline</TableHead>
            <TableHead className="hidden md:table-cell">Bureau</TableHead>
            <TableHead className="min-w-[150px]">Utilisation</TableHead>
            <TableHead className="text-right">Disponible</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Facturation</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Link href={`/employes/${r.id}`} className="flex items-center gap-3 group">
                  <Avatar initials={r.initials} className="size-8" />
                  <div>
                    <div className="font-medium group-hover:underline">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.title}</div>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-sm">{r.discipline}</TableCell>
              <TableCell className="hidden text-sm md:table-cell">{r.office}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UtilBadge pct={r.utilizationPct} />
                  <UtilBar pct={r.utilizationPct} className="hidden w-20 md:block" />
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{fmtHours(r.remaining)}</TableCell>
              <TableCell className="hidden text-right tabular-nums lg:table-cell">{fmtPct(r.billablePct)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {r.flags.filter((f) => f !== "AVAILABLE").map((f) => (
                    <FlagBadge key={f} flag={f} />
                  ))}
                  {r.flags.filter((f) => f !== "AVAILABLE").length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
