/**
 * Modèle de données du générateur de matrice causes-effets — alarme incendie.
 *
 * Portée : bâtiments multirésidentiels de grande hauteur (Groupe C, CNB 2015)
 * assujettis aux dispositions de l'article 3.2.6 (bâtiments de grande hauteur).
 *
 * Ce module ne contient que des types. Le contenu technique (référentiel de
 * codes, catalogue de systèmes, catalogue de scénarios) vit dans les fichiers
 * voisins ; le moteur de règles (build-matrix.ts) combine le tout avec la
 * configuration d'un projet donné pour produire une matrice concrète.
 */

/** Référentiel normatif reconnu pour la justification de chaque cellule. */
export type CodeName =
  | "CNB2015" // Code national du bâtiment du Canada 2015 (+ modifications)
  | "CCQ-Ch1" // Code de construction du Québec, Chapitre I – Bâtiment
  | "CAN-ULC-S524" // Installation des réseaux avertisseurs d'incendie
  | "CAN-ULC-S536" // Vérification périodique / inspection et mise à l'essai
  | "CAN-ULC-S537" // Vérification (mise en service) des réseaux avertisseurs
  | "CAN-ULC-S1001" // Essais intégrés des systèmes de protection incendie et de sécurité des occupants
  | "CAN-ULC-S536-DAMPERS" // Registres coupe-feu / coupe-fumée (essais)
  | "CSA-B44" // Code de sécurité des ascenseurs
  | "NFPA-92" // Systèmes de contrôle de fumée (référence de conception)
  | "RBQ"; // Directives / bulletins de la Régie du bâtiment du Québec

export interface CodeReference {
  code: CodeName;
  clause: string;
  /** Précision optionnelle (ex. exception, note d'application régionale). */
  note?: string;
}

/** Grande catégorie de système visée par un point de contrôle (colonne). */
export type SystemCategory =
  | "alarme-incendie"
  | "desenfumage"
  | "evacuation-mecanique"
  | "traitement-air"
  | "volets"
  | "ascenseurs"
  | "controle-acces"
  | "portes-verrouillage"
  | "generatrice"
  | "pompes-incendie"
  | "gicleurs"
  | "ventilation-mecanique"
  | "communication"
  | "eclairage-securite";

/** Portée de zone standardisée (relative), réutilisable indépendamment du nombre d'étages réel. */
export type ZoneScope =
  | "etage-sinistre"
  | "etage-sinistre-et-adjacents" // étage sinistré + étage au-dessus + étage au-dessous
  | "tout-le-batiment"
  | "cage-escalier"
  | "gaine-ascenseur"
  | "garage"
  | "local-technique"
  | "duct-associe" // conduit/UTA associé au détecteur de gaine ayant causé l'alarme
  | "global"; // point de bâtiment (ex. génératrice), non lié à une zone

/** État résultant appliqué à un point de contrôle pour un scénario donné. */
export type EffectState =
  | "MARCHE"
  | "ARRET"
  | "OUVERT"
  | "FERME"
  | "DEVERROUILLE"
  | "VERROUILLE"
  | "ACTIF"
  | "INACTIF"
  | "SIGNAL-ALERTE"
  | "SIGNAL-EVACUATION"
  | "SIGNAL-SUPERVISION"
  | "SIGNAL-DERANGEMENT"
  | "RAPPEL-PALIER-DESIGNATION"
  | "RAPPEL-PALIER-ALTERNATIF"
  | "DISPONIBLE-MODE-POMPIER"
  | "CONTROLE-MANUEL-POMPIER"
  | "POSITION-REPLI-SECURITAIRE"
  | "AUCUNE-ACTION"
  | "SELON-CONCEPTION";

/** Un point de contrôle = une colonne de la matrice (un système/fonction précis). */
export interface EffectPoint {
  id: string;
  category: SystemCategory;
  /** Système ou équipement (ex. "Ventilateur de pressurisation — cage A"). */
  system: string;
  /** Fonction/point précis commandé (ex. "Démarrage du ventilateur"). */
  point: string;
  zoneScope: ZoneScope;
  /** Description libre de la logique de commande, utile en ingénierie de détail. */
  description: string;
  references: CodeReference[];
  /**
   * Condition d'applicabilité au projet. Si absente, le point s'applique à
   * tous les projets. Permet la modularité (ex. n'apparaît que si le projet
   * a un garage souterrain, un ascenseur pompier dédié, etc.).
   */
  appliesIf?: (config: ProjectConfig) => boolean;
}

/** Une cellule active de la matrice pour un scénario donné (ligne × colonne). */
export interface ScenarioEffect {
  effectId: string;
  state: EffectState;
  /** Temporisation éventuelle avant l'action, en secondes. */
  delaySeconds?: number;
  rationale: string;
  references?: CodeReference[];
  /** Restreint l'applicabilité de CETTE cellule (au-delà de l'EffectPoint lui-même). */
  appliesIf?: (config: ProjectConfig) => boolean;
}

export type ScenarioCategory =
  | "alarme" // signal de feu confirmé — déclenche la séquence de désenfumage/évacuation
  | "supervisory" // signal de supervision (gicleurs) — ne déclenche PAS l'évacuation
  | "derangement" // trouble/dérangement système
  | "operation" // opération manuelle (pompier, technicien)
  | "essai"; // mode test/vérification

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  label: string;
  initiatingDevice: string;
  description: string;
  /** Analyse d'ingénierie : pourquoi ce scénario se comporte ainsi, interactions entre systèmes. */
  engineeringNotes: string;
  effects: ScenarioEffect[];
  references: CodeReference[];
  appliesIf?: (config: ProjectConfig) => boolean;
}

/** Stratégie de contrôle de fumée retenue pour le projet (choix de conception). */
export type SmokeControlApproach =
  | "extraction-etage-sinistre" // extraction à l'étage sinistré + alimentation des étages adjacents
  | "pressurisation-cages-seulement" // compartimentation : pressurisation des cages seulement
  | "compartimentation"; // approche par compartimentation étanche, sans ventilateurs dédiés d'extraction

/** Paramètres de projet — c'est ce bloc qui rend l'outil réutilisable d'un projet à l'autre. */
export interface ProjectConfig {
  projectName: string;
  projectNumber?: string;
  address?: string;
  preparedBy?: string;
  /** true = assujetti à 3.2.6 CNB (bâtiment de grande hauteur, >36 m). */
  isHighBuilding: boolean;
  numberOfExitStairs: 1 | 2 | 3 | 4;
  smokeControlApproach: SmokeControlApproach;
  hasUndergroundParking: boolean;
  /** Ascenseur(s) dimensionné(s) et désigné(s) pour le service des pompiers. */
  hasFirefightersElevator: boolean;
  hasElectromagneticAccessControlDoors: boolean;
  /** Communication vocale (obligatoire de facto pour bâtiment de grande hauteur — 3.2.6.1). */
  hasVoiceCommunication: boolean;
  hasStandbyGenerator: boolean;
  hasFirePump: boolean;
  hasJockeyPump: boolean;
  hasWetSprinklerThroughout: boolean;
  hasDuctSmokeDetectors: boolean;
  /** Détecteurs de fumée privés des logements raccordés au système central (choix/exigence projet-spécifique). */
  suiteSmokeAlarmsReportToFacp: boolean;
  hasStairReentry: boolean;
  hasFireDeptRadioSystem: boolean;
  hasEmergencyIntercomInStairs: boolean;
  notes?: string;
}

export interface MatrixRow {
  scenario: Scenario;
  cells: Map<string, ScenarioEffect | undefined>; // effectId -> cellule (undefined = aucune action)
}

export interface MatrixResult {
  config: ProjectConfig;
  generatedAt: string;
  effects: EffectPoint[]; // colonnes retenues pour ce projet
  scenarios: Scenario[]; // lignes retenues pour ce projet
  rows: MatrixRow[];
}
