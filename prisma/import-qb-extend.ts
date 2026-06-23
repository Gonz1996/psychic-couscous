/* Import QuickBooks — Extension (décisions client) :
 *   1. Crée David Jutras (Électricité, actif, embauché 2026-01-05) s'il manque.
 *   2. Crée les projets présents au timesheet (avec heures) mais absents de la
 *      base, à partir du rapport de rentabilité (nom + client + revenus).
 *
 * À exécuter AVANT import-qb-fees.ts et import-qb-hours.ts (qui rempliront
 * ensuite honoraires/clients et heures sur ces nouveaux projets/employés).
 * Idempotent : ne recrée pas ce qui existe déjà.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();
const DIR = String.raw`Q:\1.Cristhian\AI TEST\09_AI_PROJECT`;
const FEES_CSV = `${DIR}\\MEP Experts Conseils_Rapport sur la rentabilité des projets.csv`;
const HOURS_CSV = `${DIR}\\MEP Experts Conseils_Timesheet Detail by Employee.csv`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "", inQuotes = false;
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const read = (p: string) => parseCsv(fs.readFileSync(p, "utf-8").replace(/^﻿/, ""));
const stripNumPrefix = (s: string) => s.replace(/^\d{5}\s*-?\s*/, "").trim();

async function main() {
  // ---------- 1. David Jutras ----------
  const office = await prisma.office.findFirst({ select: { id: true } });
  const elec = await prisma.discipline.findUnique({ where: { name: "Électricité" }, select: { id: true } });
  const mep = await prisma.discipline.findUnique({ where: { name: "Multidisciplinaire (MEP)" }, select: { id: true } });
  const cristhian = await prisma.employee.findFirst({ where: { firstName: "Cristhian", lastName: "Garzon" }, select: { id: true } });
  if (!office || !elec || !mep || !cristhian) throw new Error("Référentiels manquants (bureau/discipline/Cristhian).");

  const existingJutras = await prisma.employee.findFirst({ where: { firstName: "David", lastName: "Jutras" } });
  if (!existingJutras) {
    await prisma.employee.create({
      data: {
        employeeNo: "QB-DJUTRAS",
        firstName: "David", lastName: "Jutras",
        email: "djutras@expertsmep.com",
        title: "Concepteur électrique",
        status: "ACTIVE",
        hireDate: new Date(Date.UTC(2026, 0, 5)),
        weeklyCapacityHours: 37.5, billableTargetPct: 80, costRate: 0, billRate: 0,
        disciplineId: elec.id, officeId: office.id, managerId: cristhian.id,
      },
    });
    console.log("✓ Employé créé : David Jutras (Électricité, actif, embauché 2026-01-05)");
  } else {
    console.log("• David Jutras existe déjà — ignoré.");
  }

  // ---------- 2. Projets manquants (présents au timesheet avec heures) ----------
  // Rapport de rentabilité : number → { name, client }
  const feesRows = read(FEES_CSV);
  const feeHeader = feesRows.findIndex((r) => r[0]?.trim() === "Projet");
  const meta = new Map<string, { name: string; client: string }>();
  for (let i = feeHeader + 1; i < feesRows.length; i++) {
    const projet = (feesRows[i][0] || "").trim();
    const m = projet.match(/^(\d{5})/);
    if (!m) continue;
    if (!meta.has(m[1])) meta.set(m[1], { name: stripNumPrefix(projet), client: (feesRows[i][1] || "").trim() });
  }

  // Timesheet : numéros ayant des heures (>0).
  const hoursRows = read(HOURS_CSV);
  const numbersWithHours = new Set<string>();
  for (const r of hoursRows) {
    const date = (r[1] || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const dur = (r[5] || "").trim();
    if (!/^\d+:\d{2}$/.test(dur) || dur === "00:00") continue;
    const m = (r[7] || "").trim().match(/^(\d{5})/);
    if (m) numbersWithHours.add(m[1]);
  }

  const existing = new Set((await prisma.project.findMany({ select: { number: true } })).map((p) => p.number));
  const tbd = await prisma.client.findFirst({ where: { code: "TBD" }, select: { id: true } });
  if (!tbd) throw new Error("Client « à confirmer » (TBD) introuvable.");
  const today = new Date();
  const endDefault = new Date(today); endDefault.setFullYear(endDefault.getFullYear() + 1);

  const created: string[] = [];
  for (const number of [...numbersWithHours].sort()) {
    if (existing.has(number)) continue;
    const info = meta.get(number);
    const name = info?.name || `Projet ${number}`;
    await prisma.project.create({
      data: {
        number, name, status: "ACTIVE",
        budgetHours: 0, budgetFees: 0, percentComplete: 0,
        startDate: today, endDate: endDefault,
        clientId: tbd.id,
        disciplineId: mep.id,
        projectManagerId: cristhian.id,
      },
    });
    created.push(`${number}  ${name}`);
  }

  console.log(`\n✓ ${created.length} projet(s) créé(s) depuis le timesheet :`);
  created.forEach((c) => console.log("  " + c));
  const total = await prisma.project.count();
  console.log(`\nProjets en base : ${total}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
