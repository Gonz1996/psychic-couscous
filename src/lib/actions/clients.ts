"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireWrite } from "@/lib/rbac";

export type FormState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  code: z.string().min(1, "Code requis"),
  sector: z.string().optional(),
});

export async function createClient(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireWrite();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  try {
    await prisma.client.create({
      data: { name: parsed.data.name, code: parsed.data.code, sector: parsed.data.sector || null },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "Nom ou code déjà utilisé." };
    throw e;
  }
  revalidatePath("/clients");
  revalidatePath("/projets/nouveau");
  return { ok: true };
}
