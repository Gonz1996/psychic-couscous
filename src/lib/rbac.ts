import { auth } from "@/auth";

/** Les rôles ADMIN et MANAGER peuvent écrire ; VIEWER est en lecture seule. */
export function canWrite(role?: string | null): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

/** À appeler au début de toute server action d'écriture. */
export async function requireWrite() {
  const session = await auth();
  if (!canWrite(session?.user?.role)) {
    throw new Error("Accès refusé : droits d'écriture requis (ADMIN ou MANAGER).");
  }
  return session!.user;
}
