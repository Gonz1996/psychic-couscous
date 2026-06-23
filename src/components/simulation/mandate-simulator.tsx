"use client";
import * as React from "react";
import { Calculator, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { productionBudget, type FinancialParams } from "@/lib/finance";
import { utilizationBand, BAND_STYLES } from "@/lib/thresholds";
import type { DisciplineCapacity } from "@/lib/queries";
import { fmtCurrency, fmtCurrencyCompact, fmtHours, fmtPct } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const n = (x: number) => (Number.isFinite(x) ? x : 0);

function Num({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input type="number" value={value} onChange={(e) => onChange(e.target.valueAsNumber)} />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export function MandateSimulator({ disciplines }: { disciplines: DisciplineCapacity[] }) {
  const [fees, setFees] = React.useState(250_000);
  const [weeks, setWeeks] = React.useState(20);
  const [profit, setProfit] = React.useState(30);
  const [overhead, setOverhead] = React.useState(10);
  const [risk, setRisk] = React.useState(5);

  // Répartition par discipline — défaut : réparti également sur celles avec effectif.
  const withStaff = disciplines.filter((d) => d.headcount > 0 && d.avgLoadedRate > 0);
  const [shares, setShares] = React.useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    const even = withStaff.length ? Math.round(100 / withStaff.length) : 0;
    withStaff.forEach((d, i) => (init[d.disciplineId] = i === withStaff.length - 1 ? 100 - even * (withStaff.length - 1) : even));
    return init;
  });
  const setShare = (id: string, v: number) => setShares((p) => ({ ...p, [id]: v }));

  const params: FinancialParams = { targetProfitPct: profit, overheadPct: overhead, riskReservePct: risk };
  const prod = productionBudget(n(fees), params);
  const profitDollars = n(fees) * (n(profit) / 100);
  const shareSum = Object.values(shares).reduce((s, x) => s + n(x), 0);
  const wk = Math.max(1, n(weeks));

  const rows = disciplines.map((d) => {
    const share = n(shares[d.disciplineId]);
    const budget = prod * (share / 100);
    const hours = d.avgLoadedRate > 0 ? budget / d.avgLoadedRate : 0;
    const weeklyHours = hours / wk;
    const addedUtil = d.weeklyCapacity > 0 ? (weeklyHours / d.weeklyCapacity) * 100 : 0;
    const newUtil = d.recentUtilizationPct + addedUtil;
    return { d, share, budget, hours, weeklyHours, newUtil, band: utilizationBand(newUtil) };
  });
  const activeRows = rows.filter((r) => r.share > 0);
  const totalHours = activeRows.reduce((s, r) => s + r.hours, 0);
  const worst = activeRows.reduce((m, r) => Math.max(m, r.newUtil), 0);

  const verdict =
    activeRows.length === 0
      ? { tone: "muted", icon: Calculator, text: "Renseignez une répartition par discipline." }
      : worst > 115
        ? { tone: "danger", icon: XCircle, text: "Non faisable sans embauche ou délai — une discipline dépasse 115 % d'occupation." }
        : worst > 100
          ? { tone: "warn", icon: AlertTriangle, text: "Faisable mais tendu — surcharge (100–115 %) sur au moins une discipline." }
          : { tone: "good", icon: CheckCircle2, text: "Faisable — la capacité absorbe le mandat sans surcharge." };
  const VIcon = verdict.icon;
  const verdictColor = { good: "text-emerald-600", warn: "text-amber-600", danger: "text-red-600", muted: "text-muted-foreground" }[verdict.tone]!;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du mandat</CardTitle>
          <CardDescription>Simulation — aucune donnée n&apos;est enregistrée.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Num label="Honoraires" value={fees} onChange={setFees} suffix="$" />
            <Num label="Durée" value={weeks} onChange={setWeeks} suffix="sem." />
            <Num label="Profit cible" value={profit} onChange={setProfit} suffix="%" />
            <Num label="Frais généraux" value={overhead} onChange={setOverhead} suffix="%" />
            <Num label="Réserve risque" value={risk} onChange={setRisk} suffix="%" />
          </div>
          <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-4">
            <Stat label="Budget production" value={fmtCurrency(prod)} strong />
            <Stat label={`Profit (${profit} %)`} value={fmtCurrency(profitDollars)} />
            <Stat label="Heures totales requises" value={fmtHours(totalHours)} />
            <Stat label="Sur la durée" value={`${fmtHours(totalHours / wk)} / sem.`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Répartition & faisabilité par discipline</CardTitle>
            <CardDescription>Occupation = utilisation actuelle + charge ajoutée du mandat.</CardDescription>
          </div>
          <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums", Math.abs(shareSum - 100) < 0.5 ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800")}>
            Σ {Math.round(shareSum)} %
          </span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discipline</TableHead>
                <TableHead className="w-24">% effort</TableHead>
                <TableHead className="text-right">Heures</TableHead>
                <TableHead className="text-right">h / sem.</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Dispo / sem.</TableHead>
                <TableHead className="text-right">Occupation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.d.disciplineId}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: r.d.color }} />
                      {r.d.discipline}
                      <span className="text-xs text-muted-foreground">({r.d.headcount} · {fmtCurrency(r.d.avgLoadedRate)}/h)</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input type="number" className="h-8 w-20" value={r.share} onChange={(e) => setShare(r.d.disciplineId, e.target.valueAsNumber || 0)} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.share > 0 ? fmtHours(r.hours) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.share > 0 ? fmtHours(r.weeklyHours) : "—"}</TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">{fmtHours(r.d.availableWeeklyHours)}</TableCell>
                  <TableCell className="text-right">
                    {r.share > 0 ? (
                      <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums", BAND_STYLES[r.band].badge)}>
                        {fmtPct(r.newUtil)}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn("flex items-center gap-3 pt-6 text-sm font-medium", verdictColor)}>
          <VIcon className="size-5 shrink-0" />
          {verdict.text}
          {activeRows.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Occupation max : {fmtPct(worst)} · {fmtCurrencyCompact(fees)} sur {wk} sem.
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("tabular-nums", strong ? "text-lg font-bold" : "font-medium")}>{value}</div>
    </div>
  );
}
