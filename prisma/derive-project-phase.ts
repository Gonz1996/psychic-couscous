/* Classe les projets par phase (conception / surveillance) à partir des
 * fichiers de suivi MEP (source autoritaire) :
 *   • « MEP - Suivi des Projets »       → projets en CONCEPTION
 *   • « MEP - Suivi de la Surveillance » → projets en SURVEILLANCE
 * Un projet peut être dans les deux. Idempotent.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Numéros extraits des fichiers de suivi (snapshots 2026-05).
const CONCEPTION = ["24103","24104","24109","24112","24114","25027","25037","26002","26006","26009","26021","26025","26029","26034","26035","26037","26040","26042"];
const SURVEILLANCE = ["24101","24102","24107","24109","24112","24120","24125","24134","25001","25002","25011","25041","25044","25047","25052","25054","25059","25060","25065"];

async function main() {
  const conc = new Set(CONCEPTION);
  const surv = new Set(SURVEILLANCE);
  const projects = await prisma.project.findMany({ select: { id: true, number: true } });

  let nc = 0, ns = 0, both = 0, none = 0;
  for (const p of projects) {
    const inC = conc.has(p.number);
    const inS = surv.has(p.number);
    await prisma.project.update({ where: { id: p.id }, data: { inConception: inC, inSurveillance: inS } });
    if (inC && inS) both++; else if (inC) nc++; else if (inS) ns++; else none++;
  }
  console.log(`Phases assignées (${projects.length} projets) :`);
  console.log(`  Conception seule    : ${nc}`);
  console.log(`  Surveillance seule  : ${ns}`);
  console.log(`  Les deux            : ${both}`);
  console.log(`  Non spécifié        : ${none}  (projets absents des fichiers de suivi)`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
