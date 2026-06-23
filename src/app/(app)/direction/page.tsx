import Link from "next/link";
import { Wallet, TrendingDown, PiggyBank, Percent, Users, Clock, Activity, BadgeCheck, Info, Building2, Scale, Receipt, Banknote } from "lucide-react";
import { getDirectionData, getFirmFinance } from "@/lib/queries";
import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { fmtCurrency, fmtCurrencyCompact, fmtHours, fmtInt, fmtPct } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirmFinanceForm } from "@/components/direction/firm-finance-form";

export const dynamic = "force-dynamic";

/** Tonalité d'une marge selon la cible (≥30 vert, 0–30 ambre, <0 rouge). */
function marginTone(pct: number): "good" | "warn" | "danger" {
  if (pct < 0) return "danger";
  if (pct < 30) return "warn";
  return "good";
}
const MARGIN_TEXT = { good: "text-emerald-600", warn: "text-amber-600", danger: "text-red-600" } as const;

export default async function DirectionPage() {
  const [d, firm, session] = await Promise.all([getDirectionData(), getFirmFinance(), auth()]);
  const f = d.financials;
  const r = d.resources;
  const writable = canWrite(session?.user?.role);
  const maxDiscHours = Math.max(1, ...d.byDiscipline.map((x) => x.hours));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Direction"
        description="Performance financière et ressources — données réelles (QuickBooks + heures saisies)."
      />

      {/* --------------------- Firme — vue d'ensemble ------------------------ */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Firme — vue d&apos;ensemble ({firm.periodLabel})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Revenu firme total" value={fmtCurrencyCompact(firm.totalRevenue)} icon={Building2} sub="chiffre d'affaires réel (QuickBooks)" />
          <KpiCard label="Résultat net" value={fmtCurrencyCompact(firm.netResult)} icon={Scale} tone={firm.netResult >= 0 ? "good" : "danger"} sub="revenu − dépenses, overhead inclus" />
          <KpiCard label="Obligations fiscales" value={fmtCurrencyCompact(firm.totalObligations)} icon={Receipt} tone={firm.totalObligations > 0 ? "warn" : "default"} sub="TPS · TVQ · DAS · pénalités à remettre" />
          <KpiCard label="Net après obligations" value={fmtCurrencyCompact(firm.afterObligations)} icon={Banknote} tone={firm.afterObligations >= 0 ? "good" : "danger"} sub="résultat net − obligations" />
        </div>
      </section>

      {/* ----------------------------- Financier projets --------------------- */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Projets — rentabilité réalisée à ce jour
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Honoraires totaux" value={fmtCurrencyCompact(f.totalFees)} icon={Wallet} sub={`${fmtInt(f.projectsWithFees)} projets facturés`} />
          <KpiCard label="Coûts réels" value={fmtCurrencyCompact(f.totalCost)} icon={TrendingDown} sub="coûts directs de projet" />
          <KpiCard label="Profit projet réalisé" value={fmtCurrencyCompact(f.totalProfit)} icon={PiggyBank} tone={f.totalProfit >= 0 ? "good" : "danger"} sub="honoraires − coûts directs" />
          <KpiCard
            label="Marge projet globale"
            value={fmtPct(f.globalMarginPct, 1)}
            icon={Percent}
            tone={marginTone(f.globalMarginPct)}
            sub={`cible ${fmtPct(f.targetMarginPct)} · ${fmtInt(f.belowTargetCount)} sous la cible · ${fmtInt(f.atLossCount)} en perte`}
          />
        </div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Marge sur <strong>coûts directs de projet</strong>, <strong>avant frais généraux</strong> de la firme (administration, formation, développement…). La rentabilité nette de la firme, overhead inclus, est inférieure.
        </p>
      </section>

      {/* ----------------------------- Ressources ---------------------------- */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ressources — sur la période ({fmtInt(r.numWeeks)} semaines)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Effectif actif" value={fmtInt(r.headcount)} icon={Users} sub={`${fmtHours(r.weeklyCapacity)} / semaine`} />
          <KpiCard label="Heures réelles" value={fmtHours(r.totalActualHours)} icon={Clock} sub="saisies sur projets" />
          <KpiCard label="Utilisation réalisée" value={fmtPct(r.realizedUtilizationPct)} icon={Activity} tone="info" sub="heures projet ÷ capacité" />
          <KpiCard label="Heures facturables" value={fmtPct(r.billablePct)} icon={BadgeCheck} sub="part des heures projet" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* --------------------------- Par discipline ------------------------ */}
        <Card>
          <CardHeader>
            <CardTitle>Charge réelle par discipline</CardTitle>
            <CardDescription>Heures saisies sur la période · effectif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.byDiscipline.map((disc) => (
              <div key={disc.discipline} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: disc.color }} />
                    {disc.discipline}
                    <span className="text-xs text-muted-foreground">({fmtInt(disc.headcount)})</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {fmtHours(disc.hours)} · {fmtPct(disc.sharePct)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(disc.hours / maxDiscHours) * 100}%`, backgroundColor: disc.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ------------------- Rentabilité : meilleures marges --------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleures marges</CardTitle>
            <CardDescription>Top 6 projets par marge réalisée</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ProjectMarginList rows={d.topProjects} />
          </CardContent>
        </Card>
      </div>

      {/* ------------------- Rentabilité : à surveiller ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Projets à surveiller</CardTitle>
          <CardDescription>Marges les plus faibles · {fmtInt(f.belowTargetCount)} projets sous la cible de {fmtPct(f.targetMarginPct)}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ProjectMarginList rows={d.bottomProjects} />
        </CardContent>
      </Card>

      {/* ----------------- Vue firme & obligations (éditable) --------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Vue firme &amp; obligations fiscales</CardTitle>
          <CardDescription>
            Revenu/dépenses firme (snapshot QuickBooks) et taxes dues au gouvernement (TPS, TVQ, DAS) avec pénalités — à tenir à jour par la direction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirmFinanceForm firm={firm} canWrite={writable} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectMarginList({ rows }: { rows: Awaited<ReturnType<typeof getDirectionData>>["topProjects"] }) {
  if (rows.length === 0) return <p className="p-4 text-sm text-muted-foreground">Aucun projet.</p>;
  return (
    <div className="divide-y">
      {rows.map((p) => {
        const tone = marginTone(p.marginPct);
        return (
          <Link key={p.id} href={`/projets/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{p.number} — {p.name}</div>
              <div className="truncate text-xs text-muted-foreground">{p.client} · {fmtCurrency(p.fees)} − {fmtCurrency(p.cost)}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-sm font-semibold tabular-nums ${MARGIN_TEXT[tone]}`}>{fmtPct(p.marginPct)}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{fmtCurrencyCompact(p.profit)}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
