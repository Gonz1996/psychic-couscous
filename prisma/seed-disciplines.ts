/* Ajoute les disciplines additionnelles demandées par la spec (configurables
 * ensuite via /disciplines). Idempotent : n'ajoute que ce qui manque. */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EXTRA = [
  { name: "Structure", code: "STRUCT", color: "#0ea5e9" },
  { name: "Civil", code: "CIVIL", color: "#84cc16" },
  { name: "Architecture", code: "ARCHI", color: "#a855f7" },
  { name: "Procédé", code: "PROC", color: "#14b8a6" },
  { name: "Télécommunications", code: "TELECOM", color: "#6366f1" },
  { name: "Sécurité", code: "SECU", color: "#f43f5e" },
  { name: "Autres", code: "AUTRE", color: "#94a3b8" },
];

async function main() {
  let added = 0;
  for (const d of EXTRA) {
    const exists = await prisma.discipline.findFirst({ where: { OR: [{ name: d.name }, { code: d.code }] } });
    if (exists) continue;
    await prisma.discipline.create({ data: d });
    added++;
    console.log(`+ ${d.name} (${d.code})`);
  }
  const total = await prisma.discipline.count();
  console.log(`\n${added} ajoutée(s). Total disciplines : ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
