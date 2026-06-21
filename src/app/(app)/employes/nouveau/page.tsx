import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export default async function NouvelEmployePage() {
  const session = await auth();
  if (!canWrite(session?.user?.role)) redirect("/employes");

  const [disciplines, offices, managers] = await Promise.all([
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.office.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Nouvel employé" description="Ajouter un membre à l'équipe." />
      <EmployeeForm
        action={createEmployee}
        disciplines={disciplines.map((x) => ({ id: x.id, name: x.name }))}
        offices={offices.map((x) => ({ id: x.id, name: x.name }))}
        managers={managers.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` }))}
        submitLabel="Créer l'employé"
      />
    </div>
  );
}
