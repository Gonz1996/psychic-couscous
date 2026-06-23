"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const schema = z.object({
  number: z.string().min(1, "Requis"),
  name: z.string().min(1, "Requis"),
  clientId: z.string().min(1, "Requis"),
  disciplineId: z.string().min(1, "Requis"),
  projectManagerId: z.string().min(1, "Requis"),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  budgetHours: z.coerce.number().min(0),
  budgetFees: z.coerce.number().min(0),
  percentComplete: z.coerce.number().int().min(0).max(100),
  startDate: z.string().min(1, "Requis"),
  endDate: z.string().min(1, "Requis"),
});

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "");
    if (k && !out[k]) out[k] = i.message;
  }
  return out;
}

function toData(d: z.infer<typeof schema>, fd: FormData) {
  return {
    number: d.number,
    name: d.name,
    clientId: d.clientId,
    disciplineId: d.disciplineId,
    projectManagerId: d.projectManagerId,
    status: d.status,
    budgetHours: d.budgetHours,
    budgetFees: d.budgetFees,
    percentComplete: d.percentComplete,
    inConception: fd.get("inConception") === "on",
    inSurveillance: fd.get("inSurveillance") === "on",
    startDate: new Date(d.startDate),
    endDate: new Date(d.endDate),
  };
}

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Veuillez corriger les champs indiqués.", fieldErrors: fieldErrors(parsed.error) };
  try {
    await prisma.project.create({ data: toData(parsed.data, formData) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Ce numéro de projet existe déjà." };
    throw e;
  }
  revalidatePath("/projets");
  redirect("/projets");
}

export async function updateProject(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Veuillez corriger les champs indiqués.", fieldErrors: fieldErrors(parsed.error) };
  try {
    await prisma.project.update({ where: { id }, data: toData(parsed.data, formData) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Ce numéro de projet existe déjà." };
    throw e;
  }
  revalidatePath("/projets");
  revalidatePath(`/projets/${id}`);
  redirect(`/projets/${id}`);
}
