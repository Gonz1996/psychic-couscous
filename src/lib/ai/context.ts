// Construit le contexte d'analyse pour l'assistant (règles + LLM).
import { computeProjectRows, computeRoster, loadEmployees, loadProjects } from "@/lib/queries";
import type { EmployeeRow, ProjectRow } from "@/lib/queries";
import { weekSeries } from "@/lib/dates";

export async function getAssistantContext(): Promise<{ roster: EmployeeRow[]; projects: ProjectRow[] }> {
  const [employees, projects] = await Promise.all([loadEmployees(), loadProjects()]);
  const roster = computeRoster(employees, weekSeries(new Date(), 0, 3));
  return { roster, projects: computeProjectRows(projects) };
}

/** Instantané compact (JSON) destiné au modèle de langage. */
export function buildLLMSnapshot(roster: EmployeeRow[], projects: ProjectRow[]) {
  return {
    genereLe: new Date().toISOString(),
    periode: "4 prochaines semaines",
    employes: roster.map((r) => ({
      nom: `${r.employee.firstName} ${r.employee.lastName}`,
      poste: r.employee.title,
      discipline: r.employee.discipline.name,
      utilisationPct: Math.round(r.metrics.utilizationPct),
      disponibilitePct: Math.round(r.metrics.availabilityPct),
      heuresRestantes: Math.round(r.metrics.remainingHours),
      facturationPct: Math.round(r.metrics.billablePct),
      statut: r.flags,
    })),
    projets: projects.map((p) => ({
      numero: p.project.number,
      nom: p.project.name,
      statut: p.project.status,
      avancementPct: p.metrics.pctComplete,
      heuresConsommees: Math.round(p.metrics.hoursConsumed),
      budgetHeures: p.project.budgetHours,
      eacHeures: Math.round(p.metrics.eacHours),
      ecartEcheancierPct: Math.round(p.metrics.scheduleVariancePct),
      margeProjeteePct: Math.round(p.metrics.projectedMarginPct),
      risque: p.riskScore,
      drapeaux: p.flags,
    })),
  };
}
