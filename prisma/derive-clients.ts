/* Assigne des clients aux projets à partir des préfixes récurrents et fiables
 * des noms de projets. Conservateur : ne touche que les préfixes connus. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KNOWN: { prefix: string; name: string; code: string }[] = [
  { prefix: "MACH", name: "MACH", code: "MACH" },
  { prefix: "GLA", name: "GLA", code: "GLA" },
  { prefix: "COREV", name: "COREV", code: "COREV" },
  { prefix: "CONSTRUGEP", name: "CONSTRUGEP", code: "CGEP" },
  { prefix: "Desjardins", name: "Desjardins", code: "DESJ" },
  { prefix: "Hapopex", name: "Hapopex", code: "HAPO" },
];

async function main() {
  const projects = await prisma.project.findMany({ select: { id: true, number: true, name: true } });
  const clientCache = new Map<string, string>();
  const report: string[] = [];

  for (const p of projects) {
    const upper = p.name.toUpperCase();
    const hit = KNOWN.find((k) => upper.startsWith(k.prefix.toUpperCase() + " ") || upper === k.prefix.toUpperCase());
    if (!hit) continue;

    let clientId = clientCache.get(hit.code);
    if (!clientId) {
      const c = await prisma.client.upsert({
        where: { code: hit.code },
        update: {},
        create: { name: hit.name, code: hit.code },
      });
      clientId = c.id;
      clientCache.set(hit.code, clientId);
    }
    await prisma.project.update({ where: { id: p.id }, data: { clientId } });
    report.push(`${p.number}  ${p.name}  ->  ${hit.name}`);
  }

  console.log(`Clients assignés à ${report.length} projet(s) :`);
  report.forEach((r) => console.log("  " + r));
  const remaining = await prisma.project.count({ where: { client: { code: "TBD" } } });
  console.log(`Restent sur "Client à confirmer" : ${remaining} projet(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
