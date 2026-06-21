import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateProject } from "@/lib/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export default async function ModifierProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!canWrite(session?.user?.role)) redirect(`/projets/${id}`);

  const [proj, clients, disciplines, managers] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!proj) notFound();

  const defaults: Record<string, string> = {
    number: proj.number,
    name: proj.name,
    clientId: proj.clientId,
    disciplineId: proj.disciplineId,
    projectManagerId: proj.projectManagerId,
    status: proj.status,
    budgetHours: String(proj.budgetHours),
    budgetFees: String(proj.budgetFees),
    percentComplete: String(proj.percentComplete),
    startDate: proj.startDate.toISOString().slice(0, 10),
    endDate: proj.endDate.toISOString().slice(0, 10),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Modifier — ${proj.number}`} description={proj.name} />
      <ProjectForm
        action={updateProject.bind(null, id)}
        defaults={defaults}
        clients={clients.map((c) => ({ id: c.id, name: `${c.name} (${c.code})` }))}
        disciplines={disciplines.map((x) => ({ id: x.id, name: x.name }))}
        managers={managers.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` }))}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
