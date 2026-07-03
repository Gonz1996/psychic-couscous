import { getDiscipline, getPowerSource } from "./systems";
import type { CodeReference, Discipline, MatrixResult, PowerSource, ScenarioCategory } from "./types";

function csvEscape(value: string): string {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatRef(ref: CodeReference): string {
  return `${ref.code} ${ref.clause}`;
}

const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  alarme: "Alarme",
  supervisory: "Supervision (gicleurs)",
  derangement: "Dérangement",
  operation: "Opération manuelle",
  essai: "Essai / vérification",
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  "protection-incendie": "Protection incendie",
  electricite: "Électricité",
  mecanique: "Mécanique",
};

export const POWER_SOURCE_LABEL: Record<PowerSource, string> = {
  normale: "Normale",
  secours: "Secours",
  "les-deux": "Normale + secours",
};

/**
 * Export CSV — format tabulaire causes (lignes) × effets (colonnes),
 * compatible Excel/LibreOffice (séparateur point-virgule, courant en
 * pratique québécoise pour éviter le conflit avec la virgule décimale).
 * Chaque cellule contient l'état commandé ; les cellules vides signifient
 * « aucune action » pour ce point de contrôle dans ce scénario.
 */
export function toCsv(matrix: MatrixResult): string {
  const lines: string[] = [];
  const header = ["ID scénario", "Catégorie", "Scénario (cause)", "Dispositif initiateur", ...matrix.effects.map((e) => `${e.id} — ${e.system} — ${e.point}`)];
  lines.push(header.map(csvEscape).join(";"));

  for (const row of matrix.rows) {
    const line = [
      row.scenario.id,
      CATEGORY_LABEL[row.scenario.category],
      row.scenario.label,
      row.scenario.initiatingDevice,
      ...matrix.effects.map((e) => {
        const cell = row.cells.get(e.id);
        return cell ? cell.state : "";
      }),
    ];
    lines.push(line.map(csvEscape).join(";"));
  }

  return lines.join("\r\n");
}

/**
 * Export Markdown : sommaire du projet, table complète, puis fiches
 * détaillées par scénario (dispositif, notes d'ingénierie, justification
 * et référence normative de chaque effet déclenché) — le format lisible
 * destiné à la documentation de conception et à la revue par les pairs.
 */
export function toMarkdown(matrix: MatrixResult): string {
  const { config } = matrix;
  const out: string[] = [];

  out.push(`# Matrice causes-effets — système d'alarme incendie`);
  out.push("");
  out.push(`**Projet :** ${config.projectName}`);
  if (config.projectNumber) out.push(`**No de projet :** ${config.projectNumber}`);
  if (config.address) out.push(`**Adresse :** ${config.address}`);
  if (config.preparedBy) out.push(`**Préparé par :** ${config.preparedBy}`);
  out.push(`**Généré le :** ${matrix.generatedAt}`);
  out.push("");
  out.push("## Configuration du projet");
  out.push("");
  out.push("| Paramètre | Valeur |");
  out.push("|---|---|");
  out.push(`| Bâtiment de grande hauteur (>36 m, 3.2.6 CNB) | ${config.isHighBuilding ? "Oui" : "Non"} |`);
  out.push(`| Nombre de cages d'escalier | ${config.numberOfExitStairs} |`);
  out.push(`| Approche de désenfumage | ${config.smokeControlApproach} |`);
  out.push(`| Garage souterrain | ${config.hasUndergroundParking ? "Oui" : "Non"} |`);
  out.push(`| Ascenseur pompier dédié | ${config.hasFirefightersElevator ? "Oui" : "Non"} |`);
  out.push(`| Portes à contrôle d'accès électromagnétique | ${config.hasElectromagneticAccessControlDoors ? "Oui" : "Non"} |`);
  out.push(`| Communication vocale | ${config.hasVoiceCommunication ? "Oui" : "Non"} |`);
  out.push(`| Génératrice de secours | ${config.hasStandbyGenerator ? "Oui" : "Non"} |`);
  out.push(`| Pompe incendie | ${config.hasFirePump ? "Oui" : "Non"} |`);
  out.push(`| Pompe d'appoint (jockey) | ${config.hasJockeyPump ? "Oui" : "Non"} |`);
  out.push(`| Gicleurs partout | ${config.hasWetSprinklerThroughout ? "Oui" : "Non"} |`);
  out.push(`| Détecteurs de fumée en gaine | ${config.hasDuctSmokeDetectors ? "Oui" : "Non"} |`);
  out.push(`| Avertisseurs de logement raccordés au réseau central | ${config.suiteSmokeAlarmsReportToFacp ? "Oui" : "Non"} |`);
  out.push(`| Réentrée aux cages d'escalier | ${config.hasStairReentry ? "Oui" : "Non"} |`);
  out.push(`| Système radio pompier (DAS) | ${config.hasFireDeptRadioSystem ? "Oui" : "Non"} |`);
  out.push(`| Interphonie d'urgence en cage d'escalier | ${config.hasEmergencyIntercomInStairs ? "Oui" : "Non"} |`);
  out.push(`| Vanne d'arrêt automatique du gaz naturel | ${config.hasNaturalGasShutoff ? "Oui" : "Non"} |`);
  out.push(`| Cuisine commerciale avec hotte et extinction dédiée | ${config.hasCommercialKitchenHood ? "Oui" : "Non"} |`);
  out.push(`| Vidéosurveillance (CCTV) intégrée au poste de sécurité | ${config.hasCctv ? "Oui" : "Non"} |`);
  if (config.notes) out.push(`| Notes | ${config.notes} |`);
  out.push("");

  out.push(`## Légende des états`);
  out.push("");
  out.push(
    "`MARCHE`/`ARRET` (ventilateurs, pompes), `OUVERT`/`FERME` (registres, portes), `DEVERROUILLE`/`VERROUILLE` (contrôle d'accès), " +
      "`ACTIF`/`INACTIF` (signalisation, fonctions), `SIGNAL-ALERTE`/`SIGNAL-EVACUATION`/`SIGNAL-SUPERVISION`/`SIGNAL-DERANGEMENT` (réseau avertisseur), " +
      "`RAPPEL-PALIER-DESIGNATION`/`RAPPEL-PALIER-ALTERNATIF` (ascenseurs), `DISPONIBLE-MODE-POMPIER`/`CONTROLE-MANUEL-POMPIER` (préséance manuelle), " +
      "`POSITION-REPLI-SECURITAIRE` (état de repli sur dérangement/perte de commande), `SELON-CONCEPTION` (dépend d'un choix de conception à documenter au projet), " +
      "`AUCUNE-ACTION` (explicitement aucune action). Cellule vide = point de contrôle non concerné par ce scénario.",
  );
  out.push("");

  out.push(`## Points de contrôle retenus (colonnes)`);
  out.push("");
  out.push("| ID | Catégorie | Discipline | Alimentation | Système | Point commandé | Référence(s) |");
  out.push("|---|---|---|---|---|---|---|");
  for (const e of matrix.effects) {
    out.push(
      `| ${e.id} | ${e.category} | ${DISCIPLINE_LABEL[getDiscipline(e)]} | ${POWER_SOURCE_LABEL[getPowerSource(e)]} | ${e.system} | ${e.point} | ${e.references.map(formatRef).join("; ")} |`,
    );
  }
  out.push("");

  out.push(`## Matrice complète`);
  out.push("");
  const header = ["Scénario", ...matrix.effects.map((e) => e.id)];
  out.push(`| ${header.join(" | ")} |`);
  out.push(`|${header.map(() => "---").join("|")}|`);
  for (const row of matrix.rows) {
    const cells = matrix.effects.map((e) => row.cells.get(e.id)?.state ?? "");
    out.push(`| **${row.scenario.id}** — ${row.scenario.label} | ${cells.join(" | ")} |`);
  }
  out.push("");

  out.push(`## Fiches détaillées par scénario`);
  out.push("");
  for (const row of matrix.rows) {
    const s = row.scenario;
    out.push(`### ${s.id} — ${s.label}`);
    out.push("");
    out.push(`**Catégorie :** ${CATEGORY_LABEL[s.category]}  `);
    out.push(`**Dispositif initiateur :** ${s.initiatingDevice}  `);
    out.push(`**Référence(s) :** ${s.references.map(formatRef).join("; ")}`);
    out.push("");
    out.push(s.description);
    out.push("");
    out.push(`**Analyse d'ingénierie / interactions entre systèmes :** ${s.engineeringNotes}`);
    out.push("");
    if (row.cells.size > 0) {
      out.push("| Point de contrôle | État | Délai | Justification | Référence(s) |");
      out.push("|---|---|---|---|---|");
      for (const e of matrix.effects) {
        const cell = row.cells.get(e.id);
        if (!cell) continue;
        const refs = cell.references && cell.references.length > 0 ? cell.references.map(formatRef).join("; ") : e.references.map(formatRef).join("; ");
        out.push(`| ${e.id} — ${e.system} — ${e.point} | ${cell.state} | ${cell.delaySeconds !== undefined ? `${cell.delaySeconds} s` : "—"} | ${cell.rationale} | ${refs} |`);
      }
    } else {
      out.push("_Aucun point de contrôle actif pour ce scénario dans la configuration retenue._");
    }
    out.push("");
  }

  return out.join("\n");
}
