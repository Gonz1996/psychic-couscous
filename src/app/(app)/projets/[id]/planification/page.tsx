import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { PlanningEditor } from "@/components/planning/planning-editor";

export const dynamic = "force-dynamic";

export default async function PlanificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!canWrite(session?.user?.role)) redirect(`/projets/${id}`);

  const [project, disciplines, employees] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { projectDisciplines: true, staffings: true } }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, disciplineId: true, costRate: true, productivityFactor: true },
    }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/projets/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour au projet
      </Link>
      <PageHeader
        title={`Planification financière — ${project.number}`}
        description={`${project.name} · cascade honoraires → budget → heures`}
      />
      <PlanningEditor
        projectId={project.id}
        initial={{
          feeDesign: project.feeDesign,
          feeSupervision: project.feeSupervision,
          targetProfitPct: project.targetProfitPct,
          overheadPct: project.overheadPct,
          riskReservePct: project.riskReservePct,
          directorId: project.directorId,
          disciplines: project.projectDisciplines.map((d) => ({ disciplineId: d.disciplineId, effortPct: d.effortPct })),
          staffing: project.staffings.map((s) => ({ disciplineId: s.disciplineId, employeeId: s.employeeId, effortPct: s.effortPct })),
        }}
        disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))}
        employees={employees.map((e) => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          disciplineId: e.disciplineId,
          costRate: e.costRate,
          productivityFactor: e.productivityFactor,
        }))}
      />
    </div>
  );
}
