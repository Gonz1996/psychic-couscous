"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type FormState = { error?: string; ok?: boolean } | undefined;

const schema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel requis"),
    next: z.string().min(6, "Le nouveau mot de passe doit faire au moins 6 caractères"),
    confirm: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { error: "Vous n'êtes pas connecté." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Compte introuvable." };

  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return { error: "Le mot de passe actuel est incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) },
  });
  return { ok: true };
}
