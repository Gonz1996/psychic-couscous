import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { getAssistantContext } from "@/lib/ai/context";
import { buildRecommendations } from "@/lib/recommendations";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SEV_STYLES: Record<string, string> = {
  critical: "border-l-red-500 bg-red-50",
  warning: "border-l-amber-500 bg-amber-50",
  info: "border-l-sky-500 bg-sky-50",
  ok: "border-l-emerald-500 bg-emerald-50",
};

const SECTIONS = [
  { key: "critical", label: "Critiques", desc: "Action immédiate requise" },
  { key: "warning", label: "Avertissements", desc: "À surveiller de près" },
  { key: "info", label: "Informations", desc: "Optimisations possibles" },
] as const;

export default async function AlertesPage() {
  const { roster, projects } = await getAssistantContext();
  const recs = buildRecommendations(roster, projects);
  const bySev = (s: string) => recs.filter((r) => r.severity === s);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre d'alertes"
        description="Surcharges critiques, dépassements budgétaires et retards détectés en continu."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Alertes critiques" value={bySev("critical").length} tone="danger" icon={AlertOctagon} />
        <KpiCard label="Avertissements" value={bySev("warning").length} tone="warn" icon={AlertTriangle} />
        <KpiCard label="Informations" value={bySev("info").length} tone="info" icon={Info} />
      </div>

      {recs.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucune alerte active. Tout est sous contrôle. 👍
          </CardContent>
        </Card>
      )}

      {SECTIONS.map((section) => {
        const items = bySev(section.key);
        if (items.length === 0) return null;
        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>
                {section.label} <span className="text-muted-foreground">({items.length})</span>
              </CardTitle>
              <CardDescription>{section.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((r) => (
                <div key={r.id} className={cn("rounded-lg border border-l-4 p-3", SEV_STYLES[r.severity])}>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.detail}</div>
                  {r.action && <div className="mt-1 text-xs font-medium text-foreground/80">→ {r.action}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
