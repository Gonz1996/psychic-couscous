// =====================================================================
// Moteur de recommandations déterministe (règles métier).
// Répond aux questions clés sans dépendre d'une API externe.
// =====================================================================
import type { EmployeeRow, ProjectRow, FirmFinance, DisciplineCapacity } from "./queries";
import type { Severity } from "./detections";
import { fmtHours, fmtPct, fmtCurrency, fmtCurrencyCompact } from "./format";
import { PROJECT_STATUS_LABELS } from "./labels";

export interface AssistantData {
  roster: EmployeeRow[];
  projects: ProjectRow[];
  firm?: FirmFinance;
  disciplines?: DisciplineCapacity[];
}

/** Rentabilité réelle par projet (honoraires − coûts réels QuickBooks). */
export function projectProfitability(rows: ProjectRow[]) {
  return rows
    .filter((p) => p.project.budgetFees > 0)
    .map((p) => {
      const fees = p.project.budgetFees;
      const cost = p.project.actualCost;
      const profit = fees - cost;
      return { p, fees, cost, profit, marginPct: fees > 0 ? (profit / fees) * 100 : 0 };
    })
    .sort((a, b) => b.marginPct - a.marginPct);
}

/** Extrait un montant en $ d'une question (« 250 000 $ », « 250k », « 1,2 M »). */
export function parseAmount(q: string): number | null {
  const k = q.match(/(\d+(?:[.,]\d+)?)\s*k\b/i);
  if (k) return Math.round(parseFloat(k[1].replace(",", ".")) * 1_000);
  const m = q.match(/(\d+(?:[.,]\d+)?)\s*m\b/i);
  if (m) return Math.round(parseFloat(m[1].replace(",", ".")) * 1_000_000);
  const n = q.match(/(\d[\d\s]{2,}\d|\d{4,})\s*\$?/);
  if (n) {
    const v = parseInt(n[1].replace(/\s/g, ""), 10);
    if (v >= 1000) return v;
  }
  return null;
}

export interface Recommendation {
  id: string;
  category: "capacity" | "budget" | "schedule" | "balance";
  severity: Severity;
  title: string;
  detail: string;
  action?: string;
}

const empName = (r: EmployeeRow) => `${r.employee.firstName} ${r.employee.lastName}`;
const SEV_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2, ok: 3 };

// ----------------------------- Requêtes ------------------------------

export function whoIsAvailable(roster: EmployeeRow[]): EmployeeRow[] {
  return roster
    .filter((r) => r.metrics.utilizationPct < 85 && r.metrics.remainingHours > 1)
    .sort((a, b) => b.metrics.remainingHours - a.metrics.remainingHours);
}

export function whoIsOverloaded(roster: EmployeeRow[]): EmployeeRow[] {
  return roster
    .filter((r) => r.metrics.utilizationPct > 100)
    .sort((a, b) => b.metrics.utilizationPct - a.metrics.utilizationPct);
}

export function nextAssignee(roster: EmployeeRow[], discipline?: string): EmployeeRow | undefined {
  let pool = whoIsAvailable(roster);
  if (discipline) {
    const filtered = pool.filter((r) => r.employee.discipline.name === discipline);
    if (filtered.length) pool = filtered;
  }
  return pool[0];
}

export function projectsOverBudget(rows: ProjectRow[]): ProjectRow[] {
  return rows
    .filter((p) => p.flags.includes("OVER_BUDGET") || p.flags.includes("UNDERESTIMATED"))
    .sort((a, b) => b.metrics.eacVariancePct - a.metrics.eacVariancePct);
}

export function projectsBehindSchedule(rows: ProjectRow[]): ProjectRow[] {
  return rows
    .filter((p) => p.flags.includes("BEHIND_SCHEDULE"))
    .sort((a, b) => a.metrics.scheduleVariancePct - b.metrics.scheduleVariancePct);
}

export function projectsResourceShortage(rows: ProjectRow[]): ProjectRow[] {
  return rows.filter((p) => p.flags.includes("RESOURCE_SHORTAGE"));
}

export interface BalancingMove {
  from: EmployeeRow;
  to: EmployeeRow;
  hours: number;
  discipline: string;
}

export function balancingSuggestions(roster: EmployeeRow[]): BalancingMove[] {
  const over = whoIsOverloaded(roster);
  const avail = whoIsAvailable(roster);
  const usedCapacity = new Map<string, number>();
  const moves: BalancingMove[] = [];

  for (const o of over) {
    const candidate = avail.find((a) => {
      if (a.employee.discipline.name !== o.employee.discipline.name) return false;
      const already = usedCapacity.get(a.employee.id) ?? 0;
      return a.metrics.remainingHours - already > 2;
    });
    if (!candidate) continue;
    const already = usedCapacity.get(candidate.employee.id) ?? 0;
    const excess = o.metrics.allocatedHours - o.metrics.realCapacity;
    const transfer = Math.max(0, Math.min(excess, candidate.metrics.remainingHours - already));
    if (transfer > 0.5) {
      usedCapacity.set(candidate.employee.id, already + transfer);
      moves.push({
        from: o,
        to: candidate,
        hours: Math.round(transfer * 10) / 10,
        discipline: o.employee.discipline.name,
      });
    }
  }
  return moves;
}

// ------------------------ Recommandations ----------------------------

export function buildRecommendations(roster: EmployeeRow[], projects: ProjectRow[]): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const r of whoIsOverloaded(roster)) {
    const critical = r.metrics.utilizationPct > 115;
    recs.push({
      id: `over-${r.employee.id}`,
      category: "capacity",
      severity: critical ? "critical" : "warning",
      title: `${empName(r)} ${critical ? "en surcharge critique" : "surchargé"} (${fmtPct(r.metrics.utilizationPct)})`,
      detail: `${r.employee.title} · ${r.employee.discipline.name}. ${fmtHours(r.metrics.allocatedHours)} planifiées pour ${fmtHours(r.metrics.realCapacity)} disponibles.`,
      action: "Redistribuer une partie de la charge ou réviser les échéances.",
    });
  }

  for (const p of projectsBehindSchedule(projects)) {
    recs.push({
      id: `late-${p.project.id}`,
      category: "schedule",
      severity: p.metrics.scheduleVariancePct < -25 ? "critical" : "warning",
      title: `${p.project.number} — ${p.project.name} en retard`,
      detail: `Avancement ${fmtPct(p.metrics.pctComplete)} vs ${fmtPct(p.metrics.timeElapsedPct)} de temps écoulé (écart ${fmtPct(p.metrics.scheduleVariancePct)}).`,
      action: "Ajouter des ressources ou renégocier l'échéancier.",
    });
  }

  for (const p of projectsOverBudget(projects)) {
    recs.push({
      id: `budget-${p.project.id}`,
      category: "budget",
      severity: p.metrics.eacVariancePct > 20 ? "critical" : "warning",
      title: `${p.project.number} — dépassement budgétaire projeté`,
      detail: `Prévision à terminaison ${fmtHours(p.metrics.eacHours)} vs budget ${fmtHours(p.project.budgetHours)} (${fmtPct(p.metrics.eacVariancePct)}).`,
      action: "Réviser l'estimation, l'envergure ou les honoraires.",
    });
  }

  for (const p of projectsResourceShortage(projects)) {
    recs.push({
      id: `short-${p.project.id}`,
      category: "capacity",
      severity: "warning",
      title: `${p.project.number} — manque de ressources`,
      detail: `${fmtHours(p.metrics.hoursRemaining)} restantes mais seulement ${fmtHours(p.futureAllocatedHours)} planifiées à venir.`,
      action: "Affecter des ressources additionnelles pour respecter l'échéance.",
    });
  }

  for (const m of balancingSuggestions(roster)) {
    recs.push({
      id: `bal-${m.from.employee.id}-${m.to.employee.id}`,
      category: "balance",
      severity: "info",
      title: `Rééquilibrage suggéré (${m.discipline})`,
      detail: `Transférer ~${fmtHours(m.hours)} de ${empName(m.from)} vers ${empName(m.to)}.`,
      action: "Simuler dans la planification de capacité.",
    });
  }

  return recs.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
}

// ---------------------- Questions en langage (local) -----------------

export interface Answer {
  title: string;
  markdown: string;
}

export const SUGGESTED_QUESTIONS = [
  "Puis-je accepter un mandat de 250 000 $ ?",
  "Quels sont les projets les plus et les moins rentables ?",
  "Quelle discipline manque de capacité ?",
  "Quelle est la situation financière de la firme ?",
  "Qui est disponible cette période ?",
  "Qui est surchargé ?",
  "Quels projets risquent de dépasser leur budget ?",
  "Quels projets sont en retard ?",
];

export function answerQuestion(question: string, ctx: AssistantData): Answer {
  const q = question.toLowerCase();
  const { roster, projects, firm, disciplines } = ctx;

  // --- Faisabilité d'un mandat : « puis-je accepter un mandat de X $ ? » ---
  if (disciplines && (q.includes("mandat") || q.includes("accepter") || q.includes("nouveau projet") || q.includes("contrat"))) {
    const amount = parseAmount(q);
    const totalAvail = disciplines.reduce((s, d) => s + d.availableWeeklyHours, 0);
    const tight = [...disciplines].sort((a, b) => b.recentUtilizationPct - a.recentUtilizationPct).slice(0, 2);
    if (amount) {
      const prod = amount * 0.55; // 30% profit + 10% frais + 5% réserve
      const avgRate =
        disciplines.reduce((s, d) => s + d.avgLoadedRate * d.headcount, 0) /
        Math.max(1, disciplines.reduce((s, d) => s + d.headcount, 0));
      const hours = avgRate > 0 ? prod / avgRate : 0;
      const weeks = totalAvail > 0 ? hours / totalAvail : 0;
      return {
        title: "Faisabilité du mandat",
        markdown:
          `Pour un mandat de **${fmtCurrency(amount)}** (cible 30 % profit / 10 % frais / 5 % réserve) :\n\n` +
          `- Budget de production : **${fmtCurrency(prod)}**\n` +
          `- Effort estimé : **${fmtHours(hours)}** (≈ ${fmtCurrency(avgRate)}/h chargé moyen)\n` +
          `- Disponibilité firme : **${fmtHours(totalAvail)}/sem.** → absorbable en **~${weeks.toFixed(0)} semaine(s)** à pleine dispo\n` +
          `- Disciplines déjà les plus chargées : ${tight.map((d) => `**${d.discipline}** (${fmtPct(d.recentUtilizationPct)})`).join(", ")}\n\n` +
          `→ Pour un verdict précis (durée + répartition par discipline), utilise le **Simulateur de mandat**.`,
      };
    }
    return {
      title: "Capacité pour un nouveau mandat",
      markdown:
        `Disponibilité totale : **${fmtHours(totalAvail)}/sem.**. Disciplines les plus chargées : ${tight.map((d) => `**${d.discipline}** (${fmtPct(d.recentUtilizationPct)})`).join(", ")}.\n\n` +
        `Précise un montant (ex. « un mandat de 250 000 $ ») ou utilise le **Simulateur**.`,
    };
  }

  // --- Capacité par discipline : « quelle discipline manque de capacité ? » ---
  if (disciplines && q.includes("discipline") && (q.includes("capacit") || q.includes("manque") || q.includes("disponib") || q.includes("charg"))) {
    const sorted = [...disciplines].sort((a, b) => b.recentUtilizationPct - a.recentUtilizationPct);
    return {
      title: "Capacité par discipline",
      markdown: sorted
        .map((d) => `- **${d.discipline}** — ${d.headcount} pers., utilisation **${fmtPct(d.recentUtilizationPct)}**, ${fmtHours(d.availableWeeklyHours)}/sem. dispo (taux moy. ${fmtCurrency(d.avgLoadedRate)}/h)`)
        .join("\n"),
    };
  }

  // --- Situation financière de la firme ---
  if (firm && (q.includes("firme") || q.includes("revenu") || q.includes("chiffre") || q.includes("financ") || q.includes("taxe") || q.includes("tps") || q.includes("tvq") || q.includes("résultat net") || q.includes("resultat net") || q.includes("perte nette") || q.includes("obligation"))) {
    return {
      title: "Situation financière de la firme",
      markdown:
        `Pour ${firm.periodLabel} :\n\n` +
        `- Revenu total : **${fmtCurrency(firm.totalRevenue)}**\n` +
        `- Dépenses : **${fmtCurrency(firm.totalExpenses)}**\n` +
        `- Résultat net : **${fmtCurrency(firm.netResult)}** ${firm.netResult < 0 ? "⚠️ (perte)" : "✓"}\n` +
        `- Obligations fiscales à remettre (TPS/TVQ/DAS/pénalités) : **${fmtCurrency(firm.totalObligations)}**\n` +
        `- Résultat net après obligations : **${fmtCurrency(firm.afterObligations)}**`,
    };
  }

  // --- Rentabilité réelle des projets ---
  if (q.includes("rentab") || q.includes("marge") || q.includes("profit") || q.includes("meilleur") || q.includes("pire") || q.includes("perte")) {
    const prof = projectProfitability(projects);
    if (!prof.length) return { title: "Rentabilité", markdown: "Aucun projet avec honoraires renseignés." };
    const fmtRow = (x: (typeof prof)[number]) =>
      `**${x.p.project.number}** ${x.p.project.name} — marge **${fmtPct(x.marginPct)}** (${fmtCurrencyCompact(x.fees)} − ${fmtCurrencyCompact(x.cost)} = ${fmtCurrencyCompact(x.profit)})`;
    const best = prof.slice(0, 5).map((x) => `- 🟢 ${fmtRow(x)}`).join("\n");
    const worst = [...prof].reverse().slice(0, 5).map((x) => `- 🔴 ${fmtRow(x)}`).join("\n");
    const below = prof.filter((x) => x.marginPct < 30).length;
    const loss = prof.filter((x) => x.profit < 0).length;
    return {
      title: "Rentabilité des projets (réel, QuickBooks)",
      markdown: `**Meilleures marges**\n${best}\n\n**Plus faibles marges**\n${worst}\n\n_${below} projet(s) sous la cible de 30 %, dont ${loss} en perte._`,
    };
  }

  if (q.includes("disponible") || q.includes("dispo")) {
    const list = whoIsAvailable(roster).slice(0, 8);
    if (!list.length) return { title: "Disponibilité", markdown: "Aucun employé n'a de capacité résiduelle notable sur la période — l'équipe est pleinement chargée." };
    return {
      title: "Employés disponibles",
      markdown:
        "Classés par heures résiduelles :\n\n" +
        list
          .map((r, i) => `${i + 1}. **${empName(r)}** (${r.employee.discipline.name}) — ${fmtHours(r.metrics.remainingHours)} libres · utilisation ${fmtPct(r.metrics.utilizationPct)}`)
          .join("\n"),
    };
  }

  if (q.includes("surcharg")) {
    const list = whoIsOverloaded(roster);
    if (!list.length) return { title: "Surcharge", markdown: "Personne n'est en surcharge sur la période. 👍" };
    return {
      title: "Employés surchargés",
      markdown:
        list
          .map((r) => `- **${empName(r)}** (${r.employee.discipline.name}) — utilisation **${fmtPct(r.metrics.utilizationPct)}**, ${fmtHours(r.metrics.allocatedHours - r.metrics.realCapacity)} au-dessus de la capacité`)
          .join("\n"),
    };
  }

  if (q.includes("budget") || q.includes("dépass") || q.includes("depass")) {
    const list = projectsOverBudget(projects);
    if (!list.length) return { title: "Budget", markdown: "Aucun projet ne dépasse son budget de façon préoccupante." };
    return {
      title: "Projets à risque budgétaire",
      markdown: list
        .map((p) => `- **${p.project.number}** ${p.project.name} — EAC ${fmtHours(p.metrics.eacHours)} (${fmtPct(p.metrics.eacVariancePct)} vs budget), marge projetée ${fmtPct(p.metrics.projectedMarginPct)}`)
        .join("\n"),
    };
  }

  if (q.includes("retard") || q.includes("échéanc") || q.includes("echeanc") || q.includes("délai") || q.includes("delai")) {
    const list = projectsBehindSchedule(projects);
    if (!list.length) return { title: "Échéancier", markdown: "Aucun projet n'est en retard significatif." };
    return {
      title: "Projets en retard",
      markdown: list
        .map((p) => `- **${p.project.number}** ${p.project.name} — avancement ${fmtPct(p.metrics.pctComplete)} vs ${fmtPct(p.metrics.timeElapsedPct)} écoulé (${p.metrics.daysToDeadline} j avant échéance)`)
        .join("\n"),
    };
  }

  if (q.includes("prochaine") || q.includes("assign") || q.includes("tâche") || q.includes("tache") || q.includes("qui devrait")) {
    const pick = nextAssignee(roster);
    if (!pick) return { title: "Prochaine affectation", markdown: "Aucune ressource clairement disponible — envisager un rééquilibrage ou de la sous-traitance." };
    return {
      title: "Prochaine affectation recommandée",
      markdown: `**${empName(pick)}** (${pick.employee.title}, ${pick.employee.discipline.name}) est le meilleur candidat : ${fmtHours(pick.metrics.remainingHours)} disponibles, utilisation actuelle ${fmtPct(pick.metrics.utilizationPct)}.`,
    };
  }

  if (q.includes("équilibr") || q.includes("equilibr") || q.includes("rééquilibr") || q.includes("balance")) {
    const moves = balancingSuggestions(roster);
    if (!moves.length) return { title: "Équilibrage", markdown: "La charge est déjà raisonnablement équilibrée, ou aucun transfert évident n'est possible dans la même discipline." };
    return {
      title: "Plan de rééquilibrage",
      markdown: moves
        .map((m) => `- Transférer **~${fmtHours(m.hours)}** de **${empName(m.from)}** → **${empName(m.to)}** (${m.discipline})`)
        .join("\n"),
    };
  }

  // Réponse générale
  const over = whoIsOverloaded(roster).length;
  const avail = whoIsAvailable(roster).length;
  const late = projectsBehindSchedule(projects).length;
  const budget = projectsOverBudget(projects).length;
  return {
    title: "Synthèse",
    markdown: `Sur la période analysée : **${over}** employé(s) en surcharge, **${avail}** disponible(s), **${late}** projet(s) en retard, **${budget}** projet(s) à risque budgétaire.\n\nPosez une question plus précise ou utilisez les suggestions ci-dessous.`,
  };
}
