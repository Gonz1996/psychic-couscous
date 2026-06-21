// =====================================================================
// Moteur de calculs métier — cœur du Resource Command Center.
// Fonctions pures : prennent des données brutes, renvoient des indicateurs.
// =====================================================================
import { addDaysUTC, businessDaysBetween, businessDaysOverlap, weekKey, weekStartUTC } from "./dates";
import { utilizationBand, type RagBand } from "./thresholds";

export interface HoursRow {
  weekStart: Date | string;
  hours: number;
  billable?: boolean;
}

export interface AbsenceRow {
  startDate: Date | string;
  endDate: Date | string;
  hours: number;
  type?: string;
}

const sum = (rows: { hours: number }[]) => rows.reduce((s, r) => s + (r.hours || 0), 0);

/** Heures d'absence tombant dans [start, end) (réparties au prorata des jours ouvrables). */
export function absenceHoursInRange(absences: AbsenceRow[], start: Date, end: Date): number {
  const lastDay = addDaysUTC(end, -1); // borne inclusive
  let total = 0;
  for (const a of absences) {
    const aStart = new Date(a.startDate);
    const aEnd = new Date(a.endDate);
    const bizTotal = businessDaysBetween(aStart, aEnd);
    if (bizTotal <= 0) continue;
    const perDay = a.hours / bizTotal;
    total += businessDaysOverlap(aStart, aEnd, start, lastDay) * perDay;
  }
  return total;
}

// --------------------------- Employés --------------------------------

export interface EmployeeMetricsInput {
  weeklyCapacityHours: number;
  weeks: Date[]; // lundis de la période
  allocations: HoursRow[]; // déjà filtrées à la période
  timeEntries: HoursRow[]; // déjà filtrées à la période
  absences: AbsenceRow[]; // chevauchant la période
}

export interface EmployeeMetrics {
  weeks: number;
  nominalCapacity: number;
  absenceHours: number;
  realCapacity: number; // disponibilité réelle (capacité − absences)
  allocatedHours: number; // heures assignées
  actualHours: number; // heures réalisées
  billableHours: number;
  remainingHours: number; // heures restantes disponibles
  utilizationPct: number; // utilisation %
  availabilityPct: number; // disponibilité %
  billablePct: number; // facturation %
  band: RagBand;
}

export function computeEmployeeMetrics(input: EmployeeMetricsInput): EmployeeMetrics {
  const weeks = input.weeks.length || 1;
  const nominalCapacity = input.weeklyCapacityHours * weeks;
  const periodStart = input.weeks[0] ?? weekStartUTC(new Date());
  const periodEnd = addDaysUTC(input.weeks[input.weeks.length - 1] ?? periodStart, 7);
  const absenceHours = absenceHoursInRange(input.absences, periodStart, periodEnd);
  const realCapacity = Math.max(0, nominalCapacity - absenceHours);
  const allocatedHours = sum(input.allocations);
  const actualHours = sum(input.timeEntries);
  const billableHours = sum(input.timeEntries.filter((t) => t.billable !== false));
  const remainingHours = realCapacity - allocatedHours;
  const utilizationPct =
    realCapacity > 0 ? (allocatedHours / realCapacity) * 100 : allocatedHours > 0 ? 999 : 0;
  const availabilityPct = realCapacity > 0 ? (remainingHours / realCapacity) * 100 : 0;
  const billablePct = actualHours > 0 ? (billableHours / actualHours) * 100 : 0;

  return {
    weeks,
    nominalCapacity,
    absenceHours,
    realCapacity,
    allocatedHours,
    actualHours,
    billableHours,
    remainingHours,
    utilizationPct,
    availabilityPct,
    billablePct,
    band: utilizationBand(utilizationPct),
  };
}

export interface WeekLoad {
  weekStart: Date;
  key: string;
  capacity: number;
  allocated: number;
  utilizationPct: number;
  band: RagBand;
}

/** Charge semaine par semaine (pour la heatmap de capacité). */
export function employeeWeeklyLoad(
  weeklyCapacityHours: number,
  weeks: Date[],
  allocations: HoursRow[],
  absences: AbsenceRow[],
): WeekLoad[] {
  return weeks.map((w) => {
    const wEnd = addDaysUTC(w, 7);
    const absence = absenceHoursInRange(absences, w, wEnd);
    const capacity = Math.max(0, weeklyCapacityHours - absence);
    const allocated = sum(allocations.filter((a) => weekKey(a.weekStart) === weekKey(w)));
    const utilizationPct =
      capacity > 0 ? (allocated / capacity) * 100 : allocated > 0 ? 999 : 0;
    return {
      weekStart: w,
      key: weekKey(w),
      capacity,
      allocated,
      utilizationPct,
      band: utilizationBand(utilizationPct),
    };
  });
}

// --------------------------- Projets ---------------------------------

export interface ProjectMetricsInput {
  budgetHours: number;
  budgetFees: number;
  percentComplete: number;
  startDate: Date | string;
  endDate: Date | string;
  timeEntries: { hours: number; costRate?: number }[];
  today?: Date;
}

export interface ProjectMetrics {
  hoursConsumed: number;
  hoursRemaining: number;
  pctHoursUsed: number;
  pctComplete: number;
  budgetVariancePct: number; // % heures utilisées − % avancement (+ = consomme trop vite)
  eacHours: number; // prévision à terminaison (heures)
  eacVarianceHours: number;
  eacVariancePct: number;
  timeElapsedPct: number;
  scheduleVariancePct: number; // avancement − temps écoulé (− = en retard)
  costToDate: number;
  projectedCost: number;
  earnedFees: number;
  marginToDatePct: number;
  projectedMargin: number;
  projectedMarginPct: number; // rentabilité projetée
  daysToDeadline: number;
}

export function computeProjectMetrics(input: ProjectMetricsInput): ProjectMetrics {
  const today = input.today ?? new Date();
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  const hoursConsumed = input.timeEntries.reduce((s, t) => s + (t.hours || 0), 0);
  const hoursRemaining = input.budgetHours - hoursConsumed;
  const pctHoursUsed = input.budgetHours > 0 ? (hoursConsumed / input.budgetHours) * 100 : 0;
  const pctComplete = input.percentComplete;
  const budgetVariancePct = pctHoursUsed - pctComplete;

  const eacHours =
    pctComplete >= 5 ? hoursConsumed / (pctComplete / 100) : Math.max(input.budgetHours, hoursConsumed);
  const eacVarianceHours = eacHours - input.budgetHours;
  const eacVariancePct = input.budgetHours > 0 ? (eacVarianceHours / input.budgetHours) * 100 : 0;

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = today.getTime() - start.getTime();
  const timeElapsedPct = totalMs <= 0 ? 100 : Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  const scheduleVariancePct = pctComplete - timeElapsedPct;

  const costToDate = input.timeEntries.reduce((s, t) => s + (t.hours || 0) * (t.costRate || 0), 0);
  const blended = hoursConsumed > 0 ? costToDate / hoursConsumed : 0;
  const projectedCost = eacHours * blended;
  const earnedFees = input.budgetFees * (pctComplete / 100);
  const marginToDatePct = earnedFees > 0 ? ((earnedFees - costToDate) / earnedFees) * 100 : 0;
  const projectedMargin = input.budgetFees - projectedCost;
  const projectedMarginPct = input.budgetFees > 0 ? (projectedMargin / input.budgetFees) * 100 : 0;

  const daysToDeadline = Math.round((end.getTime() - today.getTime()) / 86_400_000);

  return {
    hoursConsumed,
    hoursRemaining,
    pctHoursUsed,
    pctComplete,
    budgetVariancePct,
    eacHours,
    eacVarianceHours,
    eacVariancePct,
    timeElapsedPct,
    scheduleVariancePct,
    costToDate,
    projectedCost,
    earnedFees,
    marginToDatePct,
    projectedMargin,
    projectedMarginPct,
    daysToDeadline,
  };
}

export const clampPct = (n: number) => Math.max(0, Math.min(100, n));
