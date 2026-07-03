import { z } from "zod";
import type { ProjectConfig } from "./types";

/**
 * Schéma de validation de la configuration d'un projet. C'est ce bloc de
 * paramètres — pas le catalogue causes/effets lui-même — qui varie d'un
 * projet à l'autre et qui permet de réutiliser l'outil tel quel.
 */
export const projectConfigSchema = z.object({
  projectName: z.string().min(1),
  projectNumber: z.string().optional(),
  address: z.string().optional(),
  preparedBy: z.string().optional(),
  isHighBuilding: z.boolean(),
  numberOfExitStairs: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  smokeControlApproach: z.enum(["extraction-etage-sinistre", "pressurisation-cages-seulement", "compartimentation"]),
  hasUndergroundParking: z.boolean(),
  hasFirefightersElevator: z.boolean(),
  hasElectromagneticAccessControlDoors: z.boolean(),
  hasVoiceCommunication: z.boolean(),
  hasStandbyGenerator: z.boolean(),
  hasFirePump: z.boolean(),
  hasJockeyPump: z.boolean(),
  hasWetSprinklerThroughout: z.boolean(),
  hasDuctSmokeDetectors: z.boolean(),
  suiteSmokeAlarmsReportToFacp: z.boolean(),
  hasStairReentry: z.boolean(),
  hasFireDeptRadioSystem: z.boolean(),
  hasEmergencyIntercomInStairs: z.boolean(),
  hasNaturalGasShutoff: z.boolean(),
  hasCommercialKitchenHood: z.boolean(),
  hasCctv: z.boolean(),
  notes: z.string().optional(),
}) satisfies z.ZodType<ProjectConfig>;

/**
 * Configuration par défaut : bâtiment multirésidentiel type de grande
 * hauteur (>36 m) au Québec, deux cages d'escalier, approche par
 * extraction à l'étage sinistré, garage souterrain, ascenseur pompier
 * dédié. Sert de point de départ à adapter par projet — ce n'est PAS une
 * simplification de la matrice (le catalogue causes/effets reste complet
 * quelle que soit la configuration), seulement l'hypothèse de référence
 * la plus représentative de la pratique courante au Québec.
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  projectName: "Projet type — multirésidentiel de grande hauteur (référence)",
  isHighBuilding: true,
  numberOfExitStairs: 2,
  smokeControlApproach: "extraction-etage-sinistre",
  hasUndergroundParking: true,
  hasFirefightersElevator: true,
  hasElectromagneticAccessControlDoors: true,
  hasVoiceCommunication: true,
  hasStandbyGenerator: true,
  hasFirePump: true,
  hasJockeyPump: true,
  hasWetSprinklerThroughout: true,
  hasDuctSmokeDetectors: true,
  suiteSmokeAlarmsReportToFacp: true,
  hasStairReentry: true,
  hasFireDeptRadioSystem: true,
  hasEmergencyIntercomInStairs: false,
  hasNaturalGasShutoff: false,
  hasCommercialKitchenHood: false,
  hasCctv: true,
};

export function loadProjectConfig(input: unknown): ProjectConfig {
  const merged = { ...DEFAULT_PROJECT_CONFIG, ...(typeof input === "object" && input !== null ? input : {}) };
  return projectConfigSchema.parse(merged);
}
