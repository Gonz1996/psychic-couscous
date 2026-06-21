import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateEmployee } from "@/lib/actions/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export default async function ModifierEmployePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!canWrite(session?.user?.role)) redirect(`/employes/${id}`);

  const [emp, disciplines, offices, managers] = await Promise.all([
    prisma.employee.findUnique({ where: { id } }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.office.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: "ACTIVE", NOT: { id } },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!emp) notFound();

  const defaults: Record<string, string> = {
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    employeeNo: emp.employeeNo,
    title: emp.title,
    disciplineId: emp.disciplineId,
    officeId: emp.officeId,
    managerId: emp.managerId ?? "",
    weeklyCapacityHours: String(emp.weeklyCapacityHours),
    billableTargetPct: String(emp.billableTargetPct),
    costRate: String(emp.costRate),
    billRate: String(emp.billRate),
    hireDate: emp.hireDate.toISOString().slice(0, 10),
    status: emp.status,
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Modifier — ${emp.firstName} ${emp.lastName}`} description="Mettre à jour les informations de l'employé." />
      <EmployeeForm
        action={updateEmployee.bind(null, id)}
        defaults={defaults}
        disciplines={disciplines.map((x) => ({ id: x.id, name: x.name }))}
        offices={offices.map((x) => ({ id: x.id, name: x.name }))}
        managers={managers.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` }))}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
