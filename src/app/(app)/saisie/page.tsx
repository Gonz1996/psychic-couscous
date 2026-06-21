import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { addWeeksUTC, weekLabel, weekStartUTC } from "@/lib/dates";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TimesheetSelector } from "@/components/timesheet/timesheet-selector";
import { TimesheetForm } from "@/components/timesheet/timesheet-form";

export const dynamic = "force-dynamic";

export default async function SaisiePage({
  searchParams,
}: {
  searchParams: Promise<{ emp?: string; week?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const writable = canWrite(session?.user?.role);

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { employeeId: true } })
    : null;

  const employeeId = sp.emp || me?.employeeId || employees[0]?.id || "";
  const week = sp.week ? weekStartUTC(new Date(sp.week)) : weekStartUTC(new Date());
  const weekStr = week.toISOString().slice(0, 10);

  const [allocs, entries, activeProjects] = await Promise.all([
    prisma.allocation.findMany({
      where: { employeeId, weekStart: week },
      include: { project: { select: { id: true, number: true, name: true } } },
    }),
    prisma.timeEntry.findMany({
      where: { employeeId, weekStart: week },
      include: { project: { select: { id: true, number: true, name: true } } },
    }),
    prisma.project.findMany({
      where: { status: { in: ["ACTIVE", "PLANNING", "ON_HOLD"] } },
      orderBy: { number: "asc" },
      select: { id: true, number: true, name: true },
    }),
  ]);

  const map = new Map<string, { projectId: string; label: string; hours: number; billable: boolean; planned: number }>();
  for (const a of allocs) {
    map.set(a.project.id, {
      projectId: a.project.id,
      label: `${a.project.number} — ${a.project.name}`,
      hours: 0,
      billable: true,
      planned: a.hours,
    });
  }
  for (const e of entries) {
    const cur = map.get(e.project.id) ?? {
      projectId: e.project.id,
      label: `${e.project.number} — ${e.project.name}`,
      hours: 0,
      billable: true,
      planned: 0,
    };
    cur.hours = e.hours;
    cur.billable = e.billable;
    map.set(e.project.id, cur);
  }
  const rows = [...map.values()];

  return (
    <div className="space-y-6">
      <PageHeader title="Saisie de temps" description={`Heures réalisées — semaine du ${weekLabel(week)}`} />
      <Card>
        <CardContent className="pt-6">
          <TimesheetSelector
            employees={employees.map((e) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
            employeeId={employeeId}
            week={weekStr}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {writable ? (
            <TimesheetForm
              key={`${employeeId}-${weekStr}`}
              employeeId={employeeId}
              weekStart={weekStr}
              initialRows={rows}
              allProjects={activeProjects.map((p) => ({ id: p.id, name: `${p.number} — ${p.name}` }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Lecture seule — droits d&apos;écriture requis pour saisir des heures.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
