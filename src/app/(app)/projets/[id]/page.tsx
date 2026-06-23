import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calculator, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AllocationEditor } from "@/components/projects/allocation-editor";
import { Button } from "@/components/ui/button";
import { weekStartUTC } from "@/lib/dates";
import { computeProjectMetrics } from "@/lib/metrics";
import { projectFlags } from "@/lib/detections";
import { fmtCurrency, fmtDate, fmtHours, fmtPct, fmtSigned } from "@/lib/format";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { FlagBadge } from "@/components/shared/flag-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      discipline: true,
      projectManager: { select: { firstName: true, lastName: true } },
      timeEntries: { include: { employee: { select: { id: true, firstName: true, lastName: true, costRate: true } } } },
      allocations: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } },
    },
  });
  if (!p) notFound();

  const currentWeek = weekStartUTC(new Date());
  const m = computeProjectMetrics({
    budgetHours: p.budgetHours,
    budgetFees: p.budgetFees,
    percentComplete: p.percentComplete,
    startDate: p.startDate,
    endDate: p.endDate,
    timeEntries: p.timeEntries.map((t) => ({ hours: t.hours, costRate: t.employee?.costRate ?? 0 })),
  });
  const futureAllocatedHours = p.allocations
    .filter((a) => weekStartUTC(a.weekStart).getTime() >= currentWeek.getTime())
    .reduce((s, a) => s + a.hours, 0);
  const flags = projectFlags(m, { status: p.status, futureAllocatedHours });

  // Équipe : consommé (saisies) + planifié à venir (affectations)
  const team = new Map<string, { id: string; name: string; consumed: number; planned: number }>();
  for (const t of p.timeEntries) {
    const k = t.employee.id;
    const cur = team.get(k) ?? { id: k, name: `${t.employee.firstName} ${t.employee.lastName}`, consumed: 0, planned: 0 };
    cur.consumed += t.hours;
    team.set(k, cur);
  }
  for (const a of p.allocations) {
    if (weekStartUTC(a.weekStart).getTime() >= currentWeek.getTime()) {
      const k = a.employee.id;
      const cur = team.get(k) ?? { id: k, name: `${a.employee.firstName} ${a.employee.lastName}`, consumed: 0, planned: 0 };
      cur.planned += a.hours;
      team.set(k, cur);
    }
  }
  const teamRows = [...team.values()].sort((x, y) => y.consumed + y.planned - (x.consumed + x.planned));

  const session = await auth();
  const writable = canWrite(session?.user?.role);
  const assignable = writable
    ? await prisma.employee.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ lastName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <Link href="/projets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux projets
      </Link>

      <PageHeader title={`${p.number} — ${p.name}`} description={`${p.client.name} · ${p.discipline.name}`}>
        <span className={cn("rounded border px-2 py-0.5 text-xs font-medium", PROJECT_STATUS_BADGE[p.status] ?? "")}>
          {PROJECT_STATUS_LABELS[p.status] ?? p.status}
        </span>
        {flags.map((f) => (
          <FlagBadge key={f} flag={f} />
        ))}
        {writable && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/projets/${p.id}/modifier`}>
              <Pencil className="size-4" /> Modifier
            </Link>
          </Button>
        )}
        {writable && (
          <Button asChild size="sm">
            <Link href={`/projets/${p.id}/planification`}>
              <Calculator className="size-4" /> Planification
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="Avancement" value={fmtPct(m.pctComplete)} sub={`temps écoulé ${fmtPct(m.timeElapsedPct)}`} />
        <KpiCard
          label="Heures consommées"
          value={fmtHours(m.hoursConsumed)}
          sub={`${fmtPct(m.pctHoursUsed)} du budget`}
          tone={m.pctHoursUsed > 100 ? "danger" : m.pctHoursUsed >= 90 ? "warn" : "good"}
        />
        <KpiCard label="Heures restantes" value={fmtHours(m.hoursRemaining)} tone={m.hoursRemaining < 0 ? "danger" : "default"} />
        <KpiCard
          label="Prévision à terminaison"
          value={fmtHours(m.eacHours)}
          sub={`${fmtSigned(m.eacVariancePct)} % vs budget`}
          tone={m.eacVariancePct > 5 ? "danger" : "good"}
        />
        <KpiCard
          label="Écart échéancier"
          value={`${fmtSigned(m.scheduleVariancePct)} %`}
          tone={m.scheduleVariancePct < -10 ? "danger" : m.scheduleVariancePct < 0 ? "warn" : "good"}
          sub={`${m.daysToDeadline} j avant échéance`}
        />
        <KpiCard
          label="Marge projetée"
          value={fmtPct(m.projectedMarginPct)}
          tone={m.projectedMarginPct < 15 ? "danger" : m.projectedMarginPct < 30 ? "warn" : "good"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suivi budget &amp; échéancier</CardTitle>
            <CardDescription>Comparaison avancement / consommation / temps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Bar label="Avancement" pct={m.pctComplete} />
            <Bar label="Heures consommées" pct={m.pctHoursUsed} danger />
            <Bar label="Temps écoulé" pct={m.timeElapsedPct} muted />
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm sm:grid-cols-4">
              <Stat label="Début" value={fmtDate(p.startDate)} />
              <Stat label="Fin" value={fmtDate(p.endDate)} />
              <Stat label="Budget heures" value={fmtHours(p.budgetHours)} />
              <Stat label="Chargé de projet" value={`${p.projectManager.firstName} ${p.projectManager.lastName}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rentabilité</CardTitle>
            <CardDescription>Estimation à terminaison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Stat label="Budget honoraires" value={fmtCurrency(p.budgetFees)} inline />
            <Stat label="Coût à ce jour" value={fmtCurrency(m.costToDate)} inline />
            <Stat label="Coût projeté (EAC)" value={fmtCurrency(m.projectedCost)} inline />
            <Stat label="Marge projetée" value={fmtCurrency(m.projectedMargin)} inline />
            <div className="border-t pt-2">
              <Stat label="Marge %" value={fmtPct(m.projectedMarginPct)} inline />
            </div>
          </CardContent>
        </Card>
      </div>

      {writable && (
        <Card>
          <CardHeader>
            <CardTitle>Affecter une ressource</CardTitle>
            <CardDescription>Planifier des heures pour un employé sur plusieurs semaines</CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationEditor
              projectId={p.id}
              employees={assignable.map((e) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Équipe affectée</CardTitle>
          <CardDescription>Heures réalisées et planifiées à venir</CardDescription>
        </CardHeader>
        <CardContent>
          {teamRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune ressource affectée.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead className="text-right">Réalisé</TableHead>
                  <TableHead className="text-right">Planifié (à venir)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamRows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/employes/${t.id}`} className="font-medium hover:underline">
                        {t.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmtHours(t.consumed)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtHours(t.planned)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Bar({ label, pct, danger, muted }: { label: string; pct: number; danger?: boolean; muted?: boolean }) {
  const color = muted ? "bg-slate-400" : danger && pct > 100 ? "bg-red-500" : danger && pct >= 90 ? "bg-amber-500" : "bg-primary";
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{fmtPct(pct)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, inline }: { label: string; value: string; inline?: boolean }) {
  if (inline) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
    );
  }
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
