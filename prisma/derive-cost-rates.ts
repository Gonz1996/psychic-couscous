/* Dérive un COÛT HORAIRE CHARGÉ (costRate) par employé à partir des vraies
 * données — ESTIMATION à valider/remplacer par les taux officiels.
 *
 *   costRate = (paie nette cumulée × FACTEUR_CHARGE) ÷ heures totales loggées
 *
 * - Paie nette : Bilan détaillé (lignes « Chèque de la paie » → « Dépôt direct
 *   payable »), cumulée par employé (période 2026-01 → 06).
 * - FACTEUR_CHARGE (net → coût chargé employeur) ≈ 1,45 :
 *     brut ≈ net / 0,74  (retenues employé)  ×  charges employeur ~1,09
 *     (P&L : Charges salariales 1 335 222 $ / Traitements 1 226 275 $).
 * - Heures totales loggées : Timesheet (projet + non-projet), par employé →
 *   le temps non facturable est ainsi chargé dans le taux (overhead).
 *
 * N'écrit que pour les employés ACTIFS retrouvés dans la paie ET le timesheet.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();
const DIR = String.raw`Q:\1.Cristhian\AI TEST\09_AI_PROJECT`;
const BILAN = `${DIR}\\MEP Experts Conseils_Bilan détaillé.csv`;
const TIMESHEET = `${DIR}\\MEP Experts Conseils_Timesheet Detail by Employee.csv`;
const FACTEUR_CHARGE = 1.45;

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let f = "", q = false; let r: string[] = [];
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if (c === '"') q = true; else if (c === ",") { r.push(f); f=""; }
    else if (c === "\r") {} else if (c === "\n") { r.push(f); rows.push(r); r=[]; f=""; } else f+=c; }
  if (f!==""||r.length){r.push(f);rows.push(r);} return rows;
}
const read = (p: string) => parseCsv(fs.readFileSync(p, "utf-8").replace(/^﻿/, ""));
const toNum = (s: string) => Number((s||"").replace(/[",\s]/g,""))||0;
const norm = (s: string) => (s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const ALIASES: Record<string,string> = { "cristhian alonso garzon hoyos": "cristhian garzon" };
const canon = (s: string) => ALIASES[norm(s)] ?? norm(s);

async function main() {
  // 1) Paie nette cumulée par employé (Bilan).
  const netPay = new Map<string, number>();
  for (const r of read(BILAN)) {
    if (/paie/i.test((r[2]||"")) && /payable/i.test((r[6]||""))) {
      const who = canon(r[4]||""); const amt = toNum(r[8]) || toNum(r[7]);
      if (who && amt) netPay.set(who, (netPay.get(who)||0)+amt);
    }
  }

  // 2) Heures totales loggées par employé (Timesheet, projet + non-projet).
  const hours = new Map<string, number>();
  let cur = "";
  for (const r of read(TIMESHEET)) {
    const c0 = (r[0]||"").trim();
    const date = (r[1]||"").trim();
    const isAct = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (c0 && !isAct) { if (c0 !== "Date de l’activité" && c0 !== "MEP Experts Conseils") cur = canon(c0); continue; }
    if (!isAct || !cur) continue;
    const m = (r[5]||"").trim().match(/^(\d+):(\d{2})$/);
    if (m) hours.set(cur, (hours.get(cur)||0) + Number(m[1]) + Number(m[2])/60);
  }

  // 3) Calcul + écriture pour les employés actifs.
  const emps = await prisma.employee.findMany({ where: { status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true, title: true } });

  const report: { name: string; rate: number; net: number; h: number }[] = [];
  const skipped: string[] = [];
  for (const e of emps) {
    const key = canon(`${e.firstName} ${e.lastName}`);
    const net = netPay.get(key); const h = hours.get(key);
    if (!net || !h || h < 1) { skipped.push(`${e.firstName} ${e.lastName}`); continue; }
    const rate = Math.round((net * FACTEUR_CHARGE) / h);
    await prisma.employee.update({ where: { id: e.id }, data: { costRate: rate } });
    report.push({ name: `${e.firstName} ${e.lastName}`, rate, net, h });
  }

  // Repli : employés actifs sans paie/heures → taux moyen (placeholder).
  const avgRate = report.length ? Math.round(report.reduce((s,x)=>s+x.rate,0)/report.length) : 0;
  for (const e of emps) {
    const key = canon(`${e.firstName} ${e.lastName}`);
    if ((!netPay.get(key) || !hours.get(key)) && avgRate > 0) {
      await prisma.employee.update({ where: { id: e.id }, data: { costRate: avgRate } });
    }
  }

  report.sort((a,b)=>b.rate-a.rate);
  console.log(`Taux chargé estimé (facteur ${FACTEUR_CHARGE}) — ${report.length} employés :`);
  for (const x of report) console.log(`  ${String(x.rate).padStart(4)} $/h   (net ${Math.round(x.net).toLocaleString("fr-CA")} $ ÷ ${Math.round(x.h)} h)   ${x.name}`);
  if (skipped.length) console.log(`\nRepli au taux moyen (${avgRate} $/h, paie/heures manquantes) : ${skipped.join(", ")}`);
  console.log(`\nTaux moyen : ${avgRate} $/h`);
}
main().catch((e)=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
