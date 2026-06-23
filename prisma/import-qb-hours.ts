/* Import QuickBooks — Heures réelles → TimeEntry (tâche #26).
 *
 * Source : « MEP Experts Conseils_Timesheet Detail by Employee.csv »
 *   Structure : le nom de l'employé est sur une ligne seule, suivi de ses
 *   activités. Colonnes d'activité :
 *     [1] Date (YYYY-MM-DD) [5] Durée (HH:MM) [7] Client [8] Description
 *
 * Règles :
 *   - Durée HH:MM → heures décimales (08:00 = 8 ; 06:15 = 6,25).
 *   - Client « NNNNN - … » → matché au projet en base par préfixe 5 chiffres.
 *   - Catégories non-projet (Formation interne, Amélioration continue, Réunions…)
 *     = pas de préfixe numérique → EXCLUES (overhead, sans projet).
 *   - Heures sur un projet absent de la base OU un employé inconnu = ignorées
 *     et rapportées (à décider avec le client).
 *   - Agrégation par employé × projet × semaine (lundi UTC).
 *
 * Idempotent : VIDE toutes les TimeEntry puis réinsère.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();
const CSV_PATH = String.raw`Q:\1.Cristhian\AI TEST\09_AI_PROJECT\MEP Experts Conseils_Timesheet Detail by Employee.csv`;

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

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Lundi 00:00 UTC de la semaine contenant `input` (copie de lib/dates). */
function weekStartUTC(input: string): Date {
  const d = new Date(input);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function durationToHours(s: string): number {
  const m = (s || "").trim().match(/^(\d+):(\d{2})$/);
  if (!m) return 0;
  return Number(m[1]) + Number(m[2]) / 60;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, "utf-8").replace(/^﻿/, "");
  const rows = parseCsv(raw);

  const employees = await prisma.employee.findMany({ select: { id: true, firstName: true, lastName: true } });
  const empByName = new Map<string, string>();
  for (const e of employees) empByName.set(norm(`${e.firstName} ${e.lastName}`), e.id);

  const projects = await prisma.project.findMany({ select: { id: true, number: true } });
  const projByNumber = new Map<string, string>();
  for (const p of projects) projByNumber.set(p.number, p.id);

  // Agrégation : clé `${employeeId}|${projectId}|${weekISO}` → heures.
  const agg = new Map<string, { employeeId: string; projectId: string; weekStart: Date; hours: number }>();

  let currentEmpId: string | null = null;
  let currentEmpName = "";
  const unknownEmployees = new Map<string, number>(); // nom → heures
  const unknownProjects = new Map<string, number>();   // "NNNNN - nom" → heures
  let nonProjectHours = 0;
  let importedHours = 0;
  const matchedEmps = new Set<string>();

  for (const r of rows) {
    const c0 = (r[0] || "").trim();
    const date = (r[1] || "").trim();
    const isActivity = /^\d{4}-\d{2}-\d{2}$/.test(date);

    // Ligne d'en-tête d'employé : nom en colonne 0, pas de date.
    if (c0 && !isActivity) {
      if (c0 === "Date de l’activité" || c0 === "MEP Experts Conseils") continue;
      currentEmpName = c0;
      currentEmpId = empByName.get(norm(c0)) ?? null;
      continue;
    }
    if (!isActivity) continue;

    const hours = durationToHours(r[5] || "");
    if (hours <= 0) continue;
    const client = (r[7] || "").trim();
    const pm = client.match(/^(\d{5})/);

    if (!pm) { nonProjectHours += hours; continue; } // catégorie non-projet
    const projectId = projByNumber.get(pm[1]);
    if (!projectId) { unknownProjects.set(client, (unknownProjects.get(client) || 0) + hours); continue; }
    if (!currentEmpId) { unknownEmployees.set(currentEmpName, (unknownEmployees.get(currentEmpName) || 0) + hours); continue; }

    matchedEmps.add(currentEmpId);
    importedHours += hours;
    const ws = weekStartUTC(date);
    const key = `${currentEmpId}|${projectId}|${ws.toISOString()}`;
    const cur = agg.get(key);
    if (cur) cur.hours += hours;
    else agg.set(key, { employeeId: currentEmpId, projectId, weekStart: ws, hours });
  }

  // Réinsertion idempotente.
  await prisma.timeEntry.deleteMany();
  const data = [...agg.values()].map((a) => ({
    employeeId: a.employeeId,
    projectId: a.projectId,
    weekStart: a.weekStart,
    hours: Math.round(a.hours * 100) / 100,
    billable: true,
  }));
  await prisma.timeEntry.createMany({ data });

  const fmt = (n: number) => n.toLocaleString("fr-CA", { maximumFractionDigits: 1 });
  console.log(`\n=== HEURES réelles importées ===`);
  console.log(`✓ ${data.length} TimeEntry (employé×projet×semaine)`);
  console.log(`✓ ${fmt(importedHours)} h importées sur projets reconnus`);
  console.log(`✓ ${matchedEmps.size}/${employees.length} employés avec des heures`);
  console.log(`\nℹ ${fmt(nonProjectHours)} h non-projet exclues (formation, amélioration continue, réunions…)`);

  if (unknownEmployees.size) {
    const tot = [...unknownEmployees.values()].reduce((a, b) => a + b, 0);
    console.log(`\n⚠ ${unknownEmployees.size} employé(s) du timesheet ABSENT(s) de la base — ${fmt(tot)} h ignorées :`);
    [...unknownEmployees.entries()].sort((a, b) => b[1] - a[1]).forEach(([n, h]) => console.log(`   ${fmt(h)} h\t${n}`));
  }
  if (unknownProjects.size) {
    const tot = [...unknownProjects.values()].reduce((a, b) => a + b, 0);
    console.log(`\n⚠ ${unknownProjects.size} projet(s) du timesheet ABSENT(s) de la base — ${fmt(tot)} h ignorées :`);
    [...unknownProjects.entries()].sort((a, b) => b[1] - a[1]).forEach(([n, h]) => console.log(`   ${fmt(h)} h\t${n}`));
  }

  // Top projets par heures importées (contrôle de cohérence).
  const byProj = new Map<string, number>();
  for (const a of agg.values()) byProj.set(a.projectId, (byProj.get(a.projectId) || 0) + a.hours);
  const projName = new Map(projects.map((p) => [p.id, p.number]));
  console.log(`\n=== Top 10 projets par heures réelles ===`);
  [...byProj.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([id, h]) => console.log(`   ${fmt(h)} h\t${projName.get(id)}`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
