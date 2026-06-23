// =====================================================================
// Moteur de cascade budgétaire — planification financière.
// Fonctions PURES (utilisables côté serveur ET client pour le live recalc).
//
//   Honoraires
//     − Profit cible − Frais généraux − Réserve de risque
//     = Budget de production           (seul montant convertible en heures)
//        × % discipline = Budget discipline
//           × % employé = Budget employé
//              ÷ taux chargé   = Heures prévues
//                 ÷ productivité = Heures ajustées
// =====================================================================

export interface FinancialParams {
  targetProfitPct: number;
  overheadPct: number;
  riskReservePct: number;
}

export const DEFAULT_PARAMS: FinancialParams = {
  targetProfitPct: 30,
  overheadPct: 10,
  riskReservePct: 5,
};

export const totalFees = (feeDesign: number, feeSupervision: number) =>
  (feeDesign || 0) + (feeSupervision || 0);

/** Budget de production = honoraires × (1 − profit% − frais% − réserve%). */
export function productionBudget(fees: number, p: FinancialParams): number {
  const deductions = (p.targetProfitPct + p.overheadPct + p.riskReservePct) / 100;
  return Math.max(0, (fees || 0) * (1 - deductions));
}

export const disciplineBudget = (prod: number, effortPct: number) => prod * ((effortPct || 0) / 100);
export const employeeBudget = (discBudget: number, effortPct: number) => discBudget * ((effortPct || 0) / 100);
export const plannedHours = (empBudget: number, loadedRate: number) =>
  loadedRate > 0 ? empBudget / loadedRate : 0;
export const adjustedHours = (planned: number, productivity: number) =>
  productivity > 0 ? planned / productivity : planned;

// --------------------------- Plan complet ----------------------------

export interface PlanDisciplineInput {
  disciplineId: string;
  effortPct: number;
}
export interface PlanStaffingInput {
  disciplineId: string;
  employeeId: string;
  effortPct: number;
}
export interface EmployeeRates {
  id: string;
  loadedRate: number; // costRate ($/h chargé)
  productivity: number;
}

export interface ComputedStaffing {
  disciplineId: string;
  employeeId: string;
  effortPct: number;
  budget: number;
  plannedHours: number;
  adjustedHours: number;
}
export interface ComputedDiscipline {
  disciplineId: string;
  effortPct: number;
  budget: number;
  staffing: ComputedStaffing[];
  staffingSumPct: number;
  staffingValid: boolean;
}
export interface ComputedPlan {
  fees: number;
  productionBudget: number;
  reserved: { profit: number; overhead: number; risk: number };
  disciplines: ComputedDiscipline[];
  disciplineSumPct: number;
  disciplineValid: boolean;
  totalPlannedHours: number;
  totalAdjustedHours: number;
  totalBudgetUsed: number;
  valid: boolean;
}

const near100 = (n: number) => Math.abs(n - 100) < 0.5;

export function computePlan(
  fees: number,
  params: FinancialParams,
  disciplines: PlanDisciplineInput[],
  staffing: PlanStaffingInput[],
  employees: EmployeeRates[],
): ComputedPlan {
  const prod = productionBudget(fees, params);
  const empMap = new Map(employees.map((e) => [e.id, e]));
  const disciplineSumPct = disciplines.reduce((s, d) => s + (d.effortPct || 0), 0);

  const computedDisciplines: ComputedDiscipline[] = disciplines.map((d) => {
    const budget = disciplineBudget(prod, d.effortPct);
    const rows = staffing.filter((s) => s.disciplineId === d.disciplineId);
    const staffingSumPct = rows.reduce((s, r) => s + (r.effortPct || 0), 0);
    const computedStaffing = rows.map((r) => {
      const emp = empMap.get(r.employeeId);
      const b = employeeBudget(budget, r.effortPct);
      const ph = plannedHours(b, emp?.loadedRate ?? 0);
      const ah = adjustedHours(ph, emp?.productivity ?? 1);
      return {
        disciplineId: r.disciplineId,
        employeeId: r.employeeId,
        effortPct: r.effortPct,
        budget: b,
        plannedHours: ph,
        adjustedHours: ah,
      };
    });
    return {
      disciplineId: d.disciplineId,
      effortPct: d.effortPct,
      budget,
      staffing: computedStaffing,
      staffingSumPct,
      staffingValid: rows.length === 0 || near100(staffingSumPct),
    };
  });

  const sum = (fn: (s: ComputedStaffing) => number) =>
    computedDisciplines.reduce((acc, d) => acc + d.staffing.reduce((a, x) => a + fn(x), 0), 0);

  const disciplineValid = disciplines.length === 0 || near100(disciplineSumPct);
  const allStaffingValid = computedDisciplines.every((d) => d.staffingValid);

  return {
    fees,
    productionBudget: prod,
    reserved: {
      profit: (fees || 0) * (params.targetProfitPct / 100),
      overhead: (fees || 0) * (params.overheadPct / 100),
      risk: (fees || 0) * (params.riskReservePct / 100),
    },
    disciplines: computedDisciplines,
    disciplineSumPct,
    disciplineValid,
    totalPlannedHours: sum((x) => x.plannedHours),
    totalAdjustedHours: sum((x) => x.adjustedHours),
    totalBudgetUsed: sum((x) => x.budget),
    valid: disciplineValid && allStaffingValid,
  };
}
