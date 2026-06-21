import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, CalendarDays, Mail, Pencil, UserCog } from "lucide-react";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { addWeeksUTC, weekKey, weekLabel, weekSeries, weekStartUTC } from "@/lib/dates";
import { computeEmployeeMetrics, employeeWeeklyLoad } from "@/lib/metrics";
import { employeeFlags } from "@/lib/detections";
import { fmtDate, fmtHours, fmtPct, initials } from "@/lib/format";
import { ABSENCE_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { FlagBadge } from "@/components/shared/flag-badge";
import { UtilBadge } from "@/components/shared/util-indicator";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MiniLoadChart } from "@/components/charts/mini-load-chart";

export const dynamic = "force-dynamic";

export default async function EmployeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentWeek = weekStartUTC(new Date());
  const rangeStart = addWeeksUTC(currentWeek, -10);
  const rangeEnd = addWeeksUTC(currentWeek, 17);

  const e = await prisma.employee.findUnique({
    where: { id },
    include: {
      discipline: true,
      office: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
      allocations: {
        where: { weekStart: { gte: rangeStart, lt: rangeEnd } },
        include: { project: { select: { id: true, number: true, name: true, status: true } } },
      },
      timeEntries: { where: { weekStart: { gte: rangeStart, lt: rangeEnd } } },
      absences: { where: { endDate: { gte: rangeStart } }, orderBy: { startDate: "asc" } },
    },
  });
  if (!e) notFound();

  const weeks4 = weekSeries(new Date(), 0, 3);
  const set4 = new Set(weeks4.map(weekKey));
  const m = computeEmployeeMetrics({
    weeklyCapacityHours: e.weeklyCapacityHours,
    weeks: weeks4,
    allocations: e.allocations.filter((a) => set4.has(weekKey(a.weekStart))),
    timeEntries: e.timeEntries.filter((t) => set4.has(weekKey(t.weekStart))),
    absences: e.absences,
  });
  const flags = employeeFlags(m);

  const weeks12 = weekSeries(new Date(), 0, 11);
  const weekly = employeeWeeklyLoad(e.weeklyCapacityHours, weeks12, e.allocations, e.absences).map((c) => ({
    label: weekLabel(c.weekStart),
    allocated: Math.round(c.allocated),
    capacity: Math.round(c.capacity),
    utilizationPct: Math.round(c.utilizationPct),
  }));

  const projMap = new Map<string, { id: string; number: string; name: string; status: string; hours: number }>();
  for (const a of e.allocations) {
    if (weekStartUTC(a.weekStart).getTime() >= currentWeek.getTime()) {
      const cur = projMap.get(a.project.id) ?? {
        id: a.project.id,
        number: a.project.number,
        name: a.project.name,
        status: a.project.status,
        hours: 0,
      };
      cur.hours += a.hours;
      projMap.set(a.project.id, cur);
    }
  }
  const projects = [...projMap.values()].sort((x, y) => y.hours - x.hours);

  const session = await auth();
  const writable = canWrite(session?.user?.role);

  return (
    <div className="space-y-6">
      <Link href="/employes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux employés
      </Link>

      <PageHeader title={`${e.firstName} ${e.lastName}`} description={e.title}>
        <UtilBadge pct={Math.round(m.utilizationPct)} />
        {flags.filter((f) => f !== "AVAILABLE").map((f) => (
          <FlagBadge key={f} flag={f} />
        ))}
        {writable && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/employes/${e.id}/modifier`}>
              <Pencil className="size-4" /> Modifier
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar initials={initials(e.firstName, e.lastName)} className="size-12 text-sm" />
              <div>
                <CardTitle>{e.firstName} {e.lastName}</CardTitle>
                <CardDescription>{e.title}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Detail icon={Briefcase} label="Discipline" value={e.discipline.name} />
            <Detail icon={Building2} label="Bureau" value={e.office.name} />
            <Detail icon={Mail} label="Courriel" value={e.email} />
            <Detail
              icon={UserCog}
              label="Gestionnaire"
              value={e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : "—"}
            />
            <Detail icon={CalendarDays} label="Embauche" value={fmtDate(e.hireDate)} />
            <Detail icon={Briefcase} label="Capacité hebdo." value={fmtHours(e.weeklyCapacityHours)} />
            <Detail icon={Briefcase} label="Cible facturation" value={fmtPct(e.billableTargetPct)} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-3">
          <KpiCard label="Utilisation (4 sem.)" value={fmtPct(m.utilizationPct)} />
          <KpiCard label="Disponibilité" value={fmtPct(m.availabilityPct)} tone={m.availabilityPct > 0 ? "good" : "danger"} />
          <KpiCard label="Facturation" value={fmtPct(m.billablePct)} />
          <KpiCard label="Heures assignées" value={fmtHours(m.allocatedHours)} sub="4 prochaines sem." />
          <KpiCard label="Heures réalisées" value={fmtHours(m.actualHours)} sub="période analysée" />
          <KpiCard
            label="Heures restantes"
            value={fmtHours(m.remainingHours)}
            tone={m.remainingHours < 0 ? "danger" : "good"}
            sub="capacité résiduelle"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charge prévisionnelle (12 semaines)</CardTitle>
          <CardDescription>Heures planifiées vs capacité réelle</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniLoadChart data={weekly} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projets affectés</CardTitle>
            <CardDescription>Heures planifiées à venir</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune affectation à venir.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/projets/${p.id}`} className="font-medium hover:underline">
                          {p.number}
                        </Link>
                        <div className="text-xs text-muted-foreground">{p.name}</div>
                      </TableCell>
                      <TableCell className="text-sm">{PROJECT_STATUS_LABELS[p.status] ?? p.status}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtHours(p.hours)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Absences</CardTitle>
            <CardDescription>Vacances, congés et formations</CardDescription>
          </CardHeader>
          <CardContent>
            {e.absences.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune absence enregistrée.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {e.absences.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm">{ABSENCE_TYPE_LABELS[a.type] ?? a.type}</TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(a.startDate)} → {fmtDate(a.endDate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtHours(a.hours)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label} :</span>
      <span className="ml-auto text-right font-medium">{value}</span>
    </div>
  );
}
