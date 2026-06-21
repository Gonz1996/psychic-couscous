// =====================================================================
// Planification de capacité : matrice hebdomadaire + prévisions.
// =====================================================================
import { computeRoster, loadEmployees } from "./queries";
import { employeeWeeklyLoad } from "./metrics";
import { monthLabel, weekKey, weekLabel, weekSeries } from "./dates";
import type { RagBand } from "./thresholds";

export interface CapacityCell {
  key: string;
  label: string;
  allocated: number;
  capacity: number;
  utilizationPct: number;
  band: RagBand;
}

export interface CapacityRowDTO {
  id: string;
  name: string;
  discipline: string;
  color: string;
  weeklyCapacity: number;
  totalAllocated: number;
  totalCapacity: number;
  avgUtilization: number;
  cells: CapacityCell[];
}

export interface WeekHeader {
  key: string;
  label: string;
  month: string;
}

export interface CapacityMatrixDTO {
  weeks: WeekHeader[];
  rows: CapacityRowDTO[];
}

export async function getCapacityMatrix(weeksFwd = 12): Promise<CapacityMatrixDTO> {
  const employees = await loadEmployees();
  const weeks = weekSeries(new Date(), 0, weeksFwd - 1);
  const rows = employees
    .map((e) => {
      const load = employeeWeeklyLoad(e.weeklyCapacityHours, weeks, e.allocations, e.absences);
      const totalAllocated = load.reduce((s, c) => s + c.allocated, 0);
      const totalCapacity = load.reduce((s, c) => s + c.capacity, 0);
      return {
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        discipline: e.discipline.name,
        color: e.discipline.color,
        weeklyCapacity: e.weeklyCapacityHours,
        totalAllocated: Math.round(totalAllocated),
        totalCapacity: Math.round(totalCapacity),
        avgUtilization: totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0,
        cells: load.map((c) => ({
          key: c.key,
          label: weekLabel(c.weekStart),
          allocated: Math.round(c.allocated * 10) / 10,
          capacity: Math.round(c.capacity * 10) / 10,
          utilizationPct: Math.round(c.utilizationPct),
          band: c.band,
        })),
      };
    })
    .sort((a, b) => a.discipline.localeCompare(b.discipline) || b.avgUtilization - a.avgUtilization);

  return {
    weeks: weeks.map((w) => ({ key: weekKey(w), label: weekLabel(w), month: monthLabel(w) })),
    rows,
  };
}

export interface ForecastHorizon {
  weeks: number;
  capacity: number;
  allocated: number;
  available: number;
  utilizationPct: number;
  overloaded: number;
  availableEmp: number;
}

export async function getForecast(horizons = [4, 8, 12]): Promise<ForecastHorizon[]> {
  const employees = await loadEmployees();
  return horizons.map((h) => {
    const weeks = weekSeries(new Date(), 0, h - 1);
    const roster = computeRoster(employees, weeks);
    const capacity = roster.reduce((s, r) => s + r.metrics.realCapacity, 0);
    const allocated = roster.reduce((s, r) => s + r.metrics.allocatedHours, 0);
    return {
      weeks: h,
      capacity: Math.round(capacity),
      allocated: Math.round(allocated),
      available: Math.round(capacity - allocated),
      utilizationPct: capacity > 0 ? Math.round((allocated / capacity) * 100) : 0,
      overloaded: roster.filter((r) => r.metrics.utilizationPct > 100).length,
      availableEmp: roster.filter((r) => r.metrics.utilizationPct < 85 && r.metrics.remainingHours > 1).length,
    };
  });
}

/** Recalcule utilisation + bande pour une cellule (utilisé par la simulation client). */
export function recomputeUtilization(allocated: number, capacity: number) {
  const pct = capacity > 0 ? (allocated / capacity) * 100 : allocated > 0 ? 999 : 0;
  return Math.round(pct);
}
