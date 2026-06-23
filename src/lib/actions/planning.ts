"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";
import { totalFees } from "@/lib/finance";

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
