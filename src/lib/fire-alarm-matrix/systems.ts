import { REF } from "./references";
import type { Discipline, EffectPoint, PowerSource, SystemCategory } from "./types";

/**
 * Corps de métier et source d'alimentation PAR DÉFAUT selon la catégorie de
 * système — plutôt que d'annoter individuellement chacun des points de
 * contrôle (source d'erreurs et de dérive au fil des ajouts), un point
 * hérite de sa catégorie sauf s'il déclare explicitement `discipline`/
 * `powerSource` pour une exception justifiée. Voir `getDiscipline` /
 * `getPowerSource` ci-dessous — c'est par là que le reste du code (exports
 * CSV/Markdown/Excel) doit lire ces informations, jamais directement
 * `point.discipline`.
 */
export const CATEGORY_DISCIPLINE: Record<SystemCategory, Discipline> = {
  "alarme-incendie": "protection-incendie",
  communication: "protection-incendie",
  desenfumage: "mecanique",
  "evacuation-mecanique": "mecanique",
  "traitement-air": "mecanique",
  volets: "mecanique",
  "ventilation-mecanique": "mecanique",
  gicleurs: "mecanique",
  "pompes-incendie": "mecanique",
  ascenseurs: "electricite",
  "controle-acces": "electricite",
  "portes-verrouillage": "electricite",
  generatrice: "electricite",
  "eclairage-securite": "electricite",
  gaz: "mecanique",
  "cuisine-commerciale": "mecanique",
  "securite-electronique": "electricite",
};

export const CATEGORY_POWER_SOURCE: Record<SystemCategory, PowerSource> = {
  "alarme-incendie": "les-deux",
  communication: "les-deux",
  desenfumage: "secours",
  "evacuation-mecanique": "normale",
  "traitement-air": "normale",
  volets: "les-deux",
  "ventilation-mecanique": "normale",
  gicleurs: "les-deux",
  "pompes-incendie": "secours",
  ascenseurs: "secours",
  "controle-acces": "les-deux",
  "portes-verrouillage": "les-deux",
  generatrice: "secours",
  "eclairage-securite": "secours",
  gaz: "les-deux",
  "cuisine-commerciale": "normale",
  "securite-electronique": "secours",
};

export function getDiscipline(point: EffectPoint): Discipline {
  return point.discipline ?? CATEGORY_DISCIPLINE[point.category];
}

export function getPowerSource(point: EffectPoint): PowerSource {
  return point.powerSource ?? CATEGORY_POWER_SOURCE[point.category];
}

/**
 * Catalogue des points de contrôle (colonnes de la matrice).
 *
 * Chaque entrée représente une fonction commandée précise — pas juste un
 * "système" au sens large — parce que c'est à ce niveau de granularité
 * qu'une matrice causes-effets est utilisable en conception, en mise en
 * service (essais intégrés CAN/ULC-S1001) et en exploitation.
 *
 * `appliesIf` permet à un point de disparaître automatiquement d'un projet
 * qui n'a pas l'équipement correspondant (ex. pas de garage souterrain) —
 * c'est ce qui rend le catalogue modulaire et réutilisable tel quel d'un
 * projet à l'autre, sans devoir être réécrit.
 */
export const EFFECT_POINTS: EffectPoint[] = [
  // ───────────────────────── Alarme incendie (signalisation) ─────────────────────────
  {
    id: "AI-01",
    category: "alarme-incendie",
    system: "Réseau avertisseur d'incendie",
    point: "Signal sonore d'alerte (ton continu)",
    zoneScope: "tout-le-batiment",
    description:
      "Ton d'alerte diffusé dans toutes les zones NON visées par le ton d'évacuation, informant les occupants de se tenir prêts sans évacuer immédiatement.",
    references: [REF.signalBatimentGrandeHauteur, REF.alarmeDeuxEtages],
  },
  {
    id: "AI-02",
    category: "alarme-incendie",
    system: "Réseau avertisseur d'incendie",
    point: "Signal sonore d'évacuation (ton temporel/voix)",
    zoneScope: "etage-sinistre-et-adjacents",
    description:
      "Ton d'évacuation à l'étage sinistré, à l'étage au-dessus et à l'étage au-dessous (évacuation par phases), conformément à l'approche de désenfumage retenue.",
    references: [REF.signalBatimentGrandeHauteur, REF.alarmeDeuxEtages],
  },
  {
    id: "AI-03",
    category: "alarme-incendie",
    system: "Communication vocale",
    point: "Message vocal préenregistré d'évacuation",
    zoneScope: "etage-sinistre-et-adjacents",
    description: "Message vocal automatique dirigeant l'évacuation, diffusé dans les zones en ton d'évacuation.",
    references: [REF.communicationVocale],
    appliesIf: (c) => c.hasVoiceCommunication,
  },
  {
    id: "AI-04",
    category: "alarme-incendie",
    system: "Communication vocale",
    point: "Message vocal préenregistré d'alerte",
    zoneScope: "tout-le-batiment",
    description: "Message vocal informant les occupants des zones non évacuées de se tenir prêts à évacuer.",
    references: [REF.communicationVocale],
    appliesIf: (c) => c.hasVoiceCommunication,
  },
  {
    id: "AI-05",
    category: "communication",
    system: "Communication vocale",
    point: "Diffusion vocale en direct (microphone pompier/préposé)",
    zoneScope: "tout-le-batiment",
    description: "Possibilité de surpasser les messages préenregistrés par diffusion en direct depuis le tableau ou le poste de commande des pompiers.",
    references: [REF.communicationVocale, REF.posteCommandePompiers],
    appliesIf: (c) => c.hasVoiceCommunication,
  },
  {
    id: "AI-06",
    category: "alarme-incendie",
    system: "Avertisseurs visuels",
    point: "Avertisseurs stroboscopiques",
    zoneScope: "etage-sinistre-et-adjacents",
    description: "Signalisation visuelle synchronisée dans les zones en évacuation (exigences d'accessibilité).",
    references: [REF.avertisseursVisuels],
  },
  {
    id: "AI-07",
    category: "alarme-incendie",
    system: "Tableau annonciateur principal",
    point: "Indication de la zone en alarme",
    zoneScope: "global",
    description: "Identification de la zone/du dispositif à l'origine du signal au tableau principal (hall d'entrée).",
    references: [REF.signalisationAnnonciateur],
  },
  {
    id: "AI-08",
    category: "alarme-incendie",
    system: "Répétiteur(s) d'annonciateur",
    point: "Indication de la zone en alarme",
    zoneScope: "global",
    description: "Reproduction de l'indication de zone au(x) poste(s) de sécurité ou d'accès pompier, le cas échéant.",
    references: [REF.signalisationAnnonciateur],
  },
  {
    id: "AI-09",
    category: "communication",
    system: "Transmission à la télésurveillance",
    point: "Signal transmis à la station de surveillance",
    zoneScope: "global",
    description: "Transmission automatique du signal d'alarme, de supervision et de dérangement à une station de télésurveillance certifiée.",
    references: [REF.transmissionServiceIncendie],
  },
  {
    id: "AI-10",
    category: "communication",
    system: "Transmission au service de sécurité incendie",
    point: "Signal transmis au SSI (directement ou via télésurveillance)",
    zoneScope: "global",
    description: "Transmission du signal d'alarme feu (mais pas nécessairement les signaux de supervision/dérangement) au service de sécurité incendie municipal.",
    references: [REF.transmissionServiceIncendie],
  },
  {
    id: "AI-11",
    category: "alarme-incendie",
    system: "Réseau avertisseur d'incendie",
    point: "Verrouillage clavier (mise sous silence/réarmement inhibés)",
    zoneScope: "global",
    description: "Temporisation minimale avant que la mise sous silence ou le réarmement ne soit permis, afin de garantir la diffusion complète du signal.",
    references: [REF.installationS524],
  },
  {
    id: "AI-12",
    category: "alarme-incendie",
    system: "Réseau avertisseur d'incendie",
    point: "Enregistrement horodaté de l'événement",
    zoneScope: "global",
    description: "Historique horodaté conservé au tableau (journal des événements), utilisé en enquête et en essais intégrés.",
    references: [REF.essaisIntegresS1001],
  },

  // ───────────────────────── Désenfumage dédié ─────────────────────────
  {
    id: "DF-01",
    category: "desenfumage",
    system: "Ventilateur de pressurisation — cage d'escalier A",
    point: "Démarrage",
    zoneScope: "cage-escalier",
    description: "Pressurisation de la cage d'escalier A afin de maintenir un différentiel de pression empêchant l'infiltration de fumée.",
    references: [REF.pressurisationCagesEscalier],
  },
  {
    id: "DF-02",
    category: "desenfumage",
    system: "Ventilateur de pressurisation — cage d'escalier B",
    point: "Démarrage",
    zoneScope: "cage-escalier",
    description: "Pressurisation de la seconde cage d'escalier (bâtiments à issues multiples).",
    references: [REF.pressurisationCagesEscalier],
    appliesIf: (c) => c.numberOfExitStairs >= 2,
  },
  {
    id: "DF-02B",
    category: "desenfumage",
    system: "Ventilateur de pressurisation — cage d'escalier C/D",
    point: "Démarrage",
    zoneScope: "cage-escalier",
    description: "Pressurisation des cages d'escalier additionnelles (bâtiments à 3 issues ou plus).",
    references: [REF.pressurisationCagesEscalier],
    appliesIf: (c) => c.numberOfExitStairs >= 3,
  },
  {
    id: "DF-03",
    category: "desenfumage",
    system: "Ventilateur d'extraction désenfumage — étage sinistré",
    point: "Démarrage",
    zoneScope: "etage-sinistre",
    description: "Extraction de l'air vicié/enfumé à l'étage sinistré selon l'approche par extraction.",
    references: [REF.conceptionDesenfumage],
    appliesIf: (c) => c.smokeControlApproach === "extraction-etage-sinistre",
  },
  {
    id: "DF-04",
    category: "desenfumage",
    system: "Ventilateur d'alimentation d'air — étages adjacents",
    point: "Démarrage",
    zoneScope: "etage-sinistre-et-adjacents",
    description: "Mise en surpression des étages adjacents à l'étage sinistré pour limiter la propagation de fumée par les gaines et corridors verticaux.",
    references: [REF.conceptionDesenfumage],
    appliesIf: (c) => c.smokeControlApproach === "extraction-etage-sinistre",
  },
  {
    id: "DF-05",
    category: "volets",
    system: "Registres motorisés de désenfumage — conduit d'extraction, étage sinistré",
    point: "Ouverture",
    zoneScope: "etage-sinistre",
    description: "Ouverture du registre de la branche desservant l'étage sinistré pour permettre l'extraction ciblée.",
    references: [REF.conceptionDesenfumage],
    appliesIf: (c) => c.smokeControlApproach === "extraction-etage-sinistre",
  },
  {
    id: "DF-06",
    category: "volets",
    system: "Registres motorisés de désenfumage — conduits des autres étages",
    point: "Fermeture",
    zoneScope: "tout-le-batiment",
    description: "Fermeture des registres des étages non visés afin de concentrer l'extraction sur l'étage sinistré.",
    references: [REF.conceptionDesenfumage],
    appliesIf: (c) => c.smokeControlApproach === "extraction-etage-sinistre",
  },
  {
    id: "DF-07",
    category: "desenfumage",
    system: "Ventilateur de désenfumage — garage souterrain",
    point: "Démarrage (grande vitesse / mode désenfumage)",
    zoneScope: "garage",
    description: "Basculement du réseau d'évacuation du garage (normalement en mode qualité de l'air/CO) en mode désenfumage grande vitesse.",
    references: [REF.controleFumeeGarage],
    appliesIf: (c) => c.hasUndergroundParking,
  },
  {
    id: "DF-08",
    category: "desenfumage",
    system: "Poste de commande des pompiers (FSCS)",
    point: "Disponibilité de la commande manuelle prioritaire",
    zoneScope: "global",
    description: "Le poste de commande dédié aux pompiers demeure disponible pour reprise manuelle de tous les ventilateurs/registres de désenfumage en tout temps après le séquencement automatique.",
    references: [REF.posteCommandePompiers],
  },

  // ───────────────────────── Évacuation mécanique générale ─────────────────────────
  {
    id: "EM-01",
    category: "evacuation-mecanique",
    system: "Ventilateurs d'évacuation générale (salles de bain/cuisines communes)",
    point: "Arrêt",
    zoneScope: "tout-le-batiment",
    description: "Arrêt des ventilateurs d'évacuation non dédiés au désenfumage, afin de ne pas contrarier la stratégie de pressurisation/extraction.",
    references: [REF.arretVentilationGeneral],
  },
  {
    id: "EM-02",
    category: "evacuation-mecanique",
    system: "Ventilateur d'évacuation du garage (mode qualité de l'air)",
    point: "Bascule en mode désenfumage (voir DF-07) / arrêt du mode CO normal",
    zoneScope: "garage",
    description: "Le mode normal de gestion du CO est suspendu au profit du mode désenfumage lors d'une alarme provenant du garage ou du bâtiment.",
    references: [REF.controleFumeeGarage],
    appliesIf: (c) => c.hasUndergroundParking,
  },

  // ───────────────────────── Traitement d'air ─────────────────────────
  {
    id: "TA-01",
    category: "traitement-air",
    system: "Unités de traitement d'air desservant plus d'un étage",
    point: "Arrêt",
    zoneScope: "tout-le-batiment",
    description: "Arrêt des UTA centrales afin d'éviter la propagation de fumée par le réseau de distribution d'air commun.",
    references: [REF.arretVentilationGeneral],
  },
  {
    id: "TA-02",
    category: "traitement-air",
    system: "Unité de traitement d'air dédiée à la pressurisation/désenfumage",
    point: "Démarrage (fonction inverse de TA-01)",
    zoneScope: "etage-sinistre-et-adjacents",
    description: "Les unités dont la fonction est justement d'assurer le désenfumage/la pressurisation continuent ou débutent leur fonctionnement — exclues de l'arrêt général.",
    references: [REF.arretVentilationGeneral, REF.conceptionDesenfumage],
  },
  {
    id: "TA-03",
    category: "traitement-air",
    system: "Appareils de toit (RTU) desservant un seul logement",
    point: "Aucune action",
    zoneScope: "etage-sinistre",
    description: "Les appareils locaux desservant une seule unité (donc un seul compartiment résistant au feu) ne sont pas visés par l'arrêt général du 3.2.6.4.",
    references: [REF.arretVentilationGeneral],
  },

  // ───────────────────────── Volets coupe-feu / coupe-fumée (traversées de séparations) ─────────────────────────
  {
    id: "VO-01",
    category: "volets",
    system: "Volets coupe-feu — traversées de séparations coupe-feu",
    point: "Fermeture",
    zoneScope: "tout-le-batiment",
    description: "Fermeture sur détection thermique locale (fusible/lien thermique 74 °C) ou commande électrique, indépendamment de la zone d'alarme.",
    references: [REF.voletsCoupeFeu],
  },
  {
    id: "VO-02",
    category: "volets",
    system: "Volets coupe-fumée — gaines verticales",
    point: "Fermeture (sauf ceux utilisés pour le désenfumage)",
    zoneScope: "tout-le-batiment",
    description: "Fermeture des volets coupe-fumée hors de la séquence de désenfumage active.",
    references: [REF.voletsCoupeFumee],
  },
  {
    id: "VO-03",
    category: "volets",
    system: "Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré",
    point: "Position désenfumage (ouvert ou fermé selon séquence)",
    zoneScope: "etage-sinistre",
    description: "Les registres combinés participant activement à la séquence de désenfumage prennent la position requise par celle-ci plutôt que la position de repli par défaut.",
    references: [REF.voletsCoupeFumee, REF.conceptionDesenfumage],
  },
  {
    id: "VM-01",
    category: "ventilation-mecanique",
    system: "Registres coupe-feu muraux (traversées de murs coupe-feu)",
    point: "Fermeture",
    zoneScope: "tout-le-batiment",
    description: "Fermeture des registres situés dans les traversées de murs coupe-feu horizontaux entre compartiments.",
    references: [REF.voletsCoupeFeu],
  },
  {
    id: "VM-02",
    category: "ventilation-mecanique",
    system: "Ventilation du local de vide-ordures / local de recyclage",
    point: "Arrêt",
    zoneScope: "local-technique",
    description: "Arrêt de la ventilation dédiée du local de vide-ordures, local à risque élevé d'incendie.",
    references: [REF.arretVentilationGeneral],
  },

  // ───────────────────────── Ascenseurs ─────────────────────────
  {
    id: "AS-01",
    category: "ascenseurs",
    system: "Tous les ascenseurs",
    point: "Rappel Phase I — palier de désignation",
    zoneScope: "global",
    description: "Rappel automatique de tous les ascenseurs au palier de désignation, portes ouvertes, hors service pour l'usage normal.",
    references: [REF.rappelAscenseurs, REF.ascenseurRappelPhaseI],
  },
  {
    id: "AS-02",
    category: "ascenseurs",
    system: "Tous les ascenseurs",
    point: "Rappel Phase I — bascule vers le palier alternatif",
    zoneScope: "global",
    description: "Si le détecteur du palier de désignation est à l'origine de l'alarme (ou si le palier de désignation est l'étage sinistré), le rappel bascule automatiquement vers le palier alternatif désigné.",
    references: [REF.rappelAscenseurs, REF.ascenseurRappelPhaseI],
  },
  {
    id: "AS-03",
    category: "ascenseurs",
    system: "Tous les ascenseurs",
    point: "Interdiction d'arrêt/ouverture des portes à l'étage sinistré",
    zoneScope: "etage-sinistre",
    description: "Aucun ascenseur en mode automatique ne s'arrête ni n'ouvre ses portes à l'étage sinistré tant que le rappel est actif.",
    references: [REF.rappelAscenseurs, REF.ascenseurRappelPhaseI],
  },
  {
    id: "AS-04",
    category: "ascenseurs",
    system: "Ascenseur désigné pompiers",
    point: "Disponibilité du fonctionnement Phase II (manuel, clé pompier)",
    zoneScope: "global",
    description: "Après rappel au palier de désignation, l'ascenseur désigné pompiers demeure disponible pour prise de contrôle manuelle par clé, indépendamment de l'état d'alarme des autres zones.",
    references: [REF.ascenseurPhaseII],
    appliesIf: (c) => c.hasFirefightersElevator,
  },
  {
    id: "AS-05",
    category: "desenfumage",
    system: "Pressurisation de la gaine d'ascenseur",
    point: "Démarrage",
    zoneScope: "gaine-ascenseur",
    description: "Pressurisation de la gaine d'ascenseur lorsque la stratégie de désenfumage du projet en fait une mesure de protection requise (absence de vestibule protégé aux paliers).",
    references: [REF.pressurisationGaineAscenseur],
    appliesIf: (c) => c.smokeControlApproach !== "compartimentation",
  },
  {
    id: "AS-06",
    category: "ascenseurs",
    system: "Poste de commande principal / répétiteur",
    point: "Confirmation visuelle du rappel",
    zoneScope: "global",
    description: "Indicateur lumineux confirmant au tableau/poste de commande que le rappel de chaque ascenseur est complété.",
    references: [REF.rappelAscenseurs],
  },
  {
    id: "AS-07",
    category: "ascenseurs",
    system: "Tous les ascenseurs",
    point: "Fonctionnement sélectif sur alimentation de secours",
    zoneScope: "global",
    description: "Sur perte d'alimentation normale, un nombre limité d'ascenseurs (selon la séquence de sélection automatique) revient en service sur génératrice, en priorité l'ascenseur pompier.",
    references: [REF.chargesAlimentationSecours, REF.delaiTransfertSecours],
    appliesIf: (c) => c.hasStandbyGenerator,
  },
  {
    id: "AS-08",
    category: "ascenseurs",
    system: "Tous les ascenseurs",
    point: "Rappel automatique sur perte du signal (sécurité positive)",
    zoneScope: "global",
    description: "Une perte de continuité du circuit de rappel (dérangement, coupure de câble) doit elle-même provoquer le rappel, par conception à sécurité positive.",
    references: [REF.ascenseurPerteSignal],
  },

  // ───────────────────────── Contrôle d'accès ─────────────────────────
  {
    id: "CA-01",
    category: "controle-acces",
    system: "Portes de contrôle d'accès sur le parcours d'évacuation",
    point: "Déverrouillage",
    zoneScope: "tout-le-batiment",
    description: "Déverrouillage électrique automatique (fail-safe) de toutes les portes de contrôle d'accès situées sur un parcours d'évacuation exigé.",
    references: [REF.deverrouillagePortesAcces],
    appliesIf: (c) => c.hasElectromagneticAccessControlDoors,
  },
  {
    id: "CA-02",
    category: "controle-acces",
    system: "Porte d'accès principale — service incendie",
    point: "Déverrouillage",
    zoneScope: "global",
    description: "Déverrouillage de la porte identifiée pour l'accès prioritaire du service de sécurité incendie.",
    references: [REF.accesServiceIncendie],
    appliesIf: (c) => c.hasElectromagneticAccessControlDoors,
  },
  {
    id: "CA-03",
    category: "controle-acces",
    system: "Portes de contrôle d'accès hors parcours d'évacuation",
    point: "Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet)",
    zoneScope: "tout-le-batiment",
    description: "Les portes hors parcours d'évacuation exigé peuvent demeurer verrouillées selon la stratégie de sécurité retenue au projet ; à confirmer avec l'analyse de code et le consultant en sécurité.",
    references: [REF.deverrouillagePortesAcces],
    appliesIf: (c) => c.hasElectromagneticAccessControlDoors,
  },

  // ───────────────────────── Portes à verrouillage / dispositifs de retenue ─────────────────────────
  {
    id: "PV-01",
    category: "portes-verrouillage",
    system: "Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes)",
    point: "Relâchement (fermeture des portes)",
    zoneScope: "tout-le-batiment",
    description: "Relâchement de tous les dispositifs de retenue en position ouverte pour permettre la fermeture des portes coupe-feu concernées.",
    references: [REF.dispositifsRetenueOuverture],
  },
  {
    id: "PV-02",
    category: "portes-verrouillage",
    system: "Portes de cage d'escalier — réentrée",
    point: "Déverrouillage pour réentrée",
    zoneScope: "cage-escalier",
    description: "Déverrouillage des portes de cage d'escalier permettant la réentrée aux étages, lorsque cette stratégie est requise par l'analyse de code du projet.",
    references: [REF.reentreeCagesEscalier],
    appliesIf: (c) => c.hasStairReentry,
  },

  // ───────────────────────── Génératrice ─────────────────────────
  {
    id: "GE-01",
    category: "generatrice",
    system: "Génératrice de secours",
    point: "Démarrage automatique (sur perte d'alimentation normale)",
    zoneScope: "global",
    description: "Démarrage automatique déclenché par la perte d'alimentation normale détectée en aval du point de raccordement — pas par une alarme incendie en soi.",
    references: [REF.alimentationSecours, REF.delaiTransfertSecours],
    appliesIf: (c) => c.hasStandbyGenerator,
  },
  {
    id: "GE-02",
    category: "generatrice",
    system: "Commutateur de transfert automatique (ATS)",
    point: "Transfert aux charges de sécurité incendie",
    zoneScope: "global",
    description: "Transfert des charges désignées de sécurité (pompe incendie, ascenseurs sélectionnés, désenfumage, éclairage de sécurité, système d'alarme) vers la source de secours dans le délai prescrit.",
    references: [REF.chargesAlimentationSecours, REF.delaiTransfertSecours],
    appliesIf: (c) => c.hasStandbyGenerator,
  },
  {
    id: "GE-03",
    category: "generatrice",
    system: "Génératrice de secours",
    point: "Signal de fonctionnement/dérangement",
    zoneScope: "global",
    description: "Transmission de l'état de la génératrice (en marche, dérangement, niveau de carburant bas) au tableau/à la télésurveillance.",
    references: [REF.alimentationSecours],
    appliesIf: (c) => c.hasStandbyGenerator,
  },

  // ───────────────────────── Pompes incendie ─────────────────────────
  {
    id: "PI-01",
    category: "pompes-incendie",
    system: "Pompe incendie principale",
    point: "Démarrage automatique (chute de pression détectée)",
    zoneScope: "global",
    description: "Démarrage automatique sur chute de pression au réseau, indépendamment de toute alarme incendie — logique propre au contrôleur de pompe.",
    references: [REF.pompeIncendie],
    appliesIf: (c) => c.hasFirePump,
  },
  {
    id: "PI-02",
    category: "pompes-incendie",
    system: "Pompe d'appoint (jockey)",
    point: "Démarrage automatique (maintien de pression)",
    zoneScope: "global",
    description: "Maintien automatique de la pression du réseau pour éviter les démarrages inutiles de la pompe principale.",
    references: [REF.pompeIncendie],
    appliesIf: (c) => c.hasJockeyPump,
  },
  {
    id: "PI-03",
    category: "pompes-incendie",
    system: "Contrôleur de pompe incendie",
    point: "Signal de marche/dérangement transmis au tableau",
    zoneScope: "global",
    description: "Signalisation de l'état de la pompe (marche, dérangement d'alimentation, perte de phase) au tableau annonciateur.",
    references: [REF.pompeIncendie, REF.signalisationAnnonciateur],
    appliesIf: (c) => c.hasFirePump,
  },
  {
    id: "PI-04",
    category: "pompes-incendie",
    system: "Pompe incendie principale",
    point: "Arrêt — manuel uniquement",
    zoneScope: "global",
    description: "Aucun arrêt automatique de la pompe n'est permis ; l'arrêt requiert une intervention manuelle locale au contrôleur.",
    references: [REF.pompeIncendie],
    appliesIf: (c) => c.hasFirePump,
  },

  // ───────────────────────── Gicleurs ─────────────────────────
  {
    id: "GI-01",
    category: "gicleurs",
    system: "Détecteur de débit d'eau (flow switch)",
    point: "Signal d'alarme au tableau",
    zoneScope: "etage-sinistre",
    description: "Le débit d'eau soutenu dans une zone de gicleurs constitue un signal d'ALARME (pas de supervision), déclenchant la même séquence qu'un détecteur de fumée.",
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "GI-02",
    category: "gicleurs",
    system: "Vanne de contrôle de zone de gicleurs",
    point: "Signal de supervision — vanne fermée",
    zoneScope: "etage-sinistre",
    description: "Signal de SUPERVISION uniquement (pas une alarme feu) indiquant qu'une vanne de contrôle est en position fermée ou partiellement fermée.",
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "GI-03",
    category: "gicleurs",
    system: "Réseau de gicleurs",
    point: "Signal de supervision — pression basse",
    zoneScope: "global",
    description: "Signal de supervision indiquant une pression sous le seuil critique dans le réseau.",
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "GI-04",
    category: "gicleurs",
    system: "Réservoir/citerne d'eau incendie",
    point: "Signal de supervision — niveau bas",
    zoneScope: "global",
    description: "Signal de supervision sur niveau d'eau insuffisant dans le réservoir dédié, le cas échéant.",
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "GI-05",
    category: "gicleurs",
    system: "Local technique chauffé abritant le réseau",
    point: "Signal de supervision — température basse",
    zoneScope: "local-technique",
    description: "Signal de supervision sur température insuffisante dans un local chauffé protégeant le réseau du gel.",
    references: [REF.detecteursDebitGicleurs],
  },

  // ───────────────────────── Communication ─────────────────────────
  {
    id: "CO-01",
    category: "communication",
    system: "Système de communication bidirectionnelle pompiers (antenne distribuée)",
    point: "Disponibilité continue, statut vérifié à l'alarme",
    zoneScope: "global",
    description: "Le système radio d'aide aux communications des services d'urgence demeure actif en permanence ; son état de dérangement est signalé indépendamment de l'état d'alarme.",
    references: [REF.bulletinRBQ],
    appliesIf: (c) => c.hasFireDeptRadioSystem,
  },
  {
    id: "CO-02",
    category: "communication",
    system: "Interphonie d'urgence en cage d'escalier",
    point: "Activation / disponibilité",
    zoneScope: "cage-escalier",
    description: "Poste d'intercommunication d'urgence en cage d'escalier relié au poste de sécurité, lorsque prévu au projet.",
    references: [REF.communicationVocale],
    appliesIf: (c) => c.hasEmergencyIntercomInStairs,
  },

  // ───────────────────────── Éclairage de sécurité ─────────────────────────
  {
    id: "ES-01",
    category: "eclairage-securite",
    system: "Éclairage de sécurité / issues",
    point: "Allumage automatique",
    zoneScope: "tout-le-batiment",
    description: "Allumage automatique sur perte de l'alimentation normale d'éclairage (indépendant d'une alarme incendie).",
    references: [REF.alimentationSecours],
  },
  {
    id: "ES-02",
    category: "eclairage-securite",
    system: "Affichage lumineux de sortie",
    point: "Alimentation confirmée par la source de secours",
    zoneScope: "tout-le-batiment",
    description: "Confirmation que les affichages de sortie demeurent alimentés par la source de secours durant l'interruption de l'alimentation normale.",
    references: [REF.alimentationSecours],
    appliesIf: (c) => c.hasStandbyGenerator,
  },

  // ───────────────────────── Désenfumage — équipement mécanique complémentaire ─────────────────────────
  {
    id: "DF-09",
    category: "desenfumage",
    system: "Registres antirefoulement (barométriques) — cage(s) d'escalier pressurisée(s)",
    point: "Ouverture automatique (limitation de surpression)",
    zoneScope: "cage-escalier",
    description:
      "Registre mécanique (non motorisé, non asservi au tableau) qui s'ouvre automatiquement lorsque la pression dans la cage dépasse le seuil admissible, afin que la force requise pour ouvrir les portes d'issue demeure conforme au code — sans ce dispositif, la pressurisation elle-même peut rendre les portes d'issue impossibles à ouvrir.",
    references: [REF.registresAntiRefoulement, REF.pressurisationCagesEscalier],
    discipline: "mecanique",
    powerSource: "les-deux",
  },

  // ───────────────────────── Gicleurs — dispositif mécanique local ─────────────────────────
  {
    id: "GI-06",
    category: "gicleurs",
    system: "Avertisseur hydraulique (gong) — zone de gicleurs",
    point: "Sonnerie locale actionnée par le débit d'eau",
    zoneScope: "etage-sinistre",
    description:
      "Dispositif purement mécanique/hydraulique (roue à eau entraînant un gong), indépendant de l'alimentation électrique et du tableau — signal local audible à proximité de la vanne de zone, complémentaire (pas un substitut) au signal électronique GI-01 transmis au tableau.",
    references: [REF.gongHydrauliqueGicleurs],
    discipline: "mecanique",
    powerSource: "les-deux",
  },

  // ───────────────────────── Gaz naturel ─────────────────────────
  {
    id: "GN-01",
    category: "gaz",
    system: "Vanne d'arrêt automatique du gaz naturel",
    point: "Fermeture",
    zoneScope: "tout-le-batiment",
    description:
      "Coupure automatique de l'alimentation en gaz naturel du bâtiment (ou de la zone en alarme, selon le zonage retenu) sur confirmation d'alarme incendie — mesure de conception fréquente mais non universellement exigée par le CNB ; à documenter selon l'analyse de risque du projet et les exigences du distributeur de gaz.",
    references: [REF.arretGazNaturel],
    appliesIf: (c) => c.hasNaturalGasShutoff,
  },

  // ───────────────────────── Cuisine commerciale (si présente) ─────────────────────────
  {
    id: "CC-01",
    category: "cuisine-commerciale",
    system: "Système d'extinction fixe de la hotte de cuisine commerciale",
    point: "Coupure du gaz/de l'électricité de la ligne de cuisson à l'activation",
    zoneScope: "local-technique",
    description:
      "L'activation du système d'extinction propre à la hotte (déclenchement local, indépendant d'une alarme provenant d'ailleurs dans le bâtiment) coupe automatiquement l'alimentation en combustible/électricité des appareils de cuisson sous la hotte, conformément à NFPA 96.",
    references: [REF.extinctionHotteCuisine],
    appliesIf: (c) => c.hasCommercialKitchenHood,
  },
  {
    id: "CC-02",
    category: "cuisine-commerciale",
    system: "Système d'extinction fixe de la hotte de cuisine commerciale",
    point: "Signal d'alarme transmis au tableau du bâtiment",
    zoneScope: "local-technique",
    description: "L'activation du système d'extinction de la hotte est également raccordée au réseau avertisseur du bâtiment comme dispositif initiateur (voir scénario dédié).",
    references: [REF.extinctionHotteCuisine],
    appliesIf: (c) => c.hasCommercialKitchenHood,
  },

  // ───────────────────────── Sécurité électronique (intégration, hors code incendie) ─────────────────────────
  {
    id: "SE-01",
    category: "securite-electronique",
    system: "Système de vidéosurveillance (CCTV)",
    point: "Enregistrement prioritaire / rappel de la caméra de la zone en alarme au poste de sécurité",
    zoneScope: "etage-sinistre",
    description:
      "Intégration usuelle en exploitation de bâtiment (pas une exigence du code incendie) : la caméra de la zone en alarme est automatiquement affichée/priorisée au poste de sécurité et son enregistrement est marqué pour conservation prolongée.",
    references: [REF.cctvIntegration],
    appliesIf: (c) => c.hasCctv,
  },
];

export function getEffectPoint(id: string): EffectPoint {
  const point = EFFECT_POINTS.find((p) => p.id === id);
  if (!point) throw new Error(`Point de contrôle inconnu dans le catalogue: ${id}`);
  return point;
}
