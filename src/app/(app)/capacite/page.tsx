import { computeRoster, loadEmployees } from "@/lib/queries";
import { getCapacityMatrix, getForecast } from "@/lib/capacity";
import { balancingSuggestions } from "@/lib/recommendations";
import { weekSeries } from "@/lib/dates";
import { utilizationBand } from "@/lib/thresholds";
import { fmtHours, fmtPct } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { CapacityHeatmap } from "@/components/capacity/capacity-heatmap";
import { CapacitySimulator } from "@/components/capacity/capacity-simulator";

export const dynamic = "force-dynamic";

const TONE = { green: "good", yellow: "default", orange: "warn", red: "danger" } as const;

export default async function CapacitePage() {
  const employees = await loadEmployees();
  const roster = computeRoster(employees, weekSeries(new Date(), 0, 3)).sort(
    (a, b) => b.metrics.utilizationPct - a.metrics.utilizationPct,
  );
  const [matrix, forecast] = await Promise.all([getCapacityMatrix(12), getForecast([4, 8, 12])]);

  const simEmployees = roster.map((r) => ({
    id: r.employee.id,
    name: `${r.employee.firstName} ${r.employee.lastName}`,
    discipline: r.employee.discipline.name,
    utilizationPct: Math.round(r.metrics.utilizationPct),
    allocated: Math.round(r.metrics.allocatedHours),
    capacity: Math.round(r.metrics.realCapacity),
  }));

  const suggestions = balancingSuggestions(roster).map((m) => ({
    fromId: m.from.employee.id,
    fromName: `${m.from.employee.firstName} ${m.from.employee.lastName}`,
    toId: m.to.employee.id,
    toName: `${m.to.employee.firstName} ${m.to.employee.lastName}`,
    hours: m.hours,
    discipline: m.discipline,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification de capacité"
        description="Prévision de charge sur 4, 8 et 12 semaines, heatmap et simulation d'affectation."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {forecast.map((f) => (
          <KpiCard
            key={f.weeks}
            label={`Prévision ${f.weeks} semaines`}
            value={fmtPct(f.utilizationPct)}
            tone={TONE[utilizationBand(f.utilizationPct)]}
            sub={`${fmtHours(f.available)} disponibles · ${f.overloaded} surchargé(s) · ${f.availableEmp} libre(s)`}
          />
        ))}
      </div>

      <CapacityHeatmap matrix={matrix} />
      <CapacitySimulator employees={simEmployees} suggestions={suggestions} />
    </div>
  );
}
