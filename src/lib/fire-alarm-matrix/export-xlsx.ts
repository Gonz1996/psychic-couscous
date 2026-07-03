import ExcelJS from "exceljs";
import { getDiscipline, getPowerSource } from "./systems";
import type { CodeReference, Discipline, MatrixResult, PowerSource, ScenarioCategory } from "./types";

const DISCIPLINE_LABEL: Record<Discipline, string> = {
  "protection-incendie": "Protection incendie",
  electricite: "Électricité",
  mecanique: "Mécanique",
};

const POWER_SOURCE_LABEL: Record<PowerSource, string> = {
  normale: "Normale",
  secours: "Secours",
  "les-deux": "Normale + secours",
};

const DISCIPLINE_FILL: Record<Discipline, string> = {
  "protection-incendie": "FFFBE5E5",
  electricite: "FFFFF6DA",
  mecanique: "FFE2ECF7",
};

/**
 * Export Excel (.xlsx) — le livrable destiné à la conception et à la revue
 * par les pairs. Contrairement au CSV (données brutes) ou au Markdown
 * (documentation), ce classeur est mis en forme pour être lisible et
 * présentable tel quel : bandeau de conformité réglementaire, en-têtes
 * figés, code de couleur par catégorie de scénario, feuille de légende,
 * feuille de configuration du projet et feuille des références normatives
 * effectivement mobilisées par la matrice générée.
 */

const NAVY = "1F3864";
const FIRE_RED = "C00000";
const WHITE = "FFFFFFFF";

const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  alarme: "Alarme",
  supervisory: "Supervision (gicleurs)",
  derangement: "Dérangement",
  operation: "Opération manuelle",
  essai: "Essai / vérification",
};

const CATEGORY_FILL: Record<ScenarioCategory, string> = {
  alarme: "FFFDE2E2",
  supervisory: "FFFFF2CC",
  derangement: "FFE7E6E6",
  operation: "FFDDEBF7",
  essai: "FFE2F0D9",
};

function argb(hex: string): string {
  return hex.length === 6 ? `FF${hex}` : hex;
}

function formatRef(ref: CodeReference): string {
  return `${ref.code} ${ref.clause}${ref.note ? ` — ${ref.note}` : ""}`;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFB7B7B7" } };
  return { top: side, bottom: side, left: side, right: side };
}

export async function toXlsxBuffer(matrix: MatrixResult): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MEP Resource Command Center — Matrice causes-effets alarme incendie";
  workbook.created = new Date(matrix.generatedAt);

  buildSommaireSheet(workbook, matrix);
  buildMatriceSheet(workbook, matrix);
  buildPointsDeControleSheet(workbook, matrix);
  buildLegendeSheet(workbook);
  buildConfigurationSheet(workbook, matrix);
  buildReferencesSheet(workbook, matrix);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function buildSommaireSheet(workbook: ExcelJS.Workbook, matrix: MatrixResult) {
  const sheet = workbook.addWorksheet("Sommaire", { properties: { tabColor: { argb: argb(FIRE_RED) } } });
  sheet.columns = [{ width: 4 }, { width: 90 }];

  let r = 2;
  const title = sheet.getCell(`B${r}`);
  title.value = "MATRICE CAUSES-EFFETS — SYSTÈME D'ALARME INCENDIE";
  title.font = { size: 18, bold: true, color: { argb: argb(FIRE_RED) } };
  r += 1;
  sheet.getCell(`B${r}`).value = "Bâtiment multirésidentiel de grande hauteur — Québec";
  sheet.getCell(`B${r}`).font = { size: 12, italic: true, color: { argb: "FF444444" } };
  r += 2;

  const project = sheet.getCell(`B${r}`);
  project.value = matrix.config.projectName;
  project.font = { size: 14, bold: true };
  r += 1;
  const infoLines: [string, string | undefined][] = [
    ["No de projet", matrix.config.projectNumber],
    ["Adresse", matrix.config.address],
    ["Préparé par", matrix.config.preparedBy],
    ["Généré le", new Date(matrix.generatedAt).toLocaleString("fr-CA")],
  ];
  for (const [label, value] of infoLines) {
    if (!value) continue;
    sheet.getCell(`B${r}`).value = `${label} : ${value}`;
    sheet.getCell(`B${r}`).font = { size: 10 };
    r += 1;
  }
  r += 1;

  const bannerStart = r;
  sheet.getCell(`B${r}`).value = "CONFORMITÉ RÉGLEMENTAIRE ET NORMATIVE";
  sheet.getCell(`B${r}`).font = { bold: true, color: { argb: WHITE } };
  sheet.getCell(`B${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
  r += 1;
  const compliance = [
    "• Code national du bâtiment du Canada 2015 (CNB 2015) — art. 3.2.4 (détection, alarme), 3.2.6 (bâtiments de grande hauteur), 3.2.7 (alimentation de secours), 3.1.8 (registres coupe-feu/coupe-fumée), 3.2.5 (lutte contre l'incendie), 3.4.6 (issues)",
    "• Code de construction du Québec, Chapitre I — Bâtiment (incorpore le CNB 2015 avec les modifications québécoises)",
    "• CAN/ULC-S524 (installation), CAN/ULC-S536 (inspection et mise à l'essai), CAN/ULC-S537 (vérification)",
    "• CAN/ULC-S1001 (essais intégrés des systèmes de protection incendie et de sécurité des occupants) — exige explicitement une matrice causes-effets comme critère d'acceptation",
    "• CSA B44 (Code de sécurité des ascenseurs)",
  ];
  for (const line of compliance) {
    sheet.getCell(`B${r}`).value = line;
    sheet.getCell(`B${r}`).font = { size: 10 };
    sheet.getCell(`B${r}`).alignment = { wrapText: true };
    r += 1;
  }
  for (let row = bannerStart; row < r; row++) {
    sheet.getCell(`B${row}`).border = { left: { style: "thin", color: { argb: argb(NAVY) } } };
  }
  r += 1;

  sheet.getCell(`B${r}`).value =
    "⚠️ Les numéros d'article doivent être confirmés par l'ingénieur au dossier selon l'édition consolidée en vigueur et l'analyse de code du projet réel. Ce classeur constitue une base de conception défendable, pas une opinion de code scellée.";
  sheet.getCell(`B${r}`).font = { size: 9, italic: true, color: { argb: "FF7F7F7F" } };
  sheet.getCell(`B${r}`).alignment = { wrapText: true };
  sheet.getRow(r).height = 30;
  r += 2;

  sheet.getCell(`B${r}`).value = `${matrix.scenarios.length} scénarios (causes) × ${matrix.effects.length} points de contrôle (effets) — voir l'onglet « Matrice »`;
  sheet.getCell(`B${r}`).font = { size: 10, bold: true };
  r += 1;
  sheet.getCell(`B${r}`).value =
    "Onglets : Sommaire · Matrice · Points de contrôle · Légende · Configuration du projet · Références normatives";
  sheet.getCell(`B${r}`).font = { size: 10, color: { argb: "FF444444" } };

  sheet.pageSetup = { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
}

function buildMatriceSheet(workbook: ExcelJS.Workbook, matrix: MatrixResult) {
  const sheet = workbook.addWorksheet("Matrice", { properties: { tabColor: { argb: argb(NAVY) } }, views: [{ state: "frozen", xSplit: 3, ySplit: 1 }] });
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9, // A4
  };
  sheet.headerFooter = {
    oddHeader: `&L&8${matrix.config.projectName}&C&8Matrice causes-effets — alarme incendie&R&8${new Date(matrix.generatedAt).toLocaleDateString("fr-CA")}`,
    oddFooter: "&L&8À valider par l'ingénieur au dossier&C&8&P / &N&R&8Confidentiel — usage interne du projet",
  };
  sheet.pageSetup.printTitlesRow = "1:1";
  sheet.pageSetup.printTitlesColumn = "A:C";

  const idCols = [
    { header: "Scénario (cause)", width: 46 },
    { header: "Catégorie", width: 20 },
    { header: "Dispositif initiateur", width: 34 },
  ];
  sheet.columns = [
    ...idCols.map((c) => ({ width: c.width })),
    ...matrix.effects.map(() => ({ width: 10 })),
  ];

  const headerRow = sheet.getRow(1);
  headerRow.values = [
    "Scénario (cause)",
    "Catégorie",
    "Dispositif initiateur",
    ...matrix.effects.map((e) => e.id),
  ];
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  });
  headerRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  headerRow.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

  // Note sur chaque en-tête de colonne d'effet : système/point commandé + référence(s).
  matrix.effects.forEach((e, i) => {
    const cell = headerRow.getCell(4 + i);
    cell.note = {
      texts: [
        { text: `${e.system} — ${e.point}\n`, font: { bold: true, size: 9 } },
        { text: e.references.map(formatRef).join("\n"), font: { size: 8 } },
      ],
    };
  });

  let r = 2;
  for (const row of matrix.rows) {
    const excelRow = sheet.getRow(r);
    excelRow.getCell(1).value = `${row.scenario.id} — ${row.scenario.label}`;
    excelRow.getCell(2).value = CATEGORY_LABEL[row.scenario.category];
    excelRow.getCell(3).value = row.scenario.initiatingDevice;

    const categoryFill = CATEGORY_FILL[row.scenario.category];
    for (let c = 1; c <= 3; c++) {
      const cell = excelRow.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: categoryFill } };
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", wrapText: c === 1 };
      cell.font = { size: 10 };
    }

    matrix.effects.forEach((e, i) => {
      const cell = excelRow.getCell(4 + i);
      const value = row.cells.get(e.id)?.state;
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { size: 8 };
      if (value) {
        cell.value = value;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF7EE" } };
      }
    });

    r += 1;
  }

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 3 + matrix.effects.length } };
}

/**
 * Feuille de référence listant chaque colonne de la matrice avec son
 * corps de métier responsable, sa source d'alimentation et sa justification
 * normative complète — l'information que la feuille Matrice ne peut pas
 * afficher en largeur de colonne mais que la conception de détail exige.
 */
function buildPointsDeControleSheet(workbook: ExcelJS.Workbook, matrix: MatrixResult) {
  const sheet = workbook.addWorksheet("Points de contrôle", {
    properties: { tabColor: { argb: argb(NAVY) } },
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  sheet.columns = [
    { width: 10 }, // ID
    { width: 20 }, // Catégorie
    { width: 20 }, // Discipline
    { width: 18 }, // Alimentation
    { width: 46 }, // Système
    { width: 46 }, // Point commandé
    { width: 40 }, // Référence(s)
  ];

  const header = sheet.getRow(1);
  header.values = ["ID", "Catégorie", "Discipline", "Alimentation", "Système", "Point commandé", "Référence(s)"];
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
    cell.border = thinBorder();
  });

  matrix.effects.forEach((e, i) => {
    const r = i + 2;
    const discipline = getDiscipline(e);
    sheet.getCell(`A${r}`).value = e.id;
    sheet.getCell(`A${r}`).font = { bold: true };
    sheet.getCell(`B${r}`).value = e.category;
    sheet.getCell(`C${r}`).value = DISCIPLINE_LABEL[discipline];
    sheet.getCell(`D${r}`).value = POWER_SOURCE_LABEL[getPowerSource(e)];
    sheet.getCell(`E${r}`).value = e.system;
    sheet.getCell(`F${r}`).value = e.point;
    sheet.getCell(`G${r}`).value = e.references.map(formatRef).join(" ; ");
    for (const col of ["A", "B", "C", "D", "E", "F", "G"]) {
      const cell = sheet.getCell(`${col}${r}`);
      cell.border = thinBorder();
      cell.alignment = { wrapText: true, vertical: "middle" };
    }
    sheet.getCell(`C${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DISCIPLINE_FILL[discipline] } };
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 7 } };
}

function buildLegendeSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Légende");
  sheet.columns = [{ width: 32 }, { width: 90 }];

  const rows: [string, string][] = [
    ["MARCHE / ARRET", "Ventilateurs, pompes — démarrage ou arrêt de l'équipement"],
    ["OUVERT / FERME", "Registres, portes — position commandée"],
    ["DEVERROUILLE / VERROUILLE", "Contrôle d'accès — état de verrouillage électrique"],
    ["ACTIF / INACTIF", "Signalisation ou fonction — état activé ou non"],
    ["SIGNAL-ALERTE / SIGNAL-EVACUATION", "Réseau avertisseur — ton diffusé selon la zone"],
    ["SIGNAL-SUPERVISION", "Signal de supervision gicleur — PAS une alarme feu, aucune évacuation"],
    ["SIGNAL-DERANGEMENT", "Signal de dérangement système — PAS une alarme feu"],
    ["RAPPEL-PALIER-DESIGNATION / RAPPEL-PALIER-ALTERNATIF", "Ascenseurs — rappel Phase I selon CSA B44"],
    ["DISPONIBLE-MODE-POMPIER / CONTROLE-MANUEL-POMPIER", "Préséance manuelle disponible ou activement prise par un pompier"],
    ["POSITION-REPLI-SECURITAIRE", "État de repli prédéterminé sur dérangement ou perte de commande"],
    ["SELON-CONCEPTION", "Dépend d'un choix de conception propre au projet — à documenter"],
    ["AUCUNE-ACTION", "Explicitement aucune action pour ce point dans ce scénario"],
    ["(cellule vide)", "Point de contrôle non concerné par ce scénario"],
  ];

  sheet.getCell("A1").value = "État";
  sheet.getCell("B1").value = "Signification";
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
  });

  rows.forEach(([state, meaning], i) => {
    const r = i + 2;
    sheet.getCell(`A${r}`).value = state;
    sheet.getCell(`A${r}`).font = { bold: true, size: 10 };
    sheet.getCell(`B${r}`).value = meaning;
    sheet.getCell(`B${r}`).alignment = { wrapText: true };
    sheet.getCell(`A${r}`).border = thinBorder();
    sheet.getCell(`B${r}`).border = thinBorder();
  });

  sheet.getCell(`A${rows.length + 3}`).value = "Code de couleur des lignes (onglet Matrice)";
  sheet.getCell(`A${rows.length + 3}`).font = { bold: true };
  const categories: ScenarioCategory[] = ["alarme", "supervisory", "derangement", "operation", "essai"];
  categories.forEach((cat, i) => {
    const r = rows.length + 4 + i;
    sheet.getCell(`A${r}`).value = CATEGORY_LABEL[cat];
    sheet.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: CATEGORY_FILL[cat] } };
    sheet.getCell(`A${r}`).border = thinBorder();
  });

  const disciplineStart = rows.length + categories.length + 5;
  sheet.getCell(`A${disciplineStart}`).value = "Code de couleur des disciplines (onglet Points de contrôle)";
  sheet.getCell(`A${disciplineStart}`).font = { bold: true };
  const disciplines: Discipline[] = ["protection-incendie", "electricite", "mecanique"];
  disciplines.forEach((d, i) => {
    const r = disciplineStart + 1 + i;
    sheet.getCell(`A${r}`).value = DISCIPLINE_LABEL[d];
    sheet.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: DISCIPLINE_FILL[d] } };
    sheet.getCell(`A${r}`).border = thinBorder();
  });
}

function buildConfigurationSheet(workbook: ExcelJS.Workbook, matrix: MatrixResult) {
  const sheet = workbook.addWorksheet("Configuration du projet");
  sheet.columns = [{ width: 44 }, { width: 50 }];
  const c = matrix.config;

  const rows: [string, string][] = [
    ["Nom du projet", c.projectName],
    ["No de projet", c.projectNumber ?? "—"],
    ["Adresse", c.address ?? "—"],
    ["Préparé par", c.preparedBy ?? "—"],
    ["Bâtiment de grande hauteur (>36 m, 3.2.6 CNB)", c.isHighBuilding ? "Oui" : "Non"],
    ["Nombre de cages d'escalier", String(c.numberOfExitStairs)],
    ["Approche de désenfumage", c.smokeControlApproach],
    ["Garage souterrain", c.hasUndergroundParking ? "Oui" : "Non"],
    ["Ascenseur pompier dédié", c.hasFirefightersElevator ? "Oui" : "Non"],
    ["Contrôle d'accès électromagnétique", c.hasElectromagneticAccessControlDoors ? "Oui" : "Non"],
    ["Communication vocale", c.hasVoiceCommunication ? "Oui" : "Non"],
    ["Génératrice de secours", c.hasStandbyGenerator ? "Oui" : "Non"],
    ["Pompe incendie", c.hasFirePump ? "Oui" : "Non"],
    ["Pompe d'appoint (jockey)", c.hasJockeyPump ? "Oui" : "Non"],
    ["Gicleurs partout", c.hasWetSprinklerThroughout ? "Oui" : "Non"],
    ["Détecteurs de fumée en gaine", c.hasDuctSmokeDetectors ? "Oui" : "Non"],
    ["Avertisseurs de logement raccordés au réseau central", c.suiteSmokeAlarmsReportToFacp ? "Oui" : "Non"],
    ["Réentrée aux cages d'escalier", c.hasStairReentry ? "Oui" : "Non"],
    ["Système radio pompier (DAS)", c.hasFireDeptRadioSystem ? "Oui" : "Non"],
    ["Interphonie d'urgence en cage d'escalier", c.hasEmergencyIntercomInStairs ? "Oui" : "Non"],
    ["Vanne d'arrêt automatique du gaz naturel", c.hasNaturalGasShutoff ? "Oui" : "Non"],
    ["Cuisine commerciale avec hotte et extinction dédiée", c.hasCommercialKitchenHood ? "Oui" : "Non"],
    ["Vidéosurveillance (CCTV) intégrée au poste de sécurité", c.hasCctv ? "Oui" : "Non"],
    ["Notes", c.notes ?? "—"],
  ];

  sheet.getCell("A1").value = "Paramètre";
  sheet.getCell("B1").value = "Valeur";
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
  });

  rows.forEach(([label, value], i) => {
    const r = i + 2;
    sheet.getCell(`A${r}`).value = label;
    sheet.getCell(`A${r}`).font = { bold: true, size: 10 };
    sheet.getCell(`B${r}`).value = value;
    sheet.getCell(`B${r}`).alignment = { wrapText: true };
    sheet.getCell(`A${r}`).border = thinBorder();
    sheet.getCell(`B${r}`).border = thinBorder();
  });
}

function buildReferencesSheet(workbook: ExcelJS.Workbook, matrix: MatrixResult) {
  const sheet = workbook.addWorksheet("Références normatives");
  sheet.columns = [{ width: 18 }, { width: 16 }, { width: 70 }];

  const seen = new Map<string, CodeReference>();
  for (const e of matrix.effects) for (const ref of e.references) seen.set(`${ref.code} ${ref.clause}`, ref);
  for (const s of matrix.scenarios) {
    for (const ref of s.references) seen.set(`${ref.code} ${ref.clause}`, ref);
    for (const eff of s.effects) for (const ref of eff.references ?? []) seen.set(`${ref.code} ${ref.clause}`, ref);
  }
  const refs = [...seen.values()].sort((a, b) => (a.code === b.code ? a.clause.localeCompare(b.clause) : a.code.localeCompare(b.code)));

  sheet.getCell("A1").value = "Code/norme";
  sheet.getCell("B1").value = "Article/clause";
  sheet.getCell("C1").value = "Note";
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(NAVY) } };
  });

  refs.forEach((ref, i) => {
    const r = i + 2;
    sheet.getCell(`A${r}`).value = ref.code;
    sheet.getCell(`B${r}`).value = ref.clause;
    sheet.getCell(`C${r}`).value = ref.note ?? "";
    sheet.getCell(`C${r}`).alignment = { wrapText: true };
    for (const col of ["A", "B", "C"]) sheet.getCell(`${col}${r}`).border = thinBorder();
  });

  const footer = refs.length + 3;
  sheet.getCell(`A${footer}`).value =
    "Toutes les références ci-dessus sont mobilisées par au moins un point de contrôle ou un scénario retenu dans cette matrice. À confirmer selon l'édition consolidée en vigueur au moment du dépôt du projet.";
  sheet.getCell(`A${footer}`).font = { italic: true, size: 9, color: { argb: "FF7F7F7F" } };
  sheet.getCell(`A${footer}`).alignment = { wrapText: true };
  sheet.mergeCells(`A${footer}:C${footer}`);
}
