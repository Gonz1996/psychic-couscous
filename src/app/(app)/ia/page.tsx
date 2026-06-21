import { getAssistantContext } from "@/lib/ai/context";
import { buildRecommendations, SUGGESTED_QUESTIONS } from "@/lib/recommendations";
import { isClaudeEnabled } from "@/lib/ai/claude";
import { PageHeader } from "@/components/shared/page-header";
import { Assistant } from "@/components/ai/assistant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SEV_STYLES: Record<string, string> = {
  critical: "border-l-red-500 bg-red-50",
  warning: "border-l-amber-500 bg-amber-50",
  info: "border-l-sky-500 bg-sky-50",
  ok: "border-l-emerald-500 bg-emerald-50",
};

export default async function IAPage() {
  const { roster, projects } = await getAssistantContext();
  const recs = buildRecommendations(roster, projects);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistant IA"
        description="Recommandations automatiques et réponses en langage naturel sur vos ressources."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Assistant suggestions={SUGGESTED_QUESTIONS} claudeEnabled={isClaudeEnabled()} />

        <Card>
          <CardHeader>
            <CardTitle>Recommandations prioritaires</CardTitle>
            <CardDescription>{recs.length} élément(s) détecté(s) automatiquement</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[560px] space-y-2 overflow-y-auto">
            {recs.length === 0 && <p className="text-sm text-muted-foreground">Aucune action prioritaire pour le moment.</p>}
            {recs.map((r) => (
              <div key={r.id} className={cn("rounded-lg border border-l-4 p-3", SEV_STYLES[r.severity] ?? "")}>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.detail}</div>
                {r.action && <div className="mt-1 text-xs font-medium text-foreground/80">→ {r.action}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
