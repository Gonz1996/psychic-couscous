import type { CodeReference } from "./types";

/**
 * Référentiel normatif centralisé. Chaque citation utilisée dans le
 * catalogue de systèmes ou de scénarios doit provenir d'ici : ça évite les
 * incohérences de numérotation d'article et donne un point unique de mise à
 * jour lors d'un changement d'édition de code.
 *
 * ⚠️ Les numéros d'article du CNB 2015 et du Code de construction du Québec
 * (Chapitre I, qui incorpore le CNB avec des modifications) doivent être
 * confirmés par l'ingénieur au dossier au moment de l'analyse de code du
 * projet — la concordance exacte peut varier selon la version consolidée en
 * vigueur (décrets et bulletins RBQ subséquents à 2015). Ce module fournit
 * un point de départ défendable, pas une opinion de code scellée.
 */
export const REF = {
  // --- CNB 2015 — Système d'alarme incendie et détection (3.2.4) ---
  obligationSystemeAlarme: { code: "CNB2015", clause: "3.2.4.1" } satisfies CodeReference,
  detecteursFumeeAiresCommunes: { code: "CNB2015", clause: "3.2.4.9" } satisfies CodeReference,
  detecteursConduits: {
    code: "CNB2015",
    clause: "3.2.4.9",
    note: "Détecteurs de fumée dans les conduits desservant plus d'un compartiment/étage",
  } satisfies CodeReference,
  postesManuels: { code: "CNB2015", clause: "3.2.4.6" } satisfies CodeReference,
  signalisationAnnonciateur: { code: "CNB2015", clause: "3.2.4.11" } satisfies CodeReference,
  alarmeDeuxEtages: { code: "CNB2015", clause: "3.2.4.19" } satisfies CodeReference,
  signalBatimentGrandeHauteur: {
    code: "CNB2015",
    clause: "3.2.4.20",
    note: "Ton d'alerte / ton d'évacuation distincts par zone dans les bâtiments de grande hauteur",
  } satisfies CodeReference,
  communicationVocale: { code: "CNB2015", clause: "3.2.4.21" } satisfies CodeReference,
  avertisseursVisuels: { code: "CNB2015", clause: "3.2.4.18" } satisfies CodeReference,
  transmissionServiceIncendie: { code: "CNB2015", clause: "3.2.4.8" } satisfies CodeReference,
  detecteursDebitGicleurs: {
    code: "CNB2015",
    clause: "3.2.4.10",
    note: "Raccordement des dispositifs de débit d'eau au système d'alarme incendie",
  } satisfies CodeReference,
  alarmesLogementsInterconnexion: {
    code: "CCQ-Ch1",
    clause: "3.2.4.9.",
    note: "Modification québécoise — interconnexion des avertisseurs de fumée de logement au réseau du bâtiment (à confirmer selon la classe du projet)",
  } satisfies CodeReference,

  // --- CNB 2015 — Dispositions pour bâtiments de grande hauteur (3.2.6) ---
  applicationGrandeHauteur: { code: "CNB2015", clause: "3.2.6.1" } satisfies CodeReference,
  arretVentilationGeneral: { code: "CNB2015", clause: "3.2.6.4" } satisfies CodeReference,
  pressurisationCagesEscalier: { code: "CNB2015", clause: "3.2.6.3" } satisfies CodeReference,
  controleFumeeGarage: {
    code: "CNB2015",
    clause: "3.2.6.4",
    note: "Application au réseau d'évacuation du garage souterrain",
  } satisfies CodeReference,
  posteCommandePompiers: { code: "CNB2015", clause: "3.2.6.8" } satisfies CodeReference,
  rappelAscenseurs: { code: "CNB2015", clause: "3.2.6.9" } satisfies CodeReference,
  pressurisationGaineAscenseur: { code: "CNB2015", clause: "3.2.6.7" } satisfies CodeReference,

  // --- CNB 2015 — Alimentation de secours (3.2.7) ---
  alimentationSecours: { code: "CNB2015", clause: "3.2.7.1" } satisfies CodeReference,
  chargesAlimentationSecours: { code: "CNB2015", clause: "3.2.7.2" } satisfies CodeReference,
  delaiTransfertSecours: {
    code: "CNB2015",
    clause: "3.2.7.2",
    note: "Transfert automatique des charges de sécurité — délai maximal prescrit",
  } satisfies CodeReference,

  // --- CNB 2015 — Registres et fermetures coupe-feu (3.1.8) ---
  voletsCoupeFeu: { code: "CNB2015", clause: "3.1.8.3" } satisfies CodeReference,
  voletsCoupeFumee: { code: "CNB2015", clause: "3.1.8.5" } satisfies CodeReference,
  dispositifsRetenueOuverture: {
    code: "CNB2015",
    clause: "3.1.8.12",
    note: "Dispositifs de retenue en position ouverte pour portes coupe-feu — relâchement sur alarme",
  } satisfies CodeReference,

  // --- CNB 2015 — Lutte contre l'incendie (3.2.5) ---
  reseauCanalisations: { code: "CNB2015", clause: "3.2.5.8" } satisfies CodeReference,
  pompeIncendie: { code: "CNB2015", clause: "3.2.5.9" } satisfies CodeReference,
  accesServiceIncendie: { code: "CNB2015", clause: "3.2.5.5" } satisfies CodeReference,

  // --- CNB 2015 — Issues (3.4.6) ---
  deverrouillagePortesAcces: { code: "CNB2015", clause: "3.4.6.16" } satisfies CodeReference,
  reentreeCagesEscalier: { code: "CNB2015", clause: "3.4.6.20" } satisfies CodeReference,

  // --- Normes ULC ---
  installationS524: { code: "CAN-ULC-S524", clause: "généralités" } satisfies CodeReference,
  zonageS524: { code: "CAN-ULC-S524", clause: "6" } satisfies CodeReference,
  verificationS537: { code: "CAN-ULC-S537", clause: "généralités" } satisfies CodeReference,
  inspectionS536: { code: "CAN-ULC-S536", clause: "généralités" } satisfies CodeReference,
  essaisIntegresS1001: {
    code: "CAN-ULC-S1001",
    clause: "5",
    note: "Exige l'élaboration d'une matrice causes-effets comme critère d'acceptation avant les essais intégrés",
  } satisfies CodeReference,
  matriceExigeeS1001: {
    code: "CAN-ULC-S1001",
    clause: "5.2",
    note: "Matrice causes-effets = document de référence obligatoire pour la planification des essais intégrés",
  } satisfies CodeReference,

  // --- Ascenseurs ---
  ascenseurRappelPhaseI: { code: "CSA-B44", clause: "2.27" } satisfies CodeReference,
  ascenseurPhaseII: { code: "CSA-B44", clause: "2.27.3" } satisfies CodeReference,
  ascenseurPerteSignal: {
    code: "CSA-B44",
    clause: "2.27.3.2",
    note: "Sécurité positive — la perte du signal de rappel doit provoquer le rappel (défaillance sécuritaire)",
  } satisfies CodeReference,

  // --- Référence de conception (non normative au Québec mais pratique courante) ---
  conceptionDesenfumage: {
    code: "NFPA-92",
    clause: "conception",
    note: "Référence de dimensionnement/conception des systèmes de contrôle de fumée — usage courant en pratique québécoise",
  } satisfies CodeReference,

  bulletinRBQ: {
    code: "RBQ",
    clause: "à confirmer",
    note: "Valider auprès des bulletins/directives RBQ en vigueur pour la juridiction du projet",
  } satisfies CodeReference,
} as const;
