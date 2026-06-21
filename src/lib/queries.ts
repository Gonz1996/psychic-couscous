// =====================================================================
// Accès aux données (Prisma) + assemblage des indicateurs.
// Ces fonctions s'exécutent côté serveur uniquement.
// =====================================================================
import { prisma } from "./prisma";
import { addDaysUTC, addWeeksUTC, weekKey, weekLabel, weekSeries, weekStartUTC } from "./dates";
import {
  absenceHoursInRange,
  computeEmployeeMetrics,
  computeProjectMetrics,
  employeeWeeklyLoad,
  type EmployeeMetrics,
  type ProjectMetrics,
} from "./metrics";
import {
  employeeFlags,
  projectFlags,
  projectRiskScore,
  type EmployeeFlag,
  type ProjectFlag,
} from "./detections";

// Fenêtre de données chargée en mémoire (≈ 6 mois autour de la semaine courante).
function dataWindow() {
  const currentWeek = weekStartUTC(new Date());
  return {
    currentWeek,
    rangeStart: addWeeksUTC(currentWeek, -10),
    rangeEnd: addWeeksUTC(currentWeek, 17),
  };
}

export async function loadEmployees() {
  const { rangeStart, rangeEnd } = dataWindow();
  return prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: {
      discipline: true,
      office: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
      allocations: {
        where: { weekStart: { gte: rangeStart, lt: rangeEnd } },
        include: { project: { select: { id: true, number: true, name: true } } },
      },
      timeEntries: { where: { weekStart: { gte: rangeStart, lt: rangeEnd } } },
      absences: { where: { endDate: { gte: rangeStart }, startDate: { lt: rangeEnd } } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export type EmployeeWithRels = Awaited<ReturnType<typeof loadEmployees>>[number];

export async function loadProjects() {
  return prisma.project.findMany({
    include: {
      client: true,
      discipline: true,
      projectManager: { select: { id: true, firstName: true, lastName: true } },
      timeEntries: { include: { employee: { select: { id: true, costRate: true } } } },
      allocations: true,
    },
    orderBy: [{ number: "asc" }],
  });
}

export type ProjectWithRels = Awaited<ReturnType<typeof loadProjects>>[number];

// ----------------------------- Employés ------------------------------

export interface EmployeeRow {
  employee: EmployeeWithRels;
  metrics: EmployeeMetrics;
  flags: EmployeeFlag[];
}

function filterToWeeks<T extends { weekStart: Date | string }>(rows: T[], weekKeys: Set<string>) {
  return rows.filter((r) => weekKeys.has(weekKey(r.weekStart)));
}

export function computeRoster(employees: EmployeeWithRels[], weeks: Date[]): EmployeeRow[] {
  const weekKeys = new Set(weeks.map(weekKey));
  return employees.map((e) => {
    const allocations = filterToWeeks(e.allocations, weekKeys);
    const timeEntries = filterToWeeks(e.timeEntries, weekKeys);
    const metrics = computeEmployeeMetrics({
      weeklyCapacityHours: e.weeklyCapacityHours,
      weeks,
      allocations,
      timeEntries,
      absences: e.absences,
    });
    return { employee: e, metrics, flags: employeeFlags(metrics) };
  });
}

// ----------------------------- Projets -------------------------------

export interface ProjectRow {
  project: ProjectWithRels;
  metrics: ProjectMetrics;
  flags: ProjectFlag[];
  riskScore: number;
  futureAllocatedHours: number;
}

export function computeProjectRows(projects: ProjectWithRels[]): ProjectRow[] {
  const currentWeek = weekStartUTC(new Date());
  return projects.map((p) => {
    const timeEntries = p.timeEntries.map((t) => ({ hours: t.hours, costRate: t.employee?.costRate ?? 0 }));
    const futureAllocatedHours = p.allocations
      .filter((a) => weekStartUTC(a.weekStart).getTime() >= currentWeek.getTime())
      .reduce((s, a) => s + a.hours, 0);
    const metrics = computeProjectMetrics({
      budgetHours: p.budgetHours,
      budgetFees: p.budgetFees,
      percentComplete: p.percentComplete,
      startDate: p.startDate,
      endDate: p.endDate,
      timeEntries,
    });
    const flags = projectFlags(metrics, { status: p.status, futureAllocatedHours });
    return { project: p, metrics, flags, riskScore: projectRiskScore(metrics, flags), futureAllocatedHours };
  });
}

// --------------------- Agrégations entreprise ------------------------

export interface FirmWeekPoint {
  key: string;
  label: string;
  allocated: number;
  capacity: number;
  utilizationPct: number;
}

export function firmWeeklyLoad(employees: EmployeeWithRels[], weeks: Date[]): FirmWeekPoint[] {
  return weeks.map((w) => {
    let allocated = 0;
    let capacity = 0;
    for (const e of employees) {
      const load = employeeWeeklyLoad(e.weeklyCapacityHours, [w], e.allocations, e.absences)[0];
      allocated += load.allocated;
      capacity += load.capacity;
    }
    return {
      key: weekKey(w),
      label: weekLabel(w),
      allocated: Math.round(allocated),
      capacity: Math.round(capacity),
      utilizationPct: capacity > 0 ? Math.round((allocated / capacity) * 100) : 0,
    };
  });
}

export function firmWeeklyActual(employees: EmployeeWithRels[], weeks: Date[]) {
  return weeks.map((w) => {
    const wk = weekKey(w);
    let actual = 0;
    let capacity = 0;
    for (const e of employees) {
      actual += e.timeEntries.filter((t) => weekKey(t.weekStart) === wk).reduce((s, t) => s + t.hours, 0);
      capacity += Math.max(0, e.weeklyCapacityHours - absenceHoursInRange(e.absences, w, addDaysUTC(w, 7)));
    }
    return { key: wk, label: weekLabel(w), utilizationPct: capacity > 0 ? Math.round((actual / capacity) * 100) : 0 };
  });
}

export interface DisciplineLoad {
  discipline: string;
  color: string;
  allocated: number;
  capacity: number;
  headcount: number;
  utilizationPct: number;
}

export function loadByDiscipline(employees: EmployeeWithRels[], weeks: Date[]): DisciplineLoad[] {
  const weekKeys = new Set(weeks.map(weekKey));
  const map = new Map<string, DisciplineLoad>();
  for (const e of employees) {
    const m = computeEmployeeMetrics({
      weeklyCapacityHours: e.weeklyCapacityHours,
      weeks,
      allocations: filterToWeeks(e.allocations, weekKeys),
      timeEntries: [],
      absences: e.absences,
    });
    const key = e.discipline.name;
    const cur =
      map.get(key) ?? { discipline: key, color: e.discipline.color, allocated: 0, capacity: 0, headcount: 0, utilizationPct: 0 };
    cur.allocated += m.allocatedHours;
    cur.capacity += m.realCapacity;
    cur.headcount += 1;
    map.set(key, cur);
  }
  return [...map.values()]
    .map((d) => ({
      ...d,
      allocated: Math.round(d.allocated),
      capacity: Math.round(d.capacity),
      utilizationPct: d.capacity > 0 ? Math.round((d.allocated / d.capacity) * 100) : 0,
    }))
    .sort((a, b) => b.utilizationPct - a.utilizationPct);
}

// --------------------------- Tableau de bord -------------------------

export async function getDashboardData() {
  const [employees, projects] = await Promise.all([loadEmployees(), loadProjects()]);
  const now = new Date();
  const currentWeekArr = weekSeries(now, 0, 0); // semaine courante
  const next4 = weekSeries(now, 0, 3);
  const future12 = weekSeries(now, 0, 11);
  const past8 = weekSeries(now, 7, 0);

  const rosterNow = computeRoster(employees, currentWeekArr);
  const roster4 = computeRoster(employees, next4);
  const projectRows = computeProjectRows(projects);

  const totalEmployees = employees.length;
  const totalCapacity = rosterNow.reduce((s, r) => s + r.metrics.realCapacity, 0);
  const totalAllocated = rosterNow.reduce((s, r) => s + r.metrics.allocatedHours, 0);
  const avgUtilization = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;
  const overloaded = rosterNow.filter((r) => r.metrics.utilizationPct > 100);
  const available = rosterNow.filter((r) => r.metrics.utilizationPct < 85 && r.metrics.remainingHours > 1);
  const critical = rosterNow.filter((r) => r.metrics.utilizationPct > 110);

  const activeProjects = projectRows.filter((p) => ["ACTIVE", "PLANNING", "ON_HOLD"].includes(p.project.status));
  const lateProjects = projectRows.filter((p) => p.flags.includes("BEHIND_SCHEDULE"));
  const atRiskProjects = projectRows.filter((p) => p.riskScore >= 25);
  const overBudgetProjects = projectRows.filter((p) => p.flags.includes("OVER_BUDGET"));

  const sumBudgetHours = activeProjects.reduce((s, p) => s + p.project.budgetHours, 0);
  const sumConsumedHours = activeProjects.reduce((s, p) => s + p.metrics.hoursConsumed, 0);
  const budgetConsumedPct = sumBudgetHours > 0 ? (sumConsumedHours / sumBudgetHours) * 100 : 0;

  return {
    kpis: {
      totalEmployees,
      totalCapacity,
      avgUtilization,
      overloadedCount: overloaded.length,
      availableCount: available.length,
      criticalCount: critical.length,
      activeProjectsCount: activeProjects.length,
      lateProjectsCount: lateProjects.length,
      atRiskCount: atRiskProjects.length,
      overBudgetCount: overBudgetProjects.length,
      budgetConsumedPct,
    },
    chargeByDiscipline: loadByDiscipline(employees, next4),
    chargeByEmployee: roster4
      .map((r) => ({
        id: r.employee.id,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        discipline: r.employee.discipline.name,
        utilizationPct: Math.round(r.metrics.utilizationPct),
        allocated: Math.round(r.metrics.allocatedHours),
        capacity: Math.round(r.metrics.realCapacity),
        band: r.metrics.band,
      }))
      .sort((a, b) => b.utilizationPct - a.utilizationPct),
    chargeFuture: firmWeeklyLoad(employees, future12),
    utilizationTrend: firmWeeklyActual(employees, past8),
    criticalProjects: projectRows
      .filter((p) => p.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 6)
      .map((p) => ({
        id: p.project.id,
        number: p.project.number,
        name: p.project.name,
        riskScore: p.riskScore,
        flags: p.flags,
        marginPct: Math.round(p.metrics.projectedMarginPct),
        eacVariancePct: Math.round(p.metrics.eacVariancePct),
        scheduleVariancePct: Math.round(p.metrics.scheduleVariancePct),
      })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
