import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/lib/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export default async function NouveauProjetPage() {
  const session = await auth();
  if (!canWrite(session?.user?.role)) redirect("/projets");

  const [clients, disciplines, managers] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Nouveau projet" description="Créer un mandat." />
      <ProjectForm
        action={createProject}
        clients={clients.map((c) => ({ id: c.id, name: `${c.name} (${c.code})` }))}
        disciplines={disciplines.map((x) => ({ id: x.id, name: x.name }))}
        managers={managers.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` }))}
        submitLabel="Créer le projet"
      />
    </div>
  );
}
