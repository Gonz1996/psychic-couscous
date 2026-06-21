import Link from "next/link";
import { Plus } from "lucide-react";
import { computeRoster, loadEmployees } from "@/lib/queries";
import { weekSeries } from "@/lib/dates";
import { initials } from "@/lib/format";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EmployesPage() {
  const session = await auth();
  const writable = canWrite(session?.user?.role);
  const employees = await loadEmployees();
  const weeks = weekSeries(new Date(), 0, 3); // moyenne sur 4 semaines
  const roster = computeRoster(employees, weeks);

  const rows = roster
    .map((r) => ({
      id: r.employee.id,
      name: `${r.employee.firstName} ${r.employee.lastName}`,
      initials: initials(r.employee.firstName, r.employee.lastName),
      title: r.employee.title,
      discipline: r.employee.discipline.name,
      office: r.employee.office.name,
      utilizationPct: Math.round(r.metrics.utilizationPct),
      billablePct: Math.round(r.metrics.billablePct),
      remaining: Math.round(r.metrics.remainingHours),
      flags: r.flags,
    }))
    .sort((a, b) => b.utilizationPct - a.utilizationPct);

  const disciplines = [...new Set(rows.map((r) => r.discipline))].sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employés"
        description="Charge, disponibilité et facturation — moyenne sur les 4 prochaines semaines."
      >
        {writable && (
          <Button asChild>
            <Link href="/employes/nouveau">
              <Plus className="size-4" /> Nouvel employé
            </Link>
          </Button>
        )}
      </PageHeader>
      <EmployeesTable rows={rows} disciplines={disciplines} />
    </div>
  );
}
