import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.role)) redirect("/dashboard");

  const [users, employees] = await Promise.all([
    prisma.user.findMany({
      include: { employee: { select: { firstName: true, lastName: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE", user: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Comptes utilisateurs" description="Gérer les accès à l'application (administrateur uniquement)." />
      <UserManager
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          employeeName: u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : null,
        }))}
        employees={employees.map((e) => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
      />
    </div>
  );
}
