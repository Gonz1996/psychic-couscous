"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";

export type FormState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis").max(12, "Code trop long"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide (#RRGGBB)"),
});

function revalidate() {
  revalidatePath("/disciplines");
  revalidatePath("/employes");
  revalidatePath("/projets");
}

export async function createDiscipline(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  try {
    await prisma.discipline.create({
      data: { name: parsed.data.name, code: parsed.data.code.toUpperCase(), color: parsed.data.color },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Nom ou code déjà utilisé." };
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function updateDiscipline(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  try {
    await prisma.discipline.update({
      where: { id },
      data: { name: parsed.data.name, code: parsed.data.code.toUpperCase(), color: parsed.data.color },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Nom ou code déjà utilisé." };
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function deleteDiscipline(id: string): Promise<FormState> {
  await requireWrite();
  const [employees, projects] = await Promise.all([
    prisma.employee.count({ where: { disciplineId: id } }),
    prisma.project.count({ where: { disciplineId: id } }),
  ]);
  if (employees + projects > 0)
    return { error: `Impossible de supprimer : utilisée par ${employees} employé(s) et ${projects} projet(s).` };
  await prisma.discipline.delete({ where: { id } });
  revalidate();
  return { ok: true };
}
