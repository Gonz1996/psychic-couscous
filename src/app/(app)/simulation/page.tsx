import { getDisciplineCapacity } from "@/lib/queries";
import { PageHeader } from "@/components/shared/page-header";
import { MandateSimulator } from "@/components/simulation/mandate-simulator";

export const dynamic = "force-dynamic";

export default async function SimulationPage() {
  const disciplines = await getDisciplineCapacity();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulateur de mandat"
        description="« Puis-je accepter ce mandat ? » — impact sur la capacité et la rentabilité, sans rien enregistrer."
      />
      <MandateSimulator disciplines={disciplines} />
    </div>
  );
}
