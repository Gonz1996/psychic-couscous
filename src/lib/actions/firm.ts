"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export type FirmFormState = { error?: string; ok?: boolean } | undefined;

const num = z.coerce.number().min(0);
const schema = z.object({
  totalRevenue: num,
  totalExpenses: num,
  gstOwed: num,
  qstOwed: num,
  sourceDeductionsOwed: num,
  penaltiesOwed: num,
});

export async function saveFirmFinance(_prev: FirmFormState, formData: FormData): Promise<FirmFormState> {
  try {
    await requireWrite();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Validation échouée." };
  const d = parsed.data;

  await prisma.firmFinance.upsert({
    where: { id: "singleton" },
    update: d,
    create: { id: "singleton", periodLabel: "Exercice sept. 2025 – juin 2026", ...d },
  });
  revalidatePath("/direction");
  return { ok: true };
}
