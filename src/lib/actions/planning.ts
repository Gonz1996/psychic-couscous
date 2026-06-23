"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";
import { computePlan, totalFees, type FinancialParams } from "@/lib/finance";
import { addWeeksUTC, weekStartUTC } from "@/lib/dates";
import { distributeHours, type LoadCurve } from "@/lib/scheduling";

export interface PlanPayload {
  feeDesign: number;
  feeSupervision: number;
  targetProfitPct: number;
  overheadPct: number;
  riskReservePct: number;
  directorId: string | null;
  disciplines: { disciplineId: string; effortPct: number }[];
  staffing: { disciplineId: string; employeeId: string; effortPct: number }[];
}

export async function saveProjectPlan(
  projectId: string,
  plan: PlanPayload,
): Promise<{ ok: boolean; error?: string }> {
  await requireWrite();
  try {
    const fees = totalFees(plan.feeDesign, plan.feeSupervision);
    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: {
          feeDesign: plan.feeDesign || 0,
          feeSupervision: plan.feeSupervision || 0,
          budgetFees: fees,
          targetProfitPct: Math.round(plan.targetProfitPct),
          overheadPct: Math.round(plan.overheadPct),
          riskReservePct: Math.round(plan.riskReservePct),
          directorId: plan.directorId || null,
        },
      }),
      prisma.projectDiscipline.deleteMany({ where: { projectId } }),
      prisma.projectStaffing.deleteMany({ where: { projectId } }),
      prisma.projectDiscipline.createMany({
        data: plan.disciplines
          .filter((d) => d.disciplineId && d.effortPct > 0)
          .map((d) => ({ projectId, disciplineId: d.disciplineId, effortPct: d.effortPct })),
      }),
      prisma.projectStaffing.createMany({
        data: plan.staffing
          .filter((s) => s.disciplineId && s.employeeId && s.effortPct > 0)
          .map((s) => ({
            projectId,
            disciplineId: s.disciplineId,
            employeeId: s.employeeId,
            effortPct: s.effortPct,
          })),
      }),
    ]);
    revalidatePath(`/projets/${projectId}`);
    revalidatePath(`/projets/${projectId}/planification`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur lors de l'enregistrement du plan." };
  }
}

// =====================================================================
// Génération des affectations hebdomadaires (Allocation) à partir du plan
// enregistré : les heures ajustées de chaque employé sont étalées entre la
// date de début et la date de fin du projet selon une courbe de charge.
// =====================================================================

export interface GenerateResult {
  ok: boolean;
  error?: string;
  count?: number; // nombre d'Allocation créées
  totalHours?: number;
  weeks?: number;
  employees?: number;
}

export async function generateAllocations(projectId: string, curve: LoadCurve): Promise<GenerateResult> {
  try {
    await requireWrite();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { projectDisciplines: true, staffings: true },
    });
    if (!project) return { ok: false, error: "Projet introuvable." };
    if (project.staffings.length === 0)
      return { ok: false, error: "Aucune équipe planifiée. Enregistrez d'abord le plan (répartition par employé)." };

    // Recompute la cascade pour obtenir les heures ajustées par employé.
    const empIds = [...new Set(project.staffings.map((s) => s.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: empIds } },
      select: { id: true, costRate: true, productivityFactor: true },
    });
    const params: FinancialParams = {
      targetProfitPct: project.targetProfitPct,
      overheadPct: project.overheadPct,
      riskReservePct: project.riskReservePct,
    };
    const plan = computePlan(
      totalFees(project.feeDesign, project.feeSupervision),
      params,
      project.projectDisciplines.map((d) => ({ disciplineId: d.disciplineId, effortPct: d.effortPct })),
      project.staffings.map((s) => ({ disciplineId: s.disciplineId, employeeId: s.employeeId, effortPct: s.effortPct })),
      employees.map((e) => ({ id: e.id, loadedRate: e.costRate, productivity: e.productivityFactor })),
    );

    // Total des heures ajustées par employé (un employé peut servir plusieurs disciplines).
    const hoursByEmp = new Map<string, number>();
    for (const d of plan.disciplines) {
      for (const s of d.staffing) {
        hoursByEmp.set(s.employeeId, (hoursByEmp.get(s.employeeId) ?? 0) + s.adjustedHours);
      }
    }
    const totalAdjusted = [...hoursByEmp.values()].reduce((s, x) => s + x, 0);
    if (totalAdjusted < 0.01)
      return { ok: false, error: "0 heure à répartir. Vérifiez les honoraires, les % et les taux horaires chargés des employés." };

    // Semaines (lundis) entre début et fin du projet, bornes incluses.
    const weeks: Date[] = [];
    let w = weekStartUTC(project.startDate);
    const last = weekStartUTC(project.endDate);
    while (w.getTime() <= last.getTime()) {
      weeks.push(w);
      w = addWeeksUTC(w, 1);
    }
    if (weeks.length === 0) weeks.push(weekStartUTC(project.startDate));

    // Répartition par courbe → Allocation agrégées par (employé, semaine).
    const note = `Généré — courbe ${curve}`;
    const rows: { employeeId: string; projectId: string; weekStart: Date; hours: number; note: string }[] = [];
    for (const [employeeId, total] of hoursByEmp) {
      if (total < 0.01) continue;
      const dist = distributeHours(total, weeks.length, curve);
      dist.forEach((hours, i) => {
        if (hours >= 0.01) rows.push({ employeeId, projectId, weekStart: weeks[i], hours, note });
      });
    }

    await prisma.$transaction([
      prisma.allocation.deleteMany({ where: { projectId } }),
      prisma.allocation.createMany({ data: rows }),
    ]);

    revalidatePath(`/projets/${projectId}/planification`);
    revalidatePath(`/projets/${projectId}`);
    revalidatePath("/capacite");
    revalidatePath("/dashboard");
    return {
      ok: true,
      count: rows.length,
      totalHours: Math.round(totalAdjusted),
      weeks: weeks.length,
      employees: hoursByEmp.size,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur lors de la génération des affectations." };
  }
}
