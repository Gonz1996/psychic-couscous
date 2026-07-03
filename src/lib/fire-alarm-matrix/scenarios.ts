import { REF } from "./references";
import type { Scenario, ScenarioEffect } from "./types";

/**
 * Catalogue des scénarios (lignes de la matrice).
 *
 * La séquence complète de désenfumage/évacuation est partagée par tous les
 * scénarios d'ALARME confirmée (peu importe le type de dispositif
 * initiateur — c'est le principe même d'une matrice causes-effets : le
 * système réagit à l'ÉTAT "alarme", pas au dispositif qui l'a produit).
 * `sharedAlarmSequence()` factorise cette séquence pour éviter la
 * duplication et garantir la cohérence entre tous les scénarios d'alarme.
 */
function sharedAlarmSequence(cause: string): ScenarioEffect[] {
  return [
    { effectId: "AI-01", state: "SIGNAL-ALERTE", rationale: `${cause} — diffusion du ton d'alerte dans les zones non visées par l'évacuation.` },
    { effectId: "AI-02", state: "SIGNAL-EVACUATION", rationale: `${cause} — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents.` },
    { effectId: "AI-03", state: "ACTIF", rationale: `${cause} — message vocal d'évacuation dans les zones concernées.` },
    { effectId: "AI-04", state: "ACTIF", rationale: `${cause} — message vocal d'alerte dans les zones non évacuées.` },
    { effectId: "AI-05", state: "DISPONIBLE-MODE-POMPIER", rationale: "Diffusion en direct disponible en tout temps pour surpasser le message préenregistré." },
    { effectId: "AI-06", state: "ACTIF", rationale: `${cause} — avertisseurs visuels synchronisés dans les zones en évacuation.` },
    { effectId: "AI-07", state: "ACTIF", rationale: "Identification de la zone au tableau annonciateur principal." },
    { effectId: "AI-08", state: "ACTIF", rationale: "Reproduction de l'indication de zone au(x) répétiteur(s)." },
    { effectId: "AI-09", state: "ACTIF", rationale: "Transmission automatique à la télésurveillance." },
    { effectId: "AI-10", state: "ACTIF", rationale: "Transmission au service de sécurité incendie." },
    { effectId: "AI-11", state: "ACTIF", delaySeconds: 0, rationale: "Mise sous silence/réarmement inhibés durant la temporisation minimale." },
    { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage de l'événement au journal du tableau." },

    { effectId: "DF-01", state: "MARCHE", rationale: "Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable." },
    { effectId: "DF-02", state: "MARCHE", rationale: "Pressurisation de la cage d'escalier B (bâtiment à issues multiples)." },
    { effectId: "DF-02B", state: "MARCHE", rationale: "Pressurisation des cages d'escalier additionnelles." },
    { effectId: "DF-03", state: "MARCHE", rationale: `${cause} — extraction de l'air à l'étage sinistré (approche par extraction).` },
    { effectId: "DF-04", state: "MARCHE", rationale: "Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée." },
    { effectId: "DF-05", state: "OUVERT", rationale: "Ouverture du registre d'extraction à l'étage sinistré." },
    { effectId: "DF-06", state: "FERME", rationale: "Fermeture des registres des étages non visés pour concentrer l'extraction." },
    { effectId: "DF-08", state: "DISPONIBLE-MODE-POMPIER", rationale: "Le poste de commande des pompiers demeure disponible pour reprise manuelle." },
    { effectId: "DF-09", state: "OUVERT", rationale: "Ouverture automatique (mécanique, non asservie au tableau) si la pressurisation active fait dépasser le seuil de surpression admissible." },

    { effectId: "EM-01", state: "ARRET", rationale: "Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage." },

    { effectId: "TA-01", state: "ARRET", rationale: "Arrêt des UTA centrales desservant plus d'un étage." },
    { effectId: "TA-02", state: "MARCHE", rationale: "Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation." },
    { effectId: "TA-03", state: "AUCUNE-ACTION", rationale: "Appareil local à un seul compartiment, non visé par l'arrêt général." },

    { effectId: "VO-01", state: "FERME", rationale: "Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale)." },
    { effectId: "VO-02", state: "FERME", rationale: "Fermeture des volets coupe-fumée hors séquence active de désenfumage." },
    { effectId: "VO-03", state: "SELON-CONCEPTION", rationale: "Position dictée par la séquence de désenfumage active à l'étage sinistré." },
    { effectId: "VM-01", state: "FERME", rationale: "Fermeture des registres muraux aux traversées de murs coupe-feu." },
    { effectId: "VM-02", state: "ARRET", rationale: "Arrêt de la ventilation du local de vide-ordures/recyclage." },

    { effectId: "AS-01", state: "RAPPEL-PALIER-DESIGNATION", rationale: "Rappel Phase I de tous les ascenseurs au palier de désignation." },
    { effectId: "AS-02", state: "RAPPEL-PALIER-ALTERNATIF", rationale: "Bascule vers le palier alternatif si le palier de désignation est en cause." },
    { effectId: "AS-03", state: "INACTIF", rationale: "Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif." },
    { effectId: "AS-04", state: "DISPONIBLE-MODE-POMPIER", rationale: "Ascenseur pompier disponible pour prise de contrôle manuelle après rappel." },
    { effectId: "AS-05", state: "MARCHE", rationale: "Pressurisation de la gaine d'ascenseur selon la stratégie retenue." },
    { effectId: "AS-06", state: "ACTIF", rationale: "Confirmation visuelle du rappel au poste de commande." },

    { effectId: "CA-01", state: "DEVERROUILLE", rationale: "Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation." },
    { effectId: "CA-02", state: "DEVERROUILLE", rationale: "Déverrouillage de la porte d'accès prioritaire du service incendie." },
    { effectId: "CA-03", state: "SELON-CONCEPTION", rationale: "Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet." },

    { effectId: "PV-01", state: "FERME", rationale: "Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes." },
    { effectId: "PV-02", state: "DEVERROUILLE", rationale: "Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet." },

    { effectId: "CO-01", state: "ACTIF", rationale: "Statut du système radio pompier vérifié, actif en permanence." },
    { effectId: "CO-02", state: "ACTIF", rationale: "Interphonie d'urgence en cage d'escalier disponible." },

    { effectId: "GN-01", state: "FERME", rationale: "Coupure automatique de l'alimentation en gaz naturel sur confirmation d'alarme incendie." },
    { effectId: "SE-01", state: "ACTIF", rationale: "Priorisation de la caméra de la zone en alarme au poste de sécurité." },
  ];
}

export const SCENARIOS: Scenario[] = [
  // ═══════════════════════ Scénarios d'ALARME (dispositifs initiateurs) ═══════════════════════
  {
    id: "S01",
    category: "alarme",
    label: "Alarme générale — détecteur de fumée en aire commune",
    initiatingDevice: "Détecteur de fumée ponctuel (corridor, hall, cage d'escalier, aire commune)",
    description:
      "Un détecteur de fumée situé dans une aire commune (corridor d'étage, hall, cage d'escalier) passe en alarme et est confirmé par le tableau.",
    engineeringNotes:
      "C'est le scénario de référence de la matrice : tous les systèmes interreliés (désenfumage, ascenseurs, contrôle d'accès, portes à retenue, arrêt de ventilation) réagissent à l'ÉTAT d'alarme du tableau, pas au type de dispositif. Les autres scénarios d'alarme (S02 à S06, S17) réutilisent cette même séquence en n'ajoutant que les particularités propres à leur dispositif initiateur ou à leur zone. La zone d'alarme correspond à l'étage où se trouve le détecteur ; le désenfumage vise cet étage et les étages adjacents (étage +1/-1) selon 3.2.4.19-3.2.4.20.",
    effects: sharedAlarmSequence("Détection de fumée en aire commune"),
    references: [REF.detecteursFumeeAiresCommunes, REF.signalBatimentGrandeHauteur, REF.applicationGrandeHauteur],
  },
  {
    id: "S02",
    category: "alarme",
    label: "Alarme générale — détecteur de fumée en gaine (conduit d'air)",
    initiatingDevice: "Détecteur de fumée de conduit (duct detector), sur alimentation ou retour d'air d'une UTA desservant plusieurs étages",
    description:
      "Un détecteur de fumée installé dans un conduit d'air (alimentation ou retour) d'une unité de traitement d'air desservant plus d'un étage détecte de la fumée.",
    engineeringNotes:
      "Double fonction à distinguer clairement dans la conception : (1) fonction de COMMANDE — arrêt immédiat de l'UTA concernée et fermeture des registres associés au conduit, indépendamment de toute temporisation, pour empêcher la fumée de se propager par le réseau ; (2) fonction de SIGNALISATION — puisque le détecteur est raccordé au réseau avertisseur d'incendie (3.2.4.9), son activation constitue également une alarme générale déclenchant la séquence complète de désenfumage/évacuation. Certaines autorités compétentes acceptent que le détecteur de conduit soit configuré en signal de SUPERVISION plutôt qu'en ALARME lorsque sa seule fonction est l'arrêt de l'appareil desservant un compartiment unique déjà protégé par gicleurs — ce choix de conception doit être validé avec l'autorité compétente (RBQ/service incendie) et documenté au projet.",
    effects: [
      ...sharedAlarmSequence("Détection de fumée en gaine d'air"),
      { effectId: "TA-01", state: "ARRET", delaySeconds: 0, rationale: "Arrêt immédiat et prioritaire de l'UTA associée au conduit en alarme — fonction de commande indépendante de la temporisation générale.", references: [REF.detecteursConduits] },
      { effectId: "DF-06", state: "FERME", delaySeconds: 0, rationale: "Fermeture immédiate du registre du conduit détecté en alarme." },
    ],
    references: [REF.detecteursConduits, REF.arretVentilationGeneral],
    appliesIf: (c) => c.hasDuctSmokeDetectors,
  },
  {
    id: "S03",
    category: "alarme",
    label: "Alarme générale — détecteur thermique",
    initiatingDevice: "Détecteur thermique (chaleur fixe ou taux de montée), local technique, garage, cuisine des aires communes",
    description:
      "Un détecteur thermique installé dans un local où la fumée normale d'exploitation rendrait un détecteur de fumée sujet aux fausses alarmes (garage, local technique, cuisine commune) passe en alarme.",
    engineeringNotes:
      "Comportement de séquence identique à S01 ; seule la zone d'origine change (local technique/garage/cuisine plutôt que corridor). Lorsque le local est le garage souterrain, ce scénario se combine avec S17 (désenfumage du garage).",
    effects: sharedAlarmSequence("Détection thermique en local technique/garage/cuisine commune"),
    references: [REF.detecteursFumeeAiresCommunes],
  },
  {
    id: "S04",
    category: "alarme",
    label: "Alarme générale — déclencheur manuel (poste d'alarme manuelle)",
    initiatingDevice: "Poste d'alarme manuelle (station manuelle), à proximité de chaque issue",
    description: "Un occupant actionne un poste d'alarme manuelle situé sur le parcours d'évacuation.",
    engineeringNotes:
      "Comportement de séquence identique à S01. Le poste manuel demeure le moyen d'activation le plus fiable (aucune dépendance à la détection automatique) et sa zone correspond à l'étage où il est situé.",
    effects: sharedAlarmSequence("Activation d'un poste d'alarme manuelle"),
    references: [REF.postesManuels],
  },
  {
    id: "S05",
    category: "alarme",
    label: "Alarme générale — débit d'eau gicleur (flow switch)",
    initiatingDevice: "Détecteur de débit d'eau (flow switch) sur une canalisation de zone de gicleurs",
    description: "Un débit d'eau soutenu (au-delà du délai anti-à-coup, typ. 45-90 s) est détecté dans une zone de gicleurs, confirmant l'écoulement d'au moins une tête de gicleur ouverte.",
    engineeringNotes:
      "Le débit d'eau gicleur est un signal d'ALARME au même titre qu'une détection automatique — la matrice doit donc reproduire l'intégralité de la séquence de désenfumage/évacuation, pas seulement une notification. C'est une distinction cruciale à ne pas confondre avec les signaux de SUPERVISION (S07-S09), qui eux ne déclenchent aucune action de désenfumage/évacuation.",
    effects: [
      ...sharedAlarmSequence("Débit d'eau confirmé — zone de gicleurs"),
      { effectId: "PI-01", state: "MARCHE", rationale: "Le débit d'eau soutenu provoque généralement la chute de pression déclenchant le démarrage automatique de la pompe incendie.", references: [REF.pompeIncendie] },
      { effectId: "GI-06", state: "ACTIF", rationale: "Sonnerie hydraulique locale actionnée mécaniquement par le débit d'eau — signal audible immédiat près de la vanne de zone, indépendant du tableau.", references: [REF.gongHydrauliqueGicleurs] },
    ],
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "S06",
    category: "alarme",
    label: "Alarme — détecteur de fumée privé de logement raccordé au réseau central",
    initiatingDevice: "Avertisseur de fumée de logement interconnecté au réseau avertisseur du bâtiment",
    description:
      "Un avertisseur de fumée situé à l'intérieur d'un logement, dont le raccordement au système central est exigé ou choisi au projet, passe en alarme.",
    engineeringNotes:
      "Point de vigilance projet-spécifique : le CNB 2015 n'exige pas systématiquement que les avertisseurs de fumée privés des logements d'un immeuble multirésidentiel soient raccordés au système d'alarme central — l'exigence dépend de la classification, de la hauteur du bâtiment et des modifications québécoises applicables (Code de construction du Québec, Chapitre I). Lorsque le raccordement est exigé ou retenu (paramètre `suiteSmokeAlarmsReportToFacp` du projet), le comportement suit la séquence standard, avec pour zone le logement/étage d'origine. Lorsqu'il n'est PAS raccordé, l'avertisseur de logement demeure autonome (alarme locale uniquement, non visible du tableau central) — ce cas n'apparaît alors pas dans la matrice du projet.",
    effects: sharedAlarmSequence("Détection de fumée dans un logement (interconnecté au réseau central)"),
    references: [REF.alarmesLogementsInterconnexion],
    appliesIf: (c) => c.suiteSmokeAlarmsReportToFacp,
  },
  {
    id: "S17",
    category: "alarme",
    label: "Alarme — garage souterrain (détection combinée fumée/CO ou thermique)",
    initiatingDevice: "Détecteur de fumée/thermique ou détecteur combiné CO-fumée du garage souterrain",
    description: "Un dispositif de détection du garage souterrain passe en alarme.",
    engineeringNotes:
      "S'ajoute à la séquence standard le basculement du réseau d'évacuation du garage (normalement en régulation de qualité de l'air/CO) vers le mode désenfumage grande vitesse. Si le garage constitue un compartiment résistant au feu distinct avec une issue indépendante (fréquent en pratique québécoise), la pressurisation des cages d'escalier du bâtiment résidentiel au-dessus peut ne pas être requise pour ce scénario — à confirmer par l'analyse de code et la conception du désenfumage propre au projet ; le paramètre `hasUndergroundParking` active ce scénario mais la portée exacte demeure une décision de conception à documenter.",
    effects: [
      ...sharedAlarmSequence("Détection dans le garage souterrain"),
      { effectId: "DF-07", state: "MARCHE", rationale: "Basculement du réseau d'évacuation du garage en mode désenfumage grande vitesse." },
      { effectId: "EM-02", state: "SELON-CONCEPTION", rationale: "Suspension du mode normal de gestion du CO au profit du mode désenfumage." },
    ],
    references: [REF.controleFumeeGarage],
    appliesIf: (c) => c.hasUndergroundParking,
  },
  {
    id: "S19",
    category: "alarme",
    label: "Détection de fumée au palier d'ascenseur (détecteur dédié au rappel)",
    initiatingDevice: "Détecteur de fumée au palier d'ascenseur, à la machinerie ou en tête de gaine",
    description:
      "Détecteur dédié, distinct des détecteurs d'aire commune, requis à chaque palier d'ascenseur, à la salle de machinerie et en tête de gaine pour commander spécifiquement le rappel des ascenseurs.",
    engineeringNotes:
      "Ce dispositif a une fonction PREMIÈRE de commande du rappel d'ascenseur, avec une logique propre distincte de la séquence générale : si le détecteur en alarme est celui du palier de désignation, le rappel bascule automatiquement vers le palier alternatif (AS-02) plutôt que de rappeler les ascenseurs vers un palier envahi de fumée. Il déclenche également l'alarme générale du bâtiment (comme tout détecteur raccordé au réseau), d'où la séquence complète reproduite ci-dessous ; mais dans la pratique de commissioning (essais CAN/ULC-S1001), ce point est systématiquement testé séparément des autres détecteurs de fumée en raison de sa criticité pour la sécurité des pompiers.",
    effects: [
      ...sharedAlarmSequence("Détection de fumée au palier d'ascenseur"),
      { effectId: "AS-02", state: "RAPPEL-PALIER-ALTERNATIF", rationale: "Priorité absolue : si le palier en alarme est le palier de désignation, bascule immédiate et automatique vers le palier alternatif avant toute ouverture de porte." },
    ],
    references: [REF.rappelAscenseurs, REF.ascenseurRappelPhaseI],
  },
  {
    id: "S22",
    category: "alarme",
    label: "Alarme — activation du système d'extinction de la hotte de cuisine commerciale",
    initiatingDevice: "Système d'extinction fixe de hotte de cuisine commerciale (NFPA 96)",
    description: "Le système d'extinction propre à une hotte de cuisine commerciale (aire commune ou local commercial du bâtiment) s'active sur un feu de friture/de cuisson.",
    engineeringNotes:
      "Double fonction, comme le détecteur de gaine (S02) : (1) fonction de COMMANDE locale et immédiate, indépendante du tableau — coupure du gaz/de l'électricité de la ligne de cuisson sous la hotte (CC-01), qui doit se produire même si le raccordement au réseau avertisseur du bâtiment est en dérangement ; (2) fonction de SIGNALISATION — le système est également raccordé comme dispositif initiateur au réseau avertisseur du bâtiment (CC-02), déclenchant la séquence complète d'évacuation puisqu'un feu de cuisson peut se propager au-delà du local. Seuls les projets avec une cuisine commerciale équipée (`hasCommercialKitchenHood`) sont visés — non applicable aux cuisines privées de logements.",
    effects: [
      ...sharedAlarmSequence("Activation du système d'extinction de la hotte de cuisine commerciale"),
      { effectId: "CC-01", state: "ACTIF", delaySeconds: 0, rationale: "Coupure immédiate et locale du gaz/de l'électricité de la ligne de cuisson, indépendante du tableau.", references: [REF.extinctionHotteCuisine] },
      { effectId: "CC-02", state: "ACTIF", rationale: "Signal transmis au réseau avertisseur du bâtiment comme dispositif initiateur.", references: [REF.extinctionHotteCuisine] },
    ],
    references: [REF.extinctionHotteCuisine],
    appliesIf: (c) => c.hasCommercialKitchenHood,
  },

  // ═══════════════════════ Scénarios de SUPERVISION (gicleurs) — pas d'évacuation ═══════════════════════
  {
    id: "S07",
    category: "supervisory",
    label: "Supervision — vanne de contrôle de gicleurs fermée",
    initiatingDevice: "Interrupteur de supervision de vanne (tamper switch)",
    description: "Une vanne de contrôle du réseau de gicleurs est détectée fermée ou partiellement fermée.",
    engineeringNotes:
      "Signal de SUPERVISION, pas une alarme feu : aucune action de désenfumage, d'évacuation, de rappel d'ascenseur ou de déverrouillage de porte ne doit être déclenchée. C'est une erreur de conception fréquente à éviter — traiter un signal de supervision comme une alarme provoque des évacuations et des rappels d'ascenseur inutiles et use la confiance des occupants envers le système. Seule une signalisation locale et distante (dérangement/supervision) est requise, avec délai de restauration de 90 secondes typiquement toléré (arrêt/réouverture pour entretien) avant transmission au tableau.",
    effects: [
      { effectId: "AI-07", state: "SIGNAL-SUPERVISION", rationale: "Indication d'un signal de supervision (distinct visuellement/sonorement d'une alarme) au tableau principal." },
      { effectId: "AI-08", state: "SIGNAL-SUPERVISION", rationale: "Reproduction au(x) répétiteur(s)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission du signal de supervision à la télésurveillance." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage de l'événement." },
      { effectId: "PI-03", state: "SIGNAL-DERANGEMENT", rationale: "Le contrôleur de pompe signale l'état de la vanne de contrôle amont, pertinent à la disponibilité du réseau." },
    ],
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "S08",
    category: "supervisory",
    label: "Supervision — pression basse dans le réseau de gicleurs",
    initiatingDevice: "Manocontact de supervision de pression",
    description: "La pression du réseau de gicleurs descend sous le seuil de supervision.",
    engineeringNotes:
      "Signal de supervision. Peut légitimement provoquer le démarrage automatique de la pompe d'appoint (jockey) dont la fonction même est de maintenir la pression — cette action est une fonction hydraulique normale, pas une réponse à une alarme feu, et ne doit pas être confondue avec le démarrage de la pompe principale (réservé à une chute de pression nettement plus importante, typique d'un débit d'incendie réel).",
    effects: [
      { effectId: "AI-07", state: "SIGNAL-SUPERVISION", rationale: "Indication au tableau principal." },
      { effectId: "AI-08", state: "SIGNAL-SUPERVISION", rationale: "Reproduction au(x) répétiteur(s)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission à la télésurveillance." },
      { effectId: "PI-02", state: "MARCHE", rationale: "Démarrage automatique de la pompe d'appoint pour rétablir la pression normale du réseau." },
    ],
    references: [REF.detecteursDebitGicleurs, REF.pompeIncendie],
    appliesIf: (c) => c.hasJockeyPump,
  },
  {
    id: "S09",
    category: "supervisory",
    label: "Supervision — niveau bas de réservoir/citerne ou température basse de local protégé",
    initiatingDevice: "Détecteur de niveau (réservoir) ou détecteur de température basse (local chauffé)",
    description: "Signal de supervision sur le niveau d'eau du réservoir dédié ou sur la température d'un local chauffé abritant des composantes du réseau.",
    engineeringNotes: "Signal de supervision affectant la disponibilité future du réseau (risque de gel ou de réserve insuffisante), sans lien avec un événement de feu en cours.",
    effects: [
      { effectId: "AI-07", state: "SIGNAL-SUPERVISION", rationale: "Indication au tableau principal." },
      { effectId: "AI-08", state: "SIGNAL-SUPERVISION", rationale: "Reproduction au(x) répétiteur(s)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission à la télésurveillance." },
    ],
    references: [REF.detecteursDebitGicleurs],
  },
  {
    id: "S21",
    category: "supervisory",
    label: "Supervision — batterie du panneau de contrôle d'incendie faible ou défaillante",
    initiatingDevice: "Circuit de supervision de la source secondaire (batteries) du panneau de contrôle d'incendie",
    description: "Le panneau détecte que sa réserve de batteries est sous le seuil requis pour assurer l'autonomie prescrite (généralement 24 h en veille + 5 min en alarme) ou qu'une batterie est défectueuse.",
    engineeringNotes:
      "Signal de supervision/dérangement, pas une alarme feu — mais critique à surveiller puisqu'il conditionne la fiabilité du système advenant une perte simultanée de l'alimentation normale (voir S10 et S18). Contrairement aux signaux de supervision du réseau de gicleurs (S07-S09), celui-ci concerne le système d'alarme incendie lui-même et doit apparaître clairement distinct d'une alarme au tableau et à la télésurveillance.",
    effects: [
      { effectId: "AI-07", state: "SIGNAL-DERANGEMENT", rationale: "Indication de dérangement de la source secondaire au tableau principal." },
      { effectId: "AI-08", state: "SIGNAL-DERANGEMENT", rationale: "Reproduction au(x) répétiteur(s)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission du dérangement à la télésurveillance." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage de l'événement." },
    ],
    references: [REF.supervisionBatterieTableau],
  },

  // ═══════════════════════ Scénarios d'opération / défaillance ═══════════════════════
  {
    id: "S10",
    category: "operation",
    label: "Perte de l'alimentation électrique normale",
    initiatingDevice: "Relais de détection de perte de tension au tableau de distribution normal",
    description: "Interruption de l'alimentation électrique normale du bâtiment (réseau public).",
    engineeringNotes:
      "Ce scénario est indépendant d'une alarme incendie : aucune évacuation n'est déclenchée par une simple perte de courant. Ce qui est déclenché, c'est la chaîne d'alimentation de secours des charges de sécurité (3.2.7.2) — génératrice, transfert automatique, éclairage de sécurité, et le passage du système d'alarme lui-même sur sa source secondaire (batteries, puis génératrice). Si la perte de puissance affecte aussi les ventilateurs de désenfumage en cours de fonctionnement (parce qu'une alarme était déjà active), ceux-ci doivent redémarrer automatiquement une fois l'alimentation de secours rétablie, sans intervention manuelle.",
    effects: [
      { effectId: "GE-01", state: "MARCHE", rationale: "Démarrage automatique de la génératrice sur perte confirmée de l'alimentation normale." },
      { effectId: "GE-02", state: "ACTIF", delaySeconds: 10, rationale: "Transfert automatique des charges de sécurité incendie dans le délai maximal prescrit." },
      { effectId: "GE-03", state: "ACTIF", rationale: "Signalisation de l'état de la génératrice au tableau/à la télésurveillance." },
      { effectId: "ES-01", state: "MARCHE", rationale: "Allumage automatique de l'éclairage de sécurité/issues." },
      { effectId: "ES-02", state: "ACTIF", rationale: "Confirmation de l'alimentation de secours aux affichages de sortie." },
      { effectId: "AS-07", state: "SELON-CONCEPTION", rationale: "Retour sélectif d'un nombre limité d'ascenseurs en service sur génératrice, priorité à l'ascenseur pompier." },
      { effectId: "PI-01", state: "SELON-CONCEPTION", rationale: "La pompe incendie demeure disponible sur alimentation de secours si une demande de pression survient pendant la panne." },
      { effectId: "AI-07", state: "SIGNAL-DERANGEMENT", rationale: "Le tableau d'alarme signale son propre transfert sur source secondaire (batteries)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission du dérangement d'alimentation à la télésurveillance." },
    ],
    references: [REF.alimentationSecours, REF.chargesAlimentationSecours, REF.delaiTransfertSecours],
  },
  {
    id: "S11",
    category: "derangement",
    label: "Défaut de communication / dérangement du système (perte de boucle, court-circuit)",
    initiatingDevice: "Circuit de boucle de détection, module de sortie ou lien de communication réseau",
    description: "Une boucle de détection, un module de commande déporté ou un lien de communication entre panneaux devient ouvert, court-circuité ou hors ligne.",
    engineeringNotes:
      "Un dérangement ne doit provoquer NI évacuation NI désenfumage automatique — il s'agit d'une perte de capacité de surveillance, pas d'un événement de feu confirmé. Deux exceptions importantes à documenter dans la matrice détaillée du projet : (1) le rappel d'ascenseur doit se produire automatiquement si le circuit précis de rappel est atteint (AS-08, sécurité positive exigée par CSA B44) ; (2) chaque équipement de désenfumage motorisé asservi au module défaillant doit prendre sa position de repli sécuritaire prédéterminée à la conception (ex. registre à ressort de rappel qui se ferme sur perte d'alimentation de commande) plutôt qu'une position indéterminée.",
    effects: [
      { effectId: "AI-07", state: "SIGNAL-DERANGEMENT", rationale: "Indication de dérangement (distincte d'une alarme) au tableau principal, identifiant la boucle/le module affecté." },
      { effectId: "AI-08", state: "SIGNAL-DERANGEMENT", rationale: "Reproduction au(x) répétiteur(s)." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission du dérangement à la télésurveillance." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage de l'événement." },
      { effectId: "AS-08", state: "RAPPEL-PALIER-DESIGNATION", rationale: "Sécurité positive : perte de continuité du circuit de rappel d'un ascenseur = rappel automatique de cet ascenseur." },
      { effectId: "VO-03", state: "POSITION-REPLI-SECURITAIRE", rationale: "Les registres motorisés asservis au module affecté prennent leur position de repli sécuritaire prédéterminée." },
      { effectId: "DF-01", state: "POSITION-REPLI-SECURITAIRE", rationale: "Aucun démarrage automatique ; le ventilateur affecté demeure dans son état de repli défini à la conception jusqu'au rétablissement." },
    ],
    references: [REF.installationS524, REF.ascenseurPerteSignal],
  },
  {
    id: "S23",
    category: "derangement",
    label: "Dérangement du système de communication bidirectionnelle pompiers (DAS)",
    initiatingDevice: "Système d'aide aux communications des services d'urgence (antenne distribuée, amplificateurs)",
    description: "Le système radio dédié aux services d'urgence (DAS/BDA) signale une perte de puissance, une défaillance d'amplificateur ou une perte de batterie de secours.",
    engineeringNotes:
      "N'affecte ni le désenfumage ni l'évacuation — c'est un système de communication d'urgence indépendant de la séquence d'alarme, mais son dérangement doit être signalé distinctement puisqu'il compromet la capacité radio des pompiers à l'intérieur du bâtiment lors d'une intervention. Applicable seulement aux projets dotés d'un tel système (`hasFireDeptRadioSystem`).",
    effects: [
      { effectId: "CO-01", state: "SIGNAL-DERANGEMENT", rationale: "Indication de dérangement du système radio pompier." },
      { effectId: "AI-07", state: "SIGNAL-DERANGEMENT", rationale: "Reproduction au tableau principal." },
      { effectId: "AI-09", state: "ACTIF", rationale: "Transmission du dérangement à la télésurveillance." },
    ],
    references: [REF.derangementDas],
    appliesIf: (c) => c.hasFireDeptRadioSystem,
  },
  {
    id: "S18",
    category: "derangement",
    label: "Défaillance générale du tableau (perte CA et réserve batterie)",
    initiatingDevice: "Alimentation principale et secondaire (batteries) du panneau de contrôle d'incendie",
    description: "Perte simultanée de l'alimentation en courant alternatif et de la réserve de batteries du panneau de contrôle d'incendie (défaillance totale).",
    engineeringNotes:
      "Scénario extrême, dimensionnant pour la conception à sécurité positive de plusieurs sous-systèmes. Chaque équipement asservi doit être conçu pour revenir à une position/un état SÉCURITAIRE en l'absence de commande — c'est un principe fondamental à valider explicitement pour chaque point de la matrice réelle d'un projet (pas seulement ceux énumérés ci-dessous) lors de la revue de conception et des essais intégrés CAN/ULC-S1001. Les ascenseurs, en particulier, doivent revenir en rappel par sécurité positive (voir S11/AS-08) plutôt que de demeurer en service normal advenant l'incapacité du système à confirmer l'absence d'alarme.",
    effects: [
      { effectId: "AI-09", state: "SIGNAL-DERANGEMENT", rationale: "Un signal de dérangement critique doit être transmis à la télésurveillance via une voie indépendante du panneau défaillant (ex. communicateur redondant) avant la perte totale." },
      { effectId: "AS-08", state: "RAPPEL-PALIER-DESIGNATION", rationale: "Sécurité positive : perte totale de signal = rappel de tous les ascenseurs." },
      { effectId: "VO-03", state: "POSITION-REPLI-SECURITAIRE", rationale: "Tous les registres motorisés de désenfumage reviennent à leur position de repli sécuritaire (généralement fermée, ou ouverte si la conception l'exige — à documenter point par point)." },
      { effectId: "DF-01", state: "POSITION-REPLI-SECURITAIRE", rationale: "Les ventilateurs de désenfumage ne peuvent plus recevoir de commande automatique ; état de repli selon la conception (souvent arrêt, sauf si un mode local de secours est prévu)." },
      { effectId: "PV-01", state: "FERME", rationale: "Les dispositifs de retenue à sécurité positive (courant requis pour maintenir l'ouverture) libèrent automatiquement les portes coupe-feu maintenues ouvertes." },
    ],
    references: [REF.installationS524, REF.ascenseurPerteSignal],
  },

  // ═══════════════════════ Scénarios d'opération manuelle (pompiers / technicien) ═══════════════════════
  {
    id: "S12",
    category: "operation",
    label: "Activation manuelle du poste de commande des pompiers (FSCS override)",
    initiatingDevice: "Poste de commande de désenfumage des pompiers (Firefighters' Smoke Control Station)",
    description: "Un pompier prend le contrôle manuel direct des ventilateurs et registres de désenfumage depuis le poste de commande dédié, en dérogation de la séquence automatique.",
    engineeringNotes:
      "Le poste de commande des pompiers a préséance absolue sur la logique automatique — c'est une exigence fondamentale de 3.2.6.8 : les pompiers doivent pouvoir imposer une stratégie de désenfumage différente de celle programmée par défaut (ex. pressuriser un étage différent selon l'évolution réelle de l'incendie constatée sur place). Toute commande manuelle prise à ce poste doit être clairement indiquée au tableau principal et empêcher un retour automatique en séquence normale tant que le poste n'a pas été explicitement remis en mode automatique.",
    effects: [
      { effectId: "DF-08", state: "CONTROLE-MANUEL-POMPIER", rationale: "Prise de contrôle manuelle confirmée au poste de commande, préséance sur la séquence automatique." },
      { effectId: "DF-01", state: "SELON-CONCEPTION", rationale: "État déterminé directement par la commande manuelle du pompier, indépendamment de la séquence automatique." },
      { effectId: "DF-03", state: "SELON-CONCEPTION", rationale: "État déterminé directement par la commande manuelle du pompier." },
      { effectId: "VO-03", state: "SELON-CONCEPTION", rationale: "Position des registres motorisés déterminée par la commande manuelle." },
      { effectId: "AI-07", state: "ACTIF", rationale: "Indication au tableau principal que le désenfumage est sous contrôle manuel pompier." },
      { effectId: "AI-05", state: "DISPONIBLE-MODE-POMPIER", rationale: "Diffusion vocale en direct disponible en complément de la reprise manuelle du désenfumage." },
    ],
    references: [REF.posteCommandePompiers],
  },
  {
    id: "S13",
    category: "operation",
    label: "Activation manuelle — fonctionnement Phase II de l'ascenseur (clé pompier)",
    initiatingDevice: "Commutateur à clé Phase II dans la cabine de l'ascenseur désigné pompiers",
    description: "Un pompier, une fois l'ascenseur rappelé au palier de désignation (Phase I), insère la clé et prend le contrôle manuel exclusif de la cabine (Phase II).",
    engineeringNotes:
      "La Phase II retire l'ascenseur de tout appel normal ou de secours automatique ; seul l'occupant de la cabine (le pompier muni de la clé) commande les déplacements. Cette opération est indépendante des autres ascenseurs du bâtiment, qui demeurent en rappel Phase I (AS-01) tant que l'alarme est active.",
    effects: [
      { effectId: "AS-04", state: "CONTROLE-MANUEL-POMPIER", rationale: "Prise de contrôle manuelle exclusive de la cabine par la clé Phase II." },
      { effectId: "AS-06", state: "ACTIF", rationale: "Indication au poste de commande principal que l'ascenseur pompier est sous contrôle manuel." },
    ],
    references: [REF.ascenseurPhaseII],
    appliesIf: (c) => c.hasFirefightersElevator,
  },
  {
    id: "S20",
    category: "operation",
    label: "Retrait de la clé Phase II / fin du contrôle manuel pompier",
    initiatingDevice: "Commutateur à clé Phase II dans la cabine de l'ascenseur désigné pompiers",
    description: "Le pompier retire la clé du commutateur Phase II, mettant fin au contrôle manuel exclusif de la cabine.",
    engineeringNotes:
      "Par sécurité positive, le retrait de la clé ne doit PAS remettre l'ascenseur en service normal automatiquement : la cabine retourne en position de attente Phase I (rappelée au palier de désignation, portes ouvertes, hors service) jusqu'à ce qu'un réarmement explicite du système soit effectué (voir S16).",
    effects: [
      { effectId: "AS-04", state: "INACTIF", rationale: "Fin du contrôle manuel exclusif ; la cabine retourne en attente Phase I." },
      { effectId: "AS-01", state: "RAPPEL-PALIER-DESIGNATION", rationale: "Retour à l'état de rappel Phase I (attente), portes ouvertes, hors service pour l'usage normal." },
    ],
    references: [REF.ascenseurPhaseII],
    appliesIf: (c) => c.hasFirefightersElevator,
  },

  // ═══════════════════════ Scénarios de test / vérification ═══════════════════════
  {
    id: "S14",
    category: "essai",
    label: "Mode essai/vérification technicien (walk test)",
    initiatingDevice: "Commutateur de mode essai au tableau de contrôle, activé par un technicien autorisé",
    description:
      "Le système est placé en mode essai afin de permettre la vérification individuelle des dispositifs initiateurs sans provoquer les actions de terrain (désenfumage, rappel d'ascenseur, déverrouillage) ni transmettre de fausses alarmes à la télésurveillance ou au service incendie.",
    engineeringNotes:
      "Exigence opérationnelle critique pour limiter les nuisances lors de l'entretien et des essais périodiques (CAN/ULC-S536) : en mode essai, l'activation d'un dispositif initiateur doit produire une indication locale (lumineuse/sonore de confirmation) SANS déclencher les actions de terrain normalement associées à une alarme. La transmission vers la télésurveillance doit être explicitement mise en mode « essai » (et non simplement coupée) afin que la station de surveillance ne traite pas les signaux comme une urgence réelle, conformément aux bonnes pratiques de coordination avec la télésurveillance avant tout essai.",
    effects: [
      { effectId: "AI-07", state: "ACTIF", rationale: "Confirmation locale de l'activation du dispositif testé, affichée distinctement comme un événement d'essai." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage de l'essai au journal, distinct des événements réels." },
      { effectId: "AI-09", state: "INACTIF", rationale: "Transmission normale à la télésurveillance suspendue et remplacée par un signal de mode essai coordonné au préalable avec la station." },
      { effectId: "DF-01", state: "AUCUNE-ACTION", rationale: "Aucun démarrage réel des ventilateurs de désenfumage en mode essai." },
      { effectId: "AS-01", state: "AUCUNE-ACTION", rationale: "Aucun rappel réel des ascenseurs en mode essai." },
      { effectId: "CA-01", state: "AUCUNE-ACTION", rationale: "Aucun déverrouillage réel des portes de contrôle d'accès en mode essai." },
      { effectId: "PV-01", state: "AUCUNE-ACTION", rationale: "Aucun relâchement réel des dispositifs de retenue en mode essai." },
    ],
    references: [REF.inspectionS536, REF.verificationS537],
  },
  {
    id: "S15",
    category: "essai",
    label: "Pré-alarme / signal de vérification d'alarme (temporisation d'investigation)",
    initiatingDevice: "Détecteur de fumée configuré avec fonction de vérification d'alarme (temporisation programmable)",
    description:
      "Un détecteur de fumée dans une zone désignée à risque de fausses alarmes déclenche une temporisation d'investigation avant la confirmation en alarme générale, permettant au personnel sur place de vérifier et, le cas échéant, de réinitialiser sans déclencher l'évacuation complète.",
    engineeringNotes:
      "Fonctionnalité d'usage optionnel — non exigée par le CNB — permise par CAN/ULC-S524 pour certains types de détecteurs et certaines zones, et couramment utilisée en pratique québécoise pour réduire les fausses alarmes dans les aires où l'activité normale (vapeur, poussière) peut affecter les détecteurs. Doit être limitée aux zones et détecteurs explicitement autorisés par l'analyse de risque du projet et jamais appliquée aux postes manuels, aux détecteurs de gicleurs (débit d'eau) ni aux détecteurs situés directement sur un parcours d'évacuation. Si la temporisation expire sans réinitialisation, le système bascule automatiquement en alarme générale confirmée (S01).",
    effects: [
      { effectId: "AI-07", state: "ACTIF", rationale: "Indication de pré-alarme (distincte visuellement d'une alarme confirmée) au tableau principal." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage du début de la temporisation d'investigation." },
      { effectId: "AI-01", state: "AUCUNE-ACTION", rationale: "Aucun signal d'alerte diffusé aux occupants durant la temporisation d'investigation." },
      { effectId: "AI-02", state: "AUCUNE-ACTION", rationale: "Aucun signal d'évacuation diffusé durant la temporisation d'investigation." },
      { effectId: "DF-01", state: "AUCUNE-ACTION", rationale: "Aucune action de désenfumage tant que l'alarme n'est pas confirmée." },
      { effectId: "AS-01", state: "AUCUNE-ACTION", rationale: "Aucun rappel d'ascenseur tant que l'alarme n'est pas confirmée." },
    ],
    references: [REF.installationS524],
  },
  {
    id: "S16",
    category: "operation",
    label: "Réarmement du système après intervention",
    initiatingDevice: "Commande de réarmement (reset) au tableau de contrôle, effectuée par une personne autorisée",
    description:
      "Après confirmation que l'événement est terminé et que les conditions sont sécuritaires, une personne autorisée procède au réarmement du système, ramenant les équipements asservis à leur position normale.",
    engineeringNotes:
      "Le réarmement du panneau ne doit pas automatiquement remettre en service normal les ascenseurs rappelés : conformément à CSA B44, le retour en service normal des ascenseurs après un rappel Phase I nécessite une confirmation distincte (généralement une remise en service manuelle par le personnel autorisé au poste de commande), même une fois le panneau réarmé — mesure de sécurité additionnelle pour éviter qu'un ascenseur ne reprenne le service normal alors que les conditions à un étage demeurent incertaines.",
    effects: [
      { effectId: "AI-01", state: "INACTIF", rationale: "Arrêt du signal sonore d'alerte." },
      { effectId: "AI-02", state: "INACTIF", rationale: "Arrêt du signal sonore d'évacuation." },
      { effectId: "AI-06", state: "INACTIF", rationale: "Arrêt des avertisseurs visuels." },
      { effectId: "DF-01", state: "ARRET", rationale: "Arrêt des ventilateurs de pressurisation, retour à l'état normal." },
      { effectId: "DF-03", state: "ARRET", rationale: "Arrêt des ventilateurs d'extraction, retour à l'état normal." },
      { effectId: "TA-01", state: "MARCHE", rationale: "Redémarrage des UTA centrales, retour à l'état normal." },
      { effectId: "VO-03", state: "FERME", rationale: "Retour des registres combinés à leur position normale de repos." },
      { effectId: "PV-01", state: "OUVERT", rationale: "Réarmement des dispositifs de retenue en position ouverte (portes coupe-feu retenues de nouveau)." },
      { effectId: "AS-01", state: "SELON-CONCEPTION", rationale: "Le panneau lève l'état de rappel, mais le retour en service normal des ascenseurs exige une confirmation manuelle distincte au poste de commande (CSA B44)." },
      { effectId: "CA-01", state: "VERROUILLE", rationale: "Retour au verrouillage normal des portes de contrôle d'accès une fois l'alarme levée." },
      { effectId: "AI-12", state: "ACTIF", rationale: "Horodatage du réarmement au journal du tableau." },
    ],
    references: [REF.installationS524],
  },
];

export function getScenario(id: string): Scenario {
  const scenario = SCENARIOS.find((s) => s.id === id);
  if (!scenario) throw new Error(`Scénario inconnu dans le catalogue: ${id}`);
  return scenario;
}
