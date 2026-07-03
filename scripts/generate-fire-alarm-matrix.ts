/**
 * Génère la matrice causes-effets d'alarme incendie pour un projet donné.
 *
 * Usage :
 *   npm run matrix:generate -- fire-alarm-matrix/examples/tour-standard.json
 *   npm run matrix:generate -- fire-alarm-matrix/examples/tour-compartimentee.json ./sortie
 *   npm run matrix:generate                       (utilise la configuration de référence par défaut)
 *
 * Écrit deux fichiers dans le dossier de sortie (par défaut fire-alarm-matrix/output/) :
 *   <slug>.csv   — table brute (Excel/LibreOffice)
 *   <slug>.md    — document complet (sommaire, table, fiches détaillées par scénario)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateCauseEffectMatrix, loadProjectConfig, slugify, toCsv, toMarkdown } from "../src/lib/fire-alarm-matrix";

function main() {
  const [, , configArg, outDirArg] = process.argv;

  const config = configArg
    ? loadProjectConfig(JSON.parse(readFileSync(path.resolve(configArg), "utf-8")))
    : loadProjectConfig({});

  const outDir = path.resolve(outDirArg ?? "fire-alarm-matrix/output");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const matrix = generateCauseEffectMatrix(config);

  const slug = slugify(config.projectName || "projet");
  const csvPath = path.join(outDir, `${slug}.csv`);
  const mdPath = path.join(outDir, `${slug}.md`);

  writeFileSync(csvPath, toCsv(matrix), "utf-8");
  writeFileSync(mdPath, toMarkdown(matrix), "utf-8");

  console.log(`Matrice générée pour « ${config.projectName} »`);
  console.log(`  ${matrix.scenarios.length} scénarios × ${matrix.effects.length} points de contrôle`);
  console.log(`  CSV : ${csvPath}`);
  console.log(`  MD  : ${mdPath}`);
}

main();
