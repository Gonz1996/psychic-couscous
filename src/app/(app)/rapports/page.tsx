import { getAssistantContext } from "@/lib/ai/context";
import {
  buildRecommendations,
  projectsBehindSchedule,
  projectsOverBudget,
  whoIsAvailable,
  whoIsOverloaded,
} from "@/lib/recommendations";
import { fmtDate, fmtHours, fmtPct } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PrintButton } from "@/components/reports/print-button";
import { UtilBadge } from "@/components/shared/util-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function RapportsPage() {
  const { roster, projects } = await getAssistantContext();

  const totalCapacity = roster.reduce((s, r) => s + r.metrics.realCapacity, 0);
  const totalAllocated = roster.reduce((s, r) => s + r.metrics.allocatedHours, 0);
  const avgUtil = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;
  const overloaded = whoIsOverloaded(roster);
  const available = whoIsAvailable(roster);
  const late = projectsBehindSchedule(projects);
  const overBudget = projectsOverBudget(projects);
  const recs = buildRecommendations(roster, projects);

  const discMap = new Map<string, { name: string; cap: number; alloc: number; count: number }>();
  for (const r of roster) {
    const k = r.employee.discipline.name;
    const cur = discMap.get(k) ?? { name: k, cap: 0, alloc: 0, count: 0 };
    cur.cap += r.metrics.realCapacity;
    cur.alloc += r.metrics.allocatedHours;
    cur.count += 1;
    discMap.set(k, cur);
  }
  const disciplines = [...discMap.values()]
    .map((d) => ({ ...d, util: d.cap > 0 ? Math.round((d.alloc / d.cap) * 100) : 0 }))
    .sort((a, b) => b.util - a.util);

  return (
    <div className="space-y-6">
      <PageHeader title="Rapport de gestion exécutif" description={`Généré le ${fmtDate(new Date())} · horizon 4 semaines`}>
        <PrintButton />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryStat label="Employés" value={String(roster.length)} />
        <SummaryStat label="Utilisation moyenne" value={fmtPct(avgUtil)} />
        <SummaryStat label="Surchargés" value={String(overloaded.length)} />
        <SummaryStat label="Disponibles" value={String(available.length)} />
        <SummaryStat label="Capacité totale" value={fmtHours(totalCapacity)} />
        <SummaryStat label="Charge planifiée" value={fmtHours(totalAllocated)} />
        <SummaryStat label="Projets en retard" value={String(late.length)} />
        <SummaryStat label="Projets en dépassement" value={String(overBudget.length)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charge par discipline</CardTitle>
          <CardDescription>Capacité réelle vs charge planifiée</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discipline</TableHead>
                <TableHead className="text-right">Effectif</TableHead>
                <TableHead className="text-right">Capacité</TableHead>
                <TableHead className="text-right">Planifié</TableHead>
                <TableHead className="text-right">Utilisation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplines.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.count}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtHours(d.cap)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtHours(d.alloc)}</TableCell>
                  <TableCell className="flex justify-end">
                    <UtilBadge pct={d.util} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employés en surcharge</CardTitle>
            <CardDescription>Au-dessus de 100 % d&apos;utilisation</CardDescription>
          </CardHeader>
          <CardContent>
            {overloaded.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead className="text-right">Utilisation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overloaded.map((r) => (
                    <TableRow key={r.employee.id}>
                      <TableCell className="font-medium">
                        {r.employee.firstName} {r.employee.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{r.employee.discipline.name}</TableCell>
                      <TableCell className="flex justify-end">
                        <UtilBadge pct={Math.round(r.metrics.utilizationPct)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets à risque</CardTitle>
            <CardDescription>Retard ou dépassement budgétaire</CardDescription>
          </CardHeader>
          <CardContent>
            {[...new Set([...late, ...overBudget])].length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead className="text-right">Écart éch.</TableHead>
                    <TableHead className="text-right">EAC</TableHead>
                    <TableHead className="text-right">Marge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...new Set([...late, ...overBudget])].map((p) => (
                    <TableRow key={p.project.id}>
                      <TableCell className="font-medium">{p.project.number}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(p.metrics.scheduleVariancePct)} %</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(p.metrics.eacVariancePct)} %</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtPct(p.metrics.projectedMarginPct)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>Synthèse des actions prioritaires</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recs.slice(0, 12).map((r) => (
            <div key={r.id} className="border-b pb-2 text-sm last:border-0">
              <span className="font-medium">{r.title}</span>
              {r.action && <span className="text-muted-foreground"> — {r.action}</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </Card>
  );
}
