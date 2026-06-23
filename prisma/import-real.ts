/* Import des vraies données (employés + projets) extraites des fichiers Excel
 * de suivi MEP. Repart à neuf. Champs absents (budgets, %, dates, clients,
 * taux) laissés neutres — à compléter via l'application. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";

const prisma = new PrismaClient();
const JSON_PATH = String.raw`C:\Users\Utilisateur\AppData\Local\Temp\mep_import.json`;
const DATA = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8")) as {
  employees: { firstName: string; lastName: string; email: string; employeeNo: string; title: string; discipline: string; isAdmin: boolean }[];
  projects: { number: string; name: string; cp: string; status: string }[];
};

const DISCIPLINE_META: Record<string, { code: string; color: string }> = {
  "Mécanique / CVAC": { code: "MECA", color: "#3b82f6" },
  "Électricité": { code: "ELEC", color: "#f59e0b" },
  "Protection incendie": { code: "PROT", color: "#ef4444" },
  "Coordination / BIM": { code: "COOR", color: "#8b5cf6" },
  "Gestion de projet": { code: "GEST", color: "#10b981" },
  "Multidisciplinaire (MEP)": { code: "MEP", color: "#64748b" },
};

async function main() {
  console.log("→ Nettoyage de la base…");
  await prisma.timeEntry.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.client.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.office.deleteMany();

  console.log("→ Disciplines, bureau, client…");
  const discByName = new Map<string, string>();
  for (const [name, meta] of Object.entries(DISCIPLINE_META)) {
    const rec = await prisma.discipline.create({ data: { name, code: meta.code, color: meta.color } });
    discByName.set(name, rec.id);
  }
  const office = await prisma.office.create({ data: { name: "Bureau principal", city: "Montréal" } });
  const client = await prisma.client.create({ data: { name: "Client à confirmer", code: "TBD" } });

  console.log("→ Employés…");
  const empByName = new Map<string, string>();
  let cristhianId = "";
  for (const e of DATA.employees) {
    const rec = await prisma.employee.create({
      data: {
        employeeNo: e.employeeNo,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        title: e.title,
        hireDate: new Date(),
        weeklyCapacityHours: 37.5,
        billableTargetPct: 80,
        costRate: 0,
        billRate: 0,
        disciplineId: discByName.get(e.discipline)!,
        officeId: office.id,
      },
    });
    empByName.set(`${e.firstName} ${e.lastName}`.trim(), rec.id);
    if (e.isAdmin) cristhianId = rec.id;
  }
  // Tout le monde relève du directeur (Cristhian).
  if (cristhianId) {
    for (const [, id] of empByName) {
      if (id !== cristhianId) await prisma.employee.update({ where: { id }, data: { managerId: cristhianId } });
    }
  }

  console.log("→ Projets…");
  const today = new Date();
  const endDefault = new Date(today);
  endDefault.setFullYear(endDefault.getFullYear() + 1);
  const mepDisc = discByName.get("Multidisciplinaire (MEP)")!;
  for (const p of DATA.projects) {
    const pmId = empByName.get(p.cp) ?? cristhianId;
    await prisma.project.create({
      data: {
        number: p.number,
        name: p.name,
        status: p.status as never,
        budgetHours: 0,
        budgetFees: 0,
        percentComplete: 0,
        startDate: today,
        endDate: endDefault,
        clientId: client.id,
        disciplineId: mepDisc,
        projectManagerId: pmId,
      },
    });
  }

  console.log("→ Compte administrateur (Cristhian Garzon)…");
  await prisma.user.create({
    data: {
      email: "cgarzon@expertsmep.com",
      name: "Cristhian Garzon",
      passwordHash: await bcrypt.hash("mep2026", 10),
      role: "ADMIN",
      employeeId: cristhianId || null,
    },
  });

  console.log(`✓ Import terminé : ${DATA.employees.length} employés, ${DATA.projects.length} projets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
