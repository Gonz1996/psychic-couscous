/* Import QuickBooks — Honoraires réels + vrais clients (tâche #26).
 *
 * Source : « MEP Experts Conseils_Rapport sur la rentabilité des projets.csv »
 *   colonnes : Projet, Client, Revenus__TOTAL, Coûts__TOTAL, Profit__TOTAL, Marge
 *
 * Matching par numéro de projet (5 chiffres en tête). Pour chaque projet en base
 * trouvé dans le rapport :
 *   - budgetFees = feeDesign = Revenus ; feeSupervision = 0   (QB ne sépare pas
 *     conception/surveillance — répartissable ensuite dans l'éditeur)
 *   - client réassigné au vrai client (col Client), upsert par code dérivé.
 *
 * Idempotent : réexécutable sans effet de bord (upsert + update).
 * NE TOUCHE PAS aux TimeEntry (voir import-qb-hours.ts).
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();
const CSV_PATH = String.raw`Q:\1.Cristhian\AI TEST\09_AI_PROJECT\MEP Experts Conseils_Rapport sur la rentabilité des projets.csv`;

// --- Parseur CSV minimal (gère les champs entre guillemets avec virgules) ---
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // guillemet échappé
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* ignore */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const toNum = (s: string) => Number((s || "").replace(/[",\s]/g, "")) || 0;

// Code client déterministe (ASCII, alphanum, max 12) + déduplication.
function makeCode(name: string, used: Set<string>): string {
  let base = name
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // enlève accents
    .toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "CLIENT";
  let code = base;
  let n = 2;
  while (used.has(code)) code = `${base.slice(0, 10)}${n++}`;
  used.add(code);
  return code;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, "utf-8").replace(/^﻿/, "");
  const rows = parseCsv(raw);

  // Localiser l'en-tête (ligne commençant par "Projet").
  const headerIdx = rows.findIndex((r) => r[0]?.trim() === "Projet");
  if (headerIdx < 0) throw new Error("En-tête 'Projet' introuvable dans le CSV.");

  // number -> { client, revenus } (lignes projet uniquement = préfixe 5 chiffres).
  const byNumber = new Map<string, { client: string; revenus: number }>();
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const projet = (r[0] || "").trim();
    const m = projet.match(/^(\d{5})/);
    if (!m) continue; // catégories non-projet (Administration, Formation…)
    const number = m[1];
    const client = (r[1] || "").trim();
    const revenus = toNum(r[2]);
    // En cas de doublon de numéro, garder la ligne au plus gros revenu.
    const prev = byNumber.get(number);
    if (!prev || revenus > prev.revenus) byNumber.set(number, { client, revenus });
  }

  const projects = await prisma.project.findMany({
    select: { id: true, number: true, name: true, clientId: true },
    orderBy: { number: "asc" },
  });

  // Pré-charger les codes clients déjà utilisés pour éviter les collisions.
  const usedCodes = new Set<string>((await prisma.client.findMany({ select: { code: true } })).map((c) => c.code));
  const clientIdByName = new Map<string, string>();
  async function getClientId(name: string): Promise<string> {
    if (clientIdByName.has(name)) return clientIdByName.get(name)!;
    // Réutiliser un client existant portant déjà ce nom exact.
    const existing = await prisma.client.findUnique({ where: { name } });
    if (existing) { clientIdByName.set(name, existing.id); return existing.id; }
    const code = makeCode(name, usedCodes);
    const c = await prisma.client.create({ data: { name, code } });
    clientIdByName.set(name, c.id);
    return c.id;
  }

  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const p of projects) {
    const hit = byNumber.get(p.number);
    if (!hit) { unmatched.push(`${p.number}  ${p.name}`); continue; }
    const clientId = await getClientId(hit.client);
    await prisma.project.update({
      where: { id: p.id },
      data: {
        budgetFees: hit.revenus,
        feeDesign: hit.revenus,
        feeSupervision: 0,
        clientId,
      },
    });
    matched.push(`${p.number}  ${hit.revenus.toLocaleString("fr-CA")} $  →  ${hit.client}  (${p.name})`);
  }

  // Nettoyage : supprimer les clients orphelins (0 projet), SAUF « Client à confirmer ».
  const orphans = await prisma.client.findMany({
    where: { projects: { none: {} }, NOT: { code: "TBD" } },
    select: { id: true, name: true, code: true },
  });
  for (const o of orphans) await prisma.client.delete({ where: { id: o.id } });

  console.log(`\n=== HONORAIRES + CLIENTS importés ===`);
  console.log(`✓ ${matched.length} projets mis à jour :`);
  matched.forEach((m) => console.log("  " + m));
  if (unmatched.length) {
    console.log(`\n⚠ ${unmatched.length} projet(s) sans ligne QB (laissés neutres) :`);
    unmatched.forEach((m) => console.log("  " + m));
  }
  if (orphans.length) {
    console.log(`\n🧹 ${orphans.length} client(s) orphelin(s) supprimé(s) : ${orphans.map((o) => o.code).join(", ")}`);
  }
  const clients = await prisma.client.findMany({ select: { name: true, _count: { select: { projects: true } } }, orderBy: { name: "asc" } });
  console.log(`\n=== CLIENTS en base (${clients.length}) ===`);
  clients.forEach((c) => console.log(`  ${c._count.projects}×  ${c.name}`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
