"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";
import { weekStartUTC } from "@/lib/dates";

export type FormState = { error?: string; ok?: boolean } | undefined;

export async function saveTimesheet(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const employeeId = String(formData.get("employeeId") || "");
  const weekStartStr = String(formData.get("weekStart") || "");
  const projectIds = String(formData.get("projectIds") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!employeeId || !weekStartStr) return { error: "Employé ou semaine manquant." };
  const weekStart = weekStartUTC(new Date(weekStartStr));

  for (const pid of projectIds) {
    const hours = Math.max(0, Number(formData.get(`hours_${pid}`) || 0));
    const billable = formData.get(`billable_${pid}`) === "on";
    const existing = await prisma.timeEntry.findFirst({ where: { employeeId, projectId: pid, weekStart } });
    if (hours <= 0) {
      if (existing) await prisma.timeEntry.delete({ where: { id: existing.id } });
    } else if (existing) {
      await prisma.timeEntry.update({ where: { id: existing.id }, data: { hours, billable } });
    } else {
      await prisma.timeEntry.create({ data: { employeeId, projectId: pid, weekStart, hours, billable } });
    }
  }

  revalidatePath("/saisie");
  revalidatePath("/dashboard");
  revalidatePath("/employes");
  return { ok: true };
}
