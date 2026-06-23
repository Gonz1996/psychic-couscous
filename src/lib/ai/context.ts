// Construit le contexte d'analyse pour l'assistant (règles + LLM).
import {
  computeProjectRows,
  computeRoster,
  loadEmployees,
  loadProjects,
  getFirmFinance,
  getDisciplineCapacity,
} from "@/lib/queries";
import type { EmployeeRow, ProjectRow, FirmFinance, DisciplineCapacity } from "@/lib/queries";
import { weekSeries } from "@/lib/dates";

export interface AssistantContext {
  roster: EmployeeRow[];
  projects: ProjectRow[];
  firm: FirmFinance;
  disciplines: DisciplineCapacity[];
}

export async function getAssistantContext(): Promise<AssistantContext> {
  const [employees, projects, firm, disciplines] = await Promise.all([
    loadEmployees(),
    loadProjects(),
    getFirmFinance(),
    getDisciplineCapacity(),
  ]);
  const roster = computeRoster(employees, weekSeries(new Date(), 0, 3));
  return { roster, projects: computeProjectRows(projects), firm, disciplines };
}

/** Instantané compact (JSON) destiné au modèle de langage. */
export function buildLLMSnapshot(
  roster: EmployeeRow[],
  projects: ProjectRow[],
  firm?: FirmFinance,
  disciplines?: DisciplineCapacity[],
) {
  return {
    genereLe: new Date().toISOString(),
    objectifMarge: "≥ 30 % par projet",
    firme: firm && {
      periode: firm.periodLabel,
      revenuTotal: Math.round(firm.totalRevenue),
      depensesTotal: Math.round(firm.totalExpenses),
      resultatNet: Math.round(firm.netResult),
      obligationsFiscales: Math.round(firm.totalObligations),
      resultatNetApresObligations: Math.round(firm.afterObligations),
    },
    capaciteParDiscipline: disciplines?.map((d) => ({
      discipline: d.discipline,
      effectif: d.headcount,
      capaciteHebdo: d.weeklyCapacity,
      tauxChargeMoyen: d.avgLoadedRate,
      utilisationRecentePct: d.recentUtilizationPct,
      dispoHebdo: d.availableWeeklyHours,
    })),
    employes: roster.map((r) => ({
      nom: `${r.employee.firstName} ${r.employee.lastName}`,
      poste: r.employee.title,
      discipline: r.employee.discipline.name,
      tauxChargeHoraire: r.employee.costRate,
      utilisationPct: Math.round(r.metrics.utilizationPct),
      disponibilitePct: Math.round(r.metrics.availabilityPct),
      heuresRestantes: Math.round(r.metrics.remainingHours),
      facturationPct: Math.round(r.metrics.billablePct),
      statut: r.flags,
    })),
    projets: projects.map((p) => {
      const profit = p.project.budgetFees - p.project.actualCost;
      return {
        numero: p.project.number,
        nom: p.project.name,
        client: p.project.client.name,
        phase: [p.project.inConception && "conception", p.project.inSurveillance && "surveillance"].filter(Boolean).join("+") || "non spécifié",
        statut: p.project.status,
        honoraires: Math.round(p.project.budgetFees),
        coutReel: Math.round(p.project.actualCost),
        profitReel: Math.round(profit),
        margeReellePct: p.project.budgetFees > 0 ? Math.round((profit / p.project.budgetFees) * 100) : null,
        avancementPct: p.metrics.pctComplete,
        heuresConsommees: Math.round(p.metrics.hoursConsumed),
        margeProjeteePct: Math.round(p.metrics.projectedMarginPct),
        ecartEcheancierPct: Math.round(p.metrics.scheduleVariancePct),
        risque: p.riskScore,
        drapeaux: p.flags,
      };
    }),
  };
}
