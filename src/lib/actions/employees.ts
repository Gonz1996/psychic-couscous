"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const schema = z.object({
  firstName: z.string().min(1, "Requis"),
  lastName: z.string().min(1, "Requis"),
  email: z.string().regex(/.+@.+\..+/, "Courriel invalide"),
  employeeNo: z.string().min(1, "Requis"),
  title: z.string().min(1, "Requis"),
  disciplineId: z.string().min(1, "Requis"),
  officeId: z.string().min(1, "Requis"),
  managerId: z.string().optional(),
  weeklyCapacityHours: z.coerce.number().min(0).max(80),
  billableTargetPct: z.coerce.number().int().min(0).max(100),
  costRate: z.coerce.number().min(0),
  billRate: z.coerce.number().min(0),
  hireDate: z.string().min(1, "Requis"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "");
    if (k && !out[k]) out[k] = i.message;
  }
  return out;
}

function toData(d: z.infer<typeof schema>) {
  return {
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    employeeNo: d.employeeNo,
    title: d.title,
    disciplineId: d.disciplineId,
    officeId: d.officeId,
    managerId: d.managerId ? d.managerId : null,
    weeklyCapacityHours: d.weeklyCapacityHours,
    billableTargetPct: d.billableTargetPct,
    costRate: d.costRate,
    billRate: d.billRate,
    hireDate: new Date(d.hireDate),
    status: d.status,
  };
}

export async function createEmployee(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Veuillez corriger les champs indiqués.", fieldErrors: fieldErrors(parsed.error) };
  try {
    await prisma.employee.create({ data: toData(parsed.data) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Matricule ou courriel déjà utilisé." };
    throw e;
  }
  revalidatePath("/employes");
  redirect("/employes");
}

export async function updateEmployee(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Veuillez corriger les champs indiqués.", fieldErrors: fieldErrors(parsed.error) };
  try {
    await prisma.employee.update({ where: { id }, data: toData(parsed.data) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Matricule ou courriel déjà utilisé." };
    throw e;
  }
  revalidatePath("/employes");
  revalidatePath(`/employes/${id}`);
  redirect(`/employes/${id}`);
}
