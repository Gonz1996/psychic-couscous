import { PageHeader } from "@/components/shared/page-header";
import { FireAlarmMatrixForm } from "@/components/fire-alarm-matrix/matrix-form";

export default function MatriceIncendiePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrice causes-effets — alarme incendie"
        description="Bâtiments multirésidentiels de grande hauteur (Québec) — CNB 2015 / Code de construction du Québec / CAN-ULC-S1001"
      />
      <FireAlarmMatrixForm />
    </div>
  );
}
