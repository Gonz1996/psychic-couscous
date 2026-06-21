// =====================================================================
// Détections automatiques de risques (employés et projets).
// =====================================================================
import { THRESHOLDS } from "./thresholds";
import type { EmployeeMetrics, ProjectMetrics } from "./metrics";

export type EmployeeFlag = "CRITICAL_OVERLOAD" | "OVERLOADED" | "UNDERUTILIZED" | "AVAILABLE";

export function employeeFlags(m: EmployeeMetrics): EmployeeFlag[] {
  const flags: EmployeeFlag[] = [];
  if (m.utilizationPct > THRESHOLDS.CRITICAL_PCT) flags.push("CRITICAL_OVERLOAD");
  else if (m.utilizationPct > THRESHOLDS.OVERLOAD_PCT) flags.push("OVERLOADED");
  if (m.utilizationPct < THRESHOLDS.UNDERUTILIZED_PCT) flags.push("UNDERUTILIZED");
  if (m.remainingHours > 1 && m.utilizationPct <= THRESHOLDS.OVERLOAD_PCT) flags.push("AVAILABLE");
  return flags;
}

export type ProjectFlag = "OVER_BUDGET" | "BEHIND_SCHEDULE" | "UNDERESTIMATED" | "RESOURCE_SHORTAGE";

export function projectFlags(
  m: ProjectMetrics,
  opts: { status: string; futureAllocatedHours: number },
): ProjectFlag[] {
  const flags: ProjectFlag[] = [];
  const active = opts.status === "ACTIVE" || opts.status === "PLANNING" || opts.status === "ON_HOLD";

  if (m.pctHoursUsed > 100 || m.eacVariancePct > THRESHOLDS.EAC_OVERRUN_PCT) flags.push("OVER_BUDGET");
  if (active && (m.scheduleVariancePct < -THRESHOLDS.SCHEDULE_SLIP_PCT || (m.daysToDeadline < 0 && m.pctComplete < 100)))
    flags.push("BEHIND_SCHEDULE");
  if (m.eacVariancePct > THRESHOLDS.UNDERESTIMATE_PCT && m.pctComplete < 90) flags.push("UNDERESTIMATED");
  if (active && m.hoursRemaining > 0 && opts.futureAllocatedHours < m.hoursRemaining * 0.8)
    flags.push("RESOURCE_SHORTAGE");

  return flags;
}

/** Score de risque projet (0–100) pour trier les « projets critiques ». */
export function projectRiskScore(m: ProjectMetrics, flags: ProjectFlag[]): number {
  let score = 0;
  if (flags.includes("OVER_BUDGET")) score += 25 + Math.min(25, Math.max(0, m.eacVariancePct));
  if (flags.includes("BEHIND_SCHEDULE")) score += 25 + Math.min(20, Math.abs(Math.min(0, m.scheduleVariancePct)));
  if (flags.includes("UNDERESTIMATED")) score += 15;
  if (flags.includes("RESOURCE_SHORTAGE")) score += 15;
  if (m.projectedMarginPct < 0) score += 15;
  return Math.round(Math.min(100, score));
}

export type Severity = "critical" | "warning" | "info" | "ok";

export function employeeSeverity(flags: EmployeeFlag[]): Severity {
  if (flags.includes("CRITICAL_OVERLOAD")) return "critical";
  if (flags.includes("OVERLOADED")) return "warning";
  if (flags.includes("UNDERUTILIZED")) return "info";
  return "ok";
}

export function projectSeverity(score: number): Severity {
  if (score >= 50) return "critical";
  if (score >= 25) return "warning";
  if (score > 0) return "info";
  return "ok";
}
