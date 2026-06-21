/* =====================================================================
 * Données fictives réalistes — firme de génie-conseil MEP (~20 employés).
 * Génère employés, projets, affectations, saisies de temps et absences
 * produisant volontairement des surcharges, sous-utilisations et projets
 * à risque pour une démonstration parlante.
 * ===================================================================== */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --------------------------- Utilitaires -----------------------------
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260620);
const rand = (min: number, max: number) => min + rng() * (max - min);
const round1 = (n: number) => Math.round(n * 10) / 10;
const deburr = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

function weekStartUTC(input: Date): Date {
  const d = new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d;
}
const addWeeks = (d: Date, n: number) => {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n * 7);
  return r;
};
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
};

const ANCHOR = weekStartUTC(new Date());

// --------------------------- Référentiels ----------------------------
const DISCIPLINES = [
  { code: "ELEC", name: "Électricité", color: "#f59e0b" },
  { code: "MECA", name: "Mécanique / CVAC", color: "#3b82f6" },
  { code: "PLOM", name: "Plomberie", color: "#06b6d4" },
  { code: "PROT", name: "Protection incendie", color: "#ef4444" },
  { code: "CTRL", name: "Contrôles / Automation", color: "#8b5cf6" },
];

const OFFICES = [
  { name: "Montréal", city: "Montréal" },
  { name: "Québec", city: "Québec" },
  { name: "Gatineau", city: "Gatineau" },
];

interface EmpDef {
  no: number;
  first: string;
  last: string;
  title: string;
  disc: string;
  office: string;
  cap: number;
  billTarget: number;
  cost: number;
  bill: number;
  mgr: number | null;
  util: number; // utilisation cible (pilote la charge générée)
}

const EMPLOYEES: EmpDef[] = [
  { no: 1, first: "Marie-Claude", last: "Tremblay", title: "Directrice principale", disc: "ELEC", office: "Montréal", cap: 37.5, billTarget: 50, cost: 95, bill: 220, mgr: null, util: 0.55 },
  { no: 2, first: "Sophie", last: "Gagnon", title: "Chargée de projet", disc: "MECA", office: "Montréal", cap: 37.5, billTarget: 75, cost: 78, bill: 185, mgr: 1, util: 1.05 },
  { no: 3, first: "Alexandre", last: "Roy", title: "Ingénieur électrique senior", disc: "ELEC", office: "Montréal", cap: 37.5, billTarget: 85, cost: 72, bill: 175, mgr: 10, util: 1.18 },
  { no: 4, first: "Julie", last: "Bouchard", title: "Ingénieure mécanique", disc: "MECA", office: "Québec", cap: 37.5, billTarget: 85, cost: 58, bill: 150, mgr: 2, util: 0.92 },
  { no: 5, first: "Martin", last: "Lévesque", title: "Concepteur CVAC", disc: "MECA", office: "Montréal", cap: 40, billTarget: 85, cost: 52, bill: 140, mgr: 2, util: 1.12 },
  { no: 6, first: "Geneviève", last: "Côté", title: "Ingénieure plomberie", disc: "PLOM", office: "Montréal", cap: 37.5, billTarget: 85, cost: 60, bill: 155, mgr: 10, util: 0.88 },
  { no: 7, first: "Patrick", last: "Gauthier", title: "Technicien électrique", disc: "ELEC", office: "Gatineau", cap: 40, billTarget: 90, cost: 45, bill: 120, mgr: 10, util: 0.7 },
  { no: 8, first: "Isabelle", last: "Morin", title: "Designer BIM", disc: "MECA", office: "Montréal", cap: 37.5, billTarget: 80, cost: 52, bill: 140, mgr: 2, util: 0.95 },
  { no: 9, first: "François", last: "Pelletier", title: "Ingénieur protection incendie", disc: "PROT", office: "Québec", cap: 37.5, billTarget: 85, cost: 65, bill: 160, mgr: 2, util: 1.03 },
  { no: 10, first: "Nathalie", last: "Bergeron", title: "Chargée de projet", disc: "ELEC", office: "Montréal", cap: 37.5, billTarget: 75, cost: 80, bill: 190, mgr: 1, util: 0.98 },
  { no: 11, first: "Sébastien", last: "Girard", title: "Ingénieur contrôles", disc: "CTRL", office: "Montréal", cap: 37.5, billTarget: 85, cost: 63, bill: 158, mgr: 2, util: 0.82 },
  { no: 12, first: "Caroline", last: "Fortin", title: "Ingénieure électrique", disc: "ELEC", office: "Québec", cap: 37.5, billTarget: 85, cost: 57, bill: 150, mgr: 10, util: 0.9 },
  { no: 13, first: "Éric", last: "Bélanger", title: "Concepteur plomberie", disc: "PLOM", office: "Gatineau", cap: 37.5, billTarget: 85, cost: 50, bill: 135, mgr: 10, util: 0.65 },
  { no: 14, first: "Mélanie", last: "Ouellet", title: "Technicienne CVAC", disc: "MECA", office: "Montréal", cap: 40, billTarget: 90, cost: 46, bill: 122, mgr: 2, util: 1.06 },
  { no: 15, first: "Jean-Philippe", last: "Caron", title: "Ingénieur mécanique senior", disc: "MECA", office: "Montréal", cap: 37.5, billTarget: 85, cost: 74, bill: 178, mgr: 2, util: 0.94 },
  { no: 16, first: "Annie", last: "Lavoie", title: "Ingénieure contrôles", disc: "CTRL", office: "Québec", cap: 37.5, billTarget: 85, cost: 56, bill: 148, mgr: 2, util: 0.6 },
  { no: 17, first: "David", last: "Fournier", title: "Stagiaire en ingénierie", disc: "ELEC", office: "Montréal", cap: 37.5, billTarget: 70, cost: 32, bill: 90, mgr: 3, util: 0.5 },
  { no: 18, first: "Karine", last: "Simard", title: "Ingénieure protection incendie", disc: "PROT", office: "Montréal", cap: 37.5, billTarget: 85, cost: 61, bill: 156, mgr: 9, util: 0.86 },
  { no: 19, first: "Mathieu", last: "Boucher", title: "Concepteur électrique", disc: "ELEC", office: "Montréal", cap: 37.5, billTarget: 85, cost: 51, bill: 138, mgr: 10, util: 1.0 },
  { no: 20, first: "Stéphanie", last: "Dubé", title: "Technicienne plomberie", disc: "PLOM", office: "Québec", cap: 30, billTarget: 90, cost: 44, bill: 118, mgr: 6, util: 0.72 },
];

const CLIENTS = [
  { code: "CISS", name: "CIUSSS du Centre-Sud", sector: "Santé" },
  { code: "ULAV", name: "Université Laval", sector: "Institutionnel" },
  { code: "VDM", name: "Ville de Montréal", sector: "Municipal" },
  { code: "COM", name: "Cominar", sector: "Commercial" },
  { code: "BOM", name: "Bombardier", sector: "Industriel" },
  { code: "CSDM", name: "Centre de services scolaire de Montréal", sector: "Institutionnel" },
  { code: "IVC", name: "Ivanhoé Cambridge", sector: "Commercial" },
  { code: "HQ", name: "Hydro-Québec", sector: "Industriel" },
];

interface ProjDef {
  number: string;
  name: string;
  client: string;
  pm: number;
  disc: string;
  budgetHours: number;
  budgetFees: number;
  pct: number;
  startW: number;
  endW: number;
  status: string;
  team: number[];
  overrun: number;
}

const PROJECTS: ProjDef[] = [
  { number: "24-1187", name: "Agrandissement Hôpital Notre-Dame", client: "CISS", pm: 2, disc: "MECA", budgetHours: 3200, budgetFees: 480000, pct: 62, startW: -30, endW: 18, status: "ACTIVE", team: [2, 4, 5, 15, 8], overrun: 1.05 },
  { number: "25-1042", name: "Pavillon des sciences — U. Laval", client: "ULAV", pm: 10, disc: "ELEC", budgetHours: 2800, budgetFees: 410000, pct: 40, startW: -16, endW: 20, status: "ACTIVE", team: [10, 3, 12, 19], overrun: 0.95 },
  { number: "25-1098", name: "Réfection aréna municipal", client: "VDM", pm: 2, disc: "MECA", budgetHours: 1400, budgetFees: 195000, pct: 60, startW: -22, endW: 4, status: "ACTIVE", team: [2, 14, 15], overrun: 1.1 },
  { number: "24-0980", name: "Tour de bureaux Centre-ville", client: "COM", pm: 10, disc: "ELEC", budgetHours: 4200, budgetFees: 620000, pct: 88, startW: -40, endW: 6, status: "ACTIVE", team: [10, 3, 19, 17, 1], overrun: 1.3 },
  { number: "25-1110", name: "Centre de données Bombardier", client: "BOM", pm: 2, disc: "CTRL", budgetHours: 1800, budgetFees: 290000, pct: 25, startW: -8, endW: 24, status: "ACTIVE", team: [2, 11, 16], overrun: 1.0 },
  { number: "25-1125", name: "École primaire Rosemont", client: "CSDM", pm: 10, disc: "PLOM", budgetHours: 900, budgetFees: 120000, pct: 15, startW: -4, endW: 20, status: "ACTIVE", team: [13, 6, 20], overrun: 1.0 },
  { number: "24-1203", name: "Complexe commercial Brossard", client: "IVC", pm: 2, disc: "MECA", budgetHours: 2600, budgetFees: 380000, pct: 95, startW: -48, endW: -2, status: "ACTIVE", team: [2, 5, 8], overrun: 1.12 },
  { number: "25-1060", name: "Poste électrique HQ Saint-Jean", client: "HQ", pm: 10, disc: "ELEC", budgetHours: 2200, budgetFees: 360000, pct: 50, startW: -12, endW: 16, status: "ACTIVE", team: [10, 12, 3], overrun: 1.0 },
  { number: "25-1133", name: "Laboratoire de recherche — U. Laval", client: "ULAV", pm: 2, disc: "PROT", budgetHours: 1100, budgetFees: 165000, pct: 30, startW: -6, endW: 18, status: "ACTIVE", team: [9, 18], overrun: 0.9 },
  { number: "25-1150", name: "Bibliothèque municipale", client: "VDM", pm: 10, disc: "MECA", budgetHours: 800, budgetFees: 110000, pct: 10, startW: -2, endW: 22, status: "PLANNING", team: [4, 14], overrun: 1.0 },
  { number: "24-1090", name: "Usine agroalimentaire", client: "BOM", pm: 2, disc: "PLOM", budgetHours: 1600, budgetFees: 230000, pct: 100, startW: -52, endW: -8, status: "COMPLETED", team: [6, 13, 20], overrun: 1.0 },
  { number: "25-1175", name: "Stationnement étagé Griffintown", client: "COM", pm: 10, disc: "ELEC", budgetHours: 600, budgetFees: 85000, pct: 5, startW: 2, endW: 20, status: "PLANNING", team: [19, 17], overrun: 1.0 },
  { number: "24-1145", name: "Centre sportif multifonctionnel", client: "VDM", pm: 2, disc: "MECA", budgetHours: 1900, budgetFees: 270000, pct: 62, startW: -28, endW: 8, status: "ACTIVE", team: [5, 15, 8], overrun: 1.35 },
  { number: "25-1188", name: "Tour résidentielle Griffintown", client: "IVC", pm: 10, disc: "PROT", budgetHours: 1300, budgetFees: 190000, pct: 35, startW: -10, endW: 22, status: "ACTIVE", team: [18, 9], overrun: 1.05 },
];

const ABSENCES = [
  { emp: 3, type: "VACATION", startW: 5, days: 5, label: "Vacances estivales" },
  { emp: 8, type: "TRAINING", startW: 1, days: 2, label: "Formation Revit MEP" },
  { emp: 12, type: "VACATION", startW: 3, days: 5, label: "Vacances" },
  { emp: 5, type: "VACATION", startW: 8, days: 10, label: "Vacances prolongées" },
  { emp: 16, type: "PARENTAL", startW: -2, days: 20, label: "Congé parental partiel" },
  { emp: 18, type: "TRAINING", startW: 2, days: 1, label: "Formation NFPA" },
  { emp: 20, type: "SICK", startW: 0, days: 3, label: "Congé maladie" },
];

async function main() {
  console.log("→ Nettoyage…");
  await prisma.timeEntry.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.client.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.office.deleteMany();

  console.log("→ Référentiels…");
  const discById = new Map<string, string>();
  for (const d of DISCIPLINES) {
    const rec = await prisma.discipline.create({ data: d });
    discById.set(d.code, rec.id);
  }
  const officeById = new Map<string, string>();
  for (const o of OFFICES) {
    const rec = await prisma.office.create({ data: o });
    officeById.set(o.name, rec.id);
  }
  const clientById = new Map<string, string>();
  for (const c of CLIENTS) {
    const rec = await prisma.client.create({ data: c });
    clientById.set(c.code, rec.id);
  }

  console.log("→ Employés…");
  const empById = new Map<number, string>();
  // 1er passage : créer sans gestionnaire
  for (const e of EMPLOYEES) {
    const rec = await prisma.employee.create({
      data: {
        employeeNo: `EMP-${String(e.no).padStart(3, "0")}`,
        firstName: e.first,
        lastName: e.last,
        email: `${deburr(e.first)}.${deburr(e.last)}@expertsmep.com`,
        title: e.title,
        hireDate: addDays(ANCHOR, -Math.round(rand(180, 3200))),
        weeklyCapacityHours: e.cap,
        billableTargetPct: e.billTarget,
        costRate: e.cost,
        billRate: e.bill,
        disciplineId: discById.get(e.disc)!,
        officeId: officeById.get(e.office)!,
      },
    });
    empById.set(e.no, rec.id);
  }
  // 2e passage : gestionnaires
  for (const e of EMPLOYEES) {
    if (e.mgr) {
      await prisma.employee.update({
        where: { id: empById.get(e.no)! },
        data: { managerId: empById.get(e.mgr)! },
      });
    }
  }

  console.log("→ Projets…");
  const projById = new Map<string, string>();
  for (const p of PROJECTS) {
    const rec = await prisma.project.create({
      data: {
        number: p.number,
        name: p.name,
        status: p.status as never,
        budgetHours: p.budgetHours,
        budgetFees: p.budgetFees,
        percentComplete: p.pct,
        startDate: addWeeks(ANCHOR, p.startW),
        endDate: addWeeks(ANCHOR, p.endW),
        clientId: clientById.get(p.client)!,
        disciplineId: discById.get(p.disc)!,
        projectManagerId: empById.get(p.pm)!,
      },
    });
    projById.set(p.number, rec.id);
  }

  console.log("→ Affectations & saisies de temps…");
  // Fenêtre : 8 semaines passées → 14 futures.
  const weeks: Date[] = [];
  for (let i = -8; i <= 14; i++) weeks.push(addWeeks(ANCHOR, i));

  // Projets par employé.
  const empProjects = new Map<number, ProjDef[]>();
  for (const p of PROJECTS) {
    for (const no of p.team) {
      if (!empProjects.has(no)) empProjects.set(no, []);
      empProjects.get(no)!.push(p);
    }
  }

  const isProjectActiveOn = (p: ProjDef, w: Date) =>
    w.getTime() >= addWeeks(ANCHOR, p.startW).getTime() &&
    w.getTime() <= addWeeks(ANCHOR, p.endW).getTime();

  const allocations: { employeeId: string; projectId: string; weekStart: Date; hours: number }[] = [];

  for (const e of EMPLOYEES) {
    const projects = empProjects.get(e.no) ?? [];
    if (!projects.length) continue;
    for (const w of weeks) {
      const active = projects.filter(
        (p) => isProjectActiveOn(p, w) && p.status !== "COMPLETED",
      );
      if (!active.length) continue;
      const desired = e.cap * e.util * rand(0.9, 1.1);
      const perProject = desired / active.length;
      for (const p of active) {
        const hours = round1(Math.max(1, perProject * rand(0.85, 1.15)));
        allocations.push({
          employeeId: empById.get(e.no)!,
          projectId: projById.get(p.number)!,
          weekStart: w,
          hours,
        });
      }
    }
  }
  await prisma.allocation.createMany({ data: allocations });

  // Saisies de temps : pour chaque projet, viser un total réalisé cohérent
  // avec l'avancement et le facteur de dépassement, réparti sur les semaines
  // passées au prorata des affectations.
  const pastWeeks = weeks.filter((w) => w.getTime() <= ANCHOR.getTime());
  const timeEntries: { employeeId: string; projectId: string; weekStart: Date; hours: number; billable: boolean }[] = [];

  for (const p of PROJECTS) {
    const pid = projById.get(p.number)!;
    const projAllocs = allocations.filter(
      (a) => a.projectId === pid && a.weekStart.getTime() <= ANCHOR.getTime(),
    );
    const totalPast = projAllocs.reduce((s, a) => s + a.hours, 0);
    if (totalPast <= 0) continue;
    const targetConsumed = p.budgetHours * (p.pct / 100) * p.overrun;
    for (const a of projAllocs) {
      const share = a.hours / totalPast;
      const hours = round1(Math.max(0.5, targetConsumed * share * rand(0.9, 1.1)));
      timeEntries.push({
        employeeId: a.employeeId,
        projectId: pid,
        weekStart: a.weekStart,
        hours,
        billable: rng() < 0.88,
      });
    }
  }
  // dédoublonnage (employé, projet, semaine) au cas où
  await prisma.timeEntry.createMany({ data: timeEntries });

  console.log("→ Absences…");
  for (const a of ABSENCES) {
    const start = addWeeks(ANCHOR, a.startW);
    const end = addDays(start, a.days - 1);
    const businessDays = Math.min(a.days, Math.max(1, a.days));
    await prisma.absence.create({
      data: {
        employeeId: empById.get(a.emp)!,
        type: a.type as never,
        startDate: start,
        endDate: end,
        hours: round1((EMPLOYEES.find((e) => e.no === a.emp)!.cap / 5) * businessDays),
        note: a.label,
      },
    });
  }

  console.log("→ Comptes utilisateurs…");
  await prisma.user.create({
    data: {
      email: "admin@expertsmep.com",
      name: "Marie-Claude Tremblay",
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: "ADMIN",
      employeeId: empById.get(1)!,
    },
  });
  await prisma.user.create({
    data: {
      email: "sophie.gagnon@expertsmep.com",
      name: "Sophie Gagnon",
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: "MANAGER",
      employeeId: empById.get(2)!,
    },
  });

  console.log(
    `✓ Seed terminé : ${EMPLOYEES.length} employés, ${PROJECTS.length} projets, ${allocations.length} affectations, ${timeEntries.length} saisies de temps.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
