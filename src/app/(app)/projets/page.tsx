import Link from "next/link";
import { Plus } from "lucide-react";
import { computeProjectRows, loadProjects } from "@/lib/queries";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectsTable } from "@/components/projects/projects-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
  const session = await auth();
  const writable = canWrite(session?.user?.role);
  const projects = await loadProjects();
  const rows = computeProjectRows(projects)
    .map((p) => ({
      id: p.project.id,
      number: p.project.number,
      name: p.project.name,
      client: p.project.client.name,
      pm: `${p.project.projectManager.firstName} ${p.project.projectManager.lastName}`,
      discipline: p.project.discipline.name,
      status: p.project.status,
      inConception: p.project.inConception,
      inSurveillance: p.project.inSurveillance,
      budgetHours: Math.round(p.project.budgetHours),
      consumed: Math.round(p.metrics.hoursConsumed),
      pctHoursUsed: Math.round(p.metrics.pctHoursUsed),
      pctComplete: p.metrics.pctComplete,
      scheduleVariancePct: Math.round(p.metrics.scheduleVariancePct),
      marginPct: Math.round(p.metrics.projectedMarginPct),
      riskScore: p.riskScore,
      flags: p.flags,
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description="Budget, échéancier, rentabilité et risques détectés automatiquement."
      >
        {writable && (
          <Button asChild>
            <Link href="/projets/nouveau">
              <Plus className="size-4" /> Nouveau projet
            </Link>
          </Button>
        )}
      </PageHeader>
      <ProjectsTable rows={rows} />
    </div>
  );
}
