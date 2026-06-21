import Link from "next/link";
import { Activity, AlertTriangle, Clock, Gauge, Users, UserCheck, Wallet, FolderKanban } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { utilizationBand } from "@/lib/thresholds";
import { fmtHours, fmtInt, fmtPct } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { FlagBadge } from "@/components/shared/flag-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FutureLoadChart } from "@/components/charts/future-load-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { DisciplineChart } from "@/components/charts/discipline-chart";
import { EmployeeChart } from "@/components/charts/employee-chart";

export const dynamic = "force-dynamic";

const BAND_TONE = { green: "good", yellow: "default", orange: "warn", red: "danger" } as const;

export default async function DashboardPage() {
  const d = await getDashboardData();
  const k = d.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord exécutif"
        description="Vue d'ensemble en temps réel de la charge, de la capacité et des risques."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Employés actifs" value={fmtInt(k.totalEmployees)} icon={Users} sub={`${fmtInt(k.activeProjectsCount)} projets actifs`} />
        <KpiCard
          label="Utilisation moyenne"
          value={fmtPct(k.avgUtilization)}
          icon={Activity}
          tone={BAND_TONE[utilizationBand(k.avgUtilization)]}
          sub="semaine courante"
        />
        <KpiCard
          label="Employés surchargés"
          value={fmtInt(k.overloadedCount)}
          icon={AlertTriangle}
          tone={k.overloadedCount > 0 ? "danger" : "good"}
          sub={`dont ${fmtInt(k.criticalCount)} en zone critique`}
        />
        <KpiCard
          label="Employés disponibles"
          value={fmtInt(k.availableCount)}
          icon={UserCheck}
          tone="good"
          sub="peuvent recevoir des tâches"
        />
        <KpiCard label="Capacité hebdomadaire" value={fmtHours(k.totalCapacity)} icon={Gauge} sub="disponibilité réelle" />
        <KpiCard
          label="Projets en retard"
          value={fmtInt(k.lateProjectsCount)}
          icon={Clock}
          tone={k.lateProjectsCount > 0 ? "warn" : "good"}
        />
        <KpiCard
          label="Projets à risque"
          value={fmtInt(k.atRiskCount)}
          icon={FolderKanban}
          tone={k.atRiskCount > 0 ? "danger" : "good"}
          sub={`${fmtInt(k.overBudgetCount)} en dépassement`}
        />
        <KpiCard label="Budget consommé" value={fmtPct(k.budgetConsumedPct)} icon={Wallet} sub="heures · projets actifs" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charge future (12 semaines)</CardTitle>
            <CardDescription>Capacité réelle vs charge planifiée</CardDescription>
          </CardHeader>
          <CardContent>
            <FutureLoadChart data={d.chargeFuture} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Évolution de l&apos;utilisation</CardTitle>
            <CardDescription>8 dernières semaines (heures réalisées)</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={d.utilizationTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Charge par discipline</CardTitle>
            <CardDescription>4 prochaines semaines</CardDescription>
          </CardHeader>
          <CardContent>
            <DisciplineChart data={d.chargeByDiscipline} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Charge par employé</CardTitle>
            <CardDescription>Top 10 — 4 prochaines semaines</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeChart data={d.chargeByEmployee.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projets critiques</CardTitle>
          <CardDescription>Classés par niveau de risque</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {d.criticalProjects.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun projet à risque pour le moment. 👍</p>
          )}
          {d.criticalProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projets/${p.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {p.number} — {p.name}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.flags.map((f) => (
                    <FlagBadge key={f} flag={f} />
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right text-sm">
                <div className="font-semibold tabular-nums">Risque {p.riskScore}</div>
                <div className="text-xs text-muted-foreground">marge {fmtPct(p.marginPct)}</div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
