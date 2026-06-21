"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";
import { addWeeksUTC, weekStartUTC } from "@/lib/dates";

export type FormState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  employeeId: z.string().min(1, "Employé requis"),
  hoursPerWeek: z.coerce.number().min(0).max(80),
  startWeek: z.string().min(1, "Semaine de début requise"),
  numWeeks: z.coerce.number().int().min(1).max(52),
});

export async function assignAllocation(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  const { employeeId, hoursPerWeek, startWeek, numWeeks } = parsed.data;
  const start = weekStartUTC(new Date(startWeek));

  for (let i = 0; i < numWeeks; i++) {
    const weekStart = addWeeksUTC(start, i);
    if (hoursPerWeek <= 0) {
      await prisma.allocation.deleteMany({ where: { projectId, employeeId, weekStart } });
    } else {
      await prisma.allocation.upsert({
        where: { employeeId_projectId_weekStart: { employeeId, projectId, weekStart } },
        update: { hours: hoursPerWeek },
        create: { employeeId, projectId, weekStart, hours: hoursPerWeek },
      });
    }
  }

  revalidatePath(`/projets/${projectId}`);
  revalidatePath("/capacite");
  revalidatePath("/employes");
  revalidatePath("/dashboard");
  return { ok: true };
}
