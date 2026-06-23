"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export type FormState = { error?: string; ok?: boolean } | undefined;

const ROLES = ["ADMIN", "MANAGER", "VIEWER"] as const;

const createSchema = z.object({
  email: z.string().email("Courriel invalide"),
  name: z.string().min(1, "Nom requis"),
  role: z.enum(ROLES),
  password: z.string().min(6, "Mot de passe d'au moins 6 caractères"),
  employeeId: z.string().optional(),
});

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  const d = parsed.data;
  try {
    await prisma.user.create({
      data: {
        email: d.email.trim().toLowerCase(),
        name: d.name,
        role: d.role,
        passwordHash: await bcrypt.hash(d.password, 10),
        employeeId: d.employeeId || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Ce courriel (ou cet employé) a déjà un compte." };
    throw e;
  }
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function setUserRole(id: string, role: string): Promise<FormState> {
  const admin = await requireAdmin();
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { error: "Rôle invalide." };
  // Empêche de se retirer soi-même le dernier accès ADMIN.
  if (admin.id === id && role !== "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return { error: "Vous êtes le seul administrateur — gardez au moins un compte ADMIN." };
  }
  await prisma.user.update({ where: { id }, data: { role: role as (typeof ROLES)[number] } });
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function resetUserPassword(id: string, password: string): Promise<FormState> {
  await requireAdmin();
  if (!password || password.length < 6) return { error: "Mot de passe d'au moins 6 caractères." };
  await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}
