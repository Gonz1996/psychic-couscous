import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { DisciplineManager } from "@/components/disciplines/discipline-manager";

export const dynamic = "force-dynamic";

export default async function DisciplinesPage() {
  const session = await auth();
  const writable = canWrite(session?.user?.role);
  const disciplines = await prisma.discipline.findMany({
    include: { _count: { select: { employees: true, projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Disciplines" description="Référentiel des disciplines (couleur, code) — configurable." />
      <DisciplineManager
        canWrite={writable}
        disciplines={disciplines.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          color: d.color,
          usage: d._count.employees + d._count.projects,
        }))}
      />
    </div>
  );
}
