# Matrice causes-effets — alarme incendie (bâtiments multirésidentiels de grande hauteur, Québec)

Outil de conception réutilisable qui génère la matrice causes-effets complète du système d'alarme incendie et de tous les systèmes du bâtiment qui doivent y réagir, pour un projet multirésidentiel de grande hauteur (Groupe C, >36 m, assujetti à l'article 3.2.6 du CNB 2015) au Québec.

Ce document a deux objectifs : (1) présenter l'analyse d'ingénierie — l'ensemble des scénarios possibles et la logique d'interaction entre systèmes — qui sous-tend la matrice, avant de présenter la matrice elle-même ; (2) expliquer comment utiliser et adapter l'outil (`src/lib/fire-alarm-matrix/`) à un projet réel.

Le contenu technique (catalogue de systèmes, catalogue de scénarios, justifications, références normatives) vit dans le code source, pas dans ce document, pour qu'il reste unique, versionné et testable : `src/lib/fire-alarm-matrix/systems.ts` et `src/lib/fire-alarm-matrix/scenarios.ts`. Ce guide en est la lecture narrative.

> ⚠️ **Portée et limites.** Cet outil produit une matrice de référence défendable techniquement, à valider et sceller par l'ingénieur au dossier pour chaque projet. Les numéros d'article cités (CNB 2015, Code de construction du Québec Chapitre I) doivent être confirmés selon l'édition consolidée en vigueur et l'analyse de code spécifique du projet — la concordance exacte peut évoluer avec les modifications réglementaires québécoises. Cet outil ne remplace ni l'analyse de code du projet, ni la coordination avec l'autorité compétente (RBQ, service de sécurité incendie), ni les essais intégrés requis avant l'occupation.

---

## 1. Cadre réglementaire et normatif

| Référence | Rôle dans la matrice |
|---|---|
| **CNB 2015**, Partie 3 — 3.2.4 (Détection, alarme et extinction) | Exigences générales du réseau avertisseur d'incendie : dispositifs initiateurs, zonage, signalisation, transmission au service incendie. |
| **CNB 2015**, 3.2.6 (Dispositions pour bâtiments de grande hauteur) | Cœur de la matrice : pressurisation des cages d'escalier, arrêt/exploitation des systèmes de traitement d'air, poste de commande des pompiers, rappel des ascenseurs. S'applique aux bâtiments de plus de 36 m mesurés selon la méthode prescrite. |
| **CNB 2015**, 3.2.7 (Alimentation de secours) | Génératrice, transfert automatique, délai maximal, charges désignées de sécurité. |
| **CNB 2015**, 3.1.8 (Registres et fermetures résistant au feu) | Volets coupe-feu/coupe-fumée, dispositifs de retenue en position ouverte. |
| **CNB 2015**, 3.2.5 (Installations de lutte contre l'incendie) | Réseau de canalisations, pompe incendie, accès du service incendie. |
| **CNB 2015**, 3.4.6 (Issues) | Déverrouillage des portes de contrôle d'accès, réentrée aux cages d'escalier. |
| **Code de construction du Québec, Chapitre I** | Incorpore le CNB 2015 avec les modifications québécoises (RBQ) — notamment en matière d'interconnexion des avertisseurs de logement au réseau central. À confirmer par version consolidée en vigueur. |
| **CAN/ULC-S524** | Installation du réseau avertisseur d'incendie (zonage, câblage, mode essai). |
| **CAN/ULC-S537** | Vérification (mise en service) du réseau avertisseur d'incendie. |
| **CAN/ULC-S536** | Inspection et mise à l'essai périodiques. |
| **CAN/ULC-S1001** | Essais intégrés des systèmes de protection incendie et de sécurité des occupants. **Exige explicitement l'élaboration d'une matrice causes-effets comme document de référence et critère d'acceptation avant les essais intégrés** — c'est la justification directe de cet outil : le livrable généré ici est conçu pour servir tel quel de base au protocole d'essais intégrés du projet. |
| **CSA B44** | Code de sécurité des ascenseurs — rappel Phase I, fonctionnement pompier Phase II, sécurité positive sur perte de signal. |
| **NFPA 92** | Référence de conception des systèmes de contrôle de fumée (non adoptée telle quelle au Québec, mais d'usage courant en pratique pour le dimensionnement). |

Le référentiel complet des citations utilisées est centralisé dans `src/lib/fire-alarm-matrix/references.ts`, pour garantir la cohérence de numérotation d'un scénario à l'autre et faciliter une mise à jour d'édition de code.

## 2. Principe directeur : réaction à l'état, pas au dispositif

Une matrice causes-effets bien conçue distingue deux couches :

1. **La cause** — l'événement détecté (fumée, chaleur, débit d'eau, poste manuel, perte d'alimentation, dérangement, commande manuelle) et surtout sa **classification** (alarme confirmée / supervision / dérangement / opération manuelle / essai).
2. **L'effet** — la réaction des systèmes, qui dépend presque toujours de la **classification**, pas du dispositif précis qui l'a produite.

C'est pourquoi, dans le catalogue (`scenarios.ts`), la séquence complète de désenfumage/évacuation (`sharedAlarmSequence`) est **partagée** par tous les scénarios d'ALARME confirmée — détection de fumée, détection thermique, poste manuel, débit d'eau de gicleur produisent tous la même réaction des systèmes, seule la zone d'origine change. À l'inverse, un signal de **supervision** de gicleur (vanne fermée, pression basse) ne doit provoquer **aucune** action de désenfumage ni d'évacuation : c'est une des erreurs de conception les plus fréquentes que cet outil rend impossible à commettre par accident, puisque les deux catégories sont structurellement séparées dans le modèle de données.

## 3. Inventaire des scénarios (causes)

| # | Scénario | Catégorie | Interaction dominante |
|---|---|---|---|
| S01 | Détecteur de fumée — aire commune | Alarme | Scénario de référence — séquence complète |
| S02 | Détecteur de fumée — gaine d'air (duct detector) | Alarme | Double fonction : commande immédiate (arrêt UTA) **+** signalisation (alarme générale) |
| S03 | Détecteur thermique — local technique/garage/cuisine commune | Alarme | Séquence complète, zone = local à risque |
| S04 | Poste d'alarme manuelle | Alarme | Séquence complète, moyen d'activation le plus fiable |
| S05 | Débit d'eau gicleur (flow switch) | Alarme | Séquence complète **+** démarrage de la pompe incendie (chute de pression concomitante) |
| S06 | Avertisseur de logement interconnecté | Alarme | Applicabilité conditionnelle au projet — dépend de l'analyse de code |
| S07 | Supervision — vanne de contrôle fermée | Supervision | **Aucune** action de désenfumage/évacuation — signalisation seulement |
| S08 | Supervision — pression basse | Supervision | Peut démarrer la pompe d'appoint (fonction hydraulique, pas une réponse à une alarme) |
| S09 | Supervision — niveau bas réservoir / température basse | Supervision | Signalisation seulement |
| S10 | Perte d'alimentation normale | Opération | Indépendant d'une alarme feu — chaîne génératrice/ATS/éclairage de secours |
| S11 | Défaut de communication / dérangement (boucle, module) | Dérangement | Aucune évacuation ; sécurité positive pour le rappel d'ascenseur et position de repli pour le désenfumage |
| S12 | Activation du poste de commande des pompiers (FSCS) | Opération | Préséance manuelle absolue sur la séquence automatique |
| S13 | Fonctionnement Phase II ascenseur (clé pompier) | Opération | Contrôle exclusif de la cabine, indépendant des autres ascenseurs (toujours en Phase I) |
| S14 | Mode essai/vérification (walk test) | Essai | Confirmation locale seulement — aucune action de terrain, transmission en mode essai |
| S15 | Pré-alarme / vérification d'alarme | Essai | Temporisation d'investigation — aucune action tant que non confirmée |
| S16 | Réarmement du système | Opération | Retour à l'état normal — **sauf** ascenseurs, qui exigent une remise en service manuelle distincte (CSA B44) |
| S17 | Alarme — garage souterrain | Alarme | Séquence complète **+** bascule du réseau CO en mode désenfumage |
| S18 | Défaillance générale du tableau (perte CA + batterie) | Dérangement | Scénario dimensionnant pour la conception à sécurité positive de tous les sous-systèmes |
| S19 | Détection de fumée — palier d'ascenseur | Alarme | Fonction dédiée de commande du rappel, prioritaire sur la séquence générale |
| S20 | Retrait de la clé Phase II | Opération | Retour en attente Phase I — jamais en service normal automatiquement |

Chaque scénario porte, dans le code source, une note d'ingénierie détaillée expliquant *pourquoi* il se comporte ainsi et *comment* il interagit avec les autres systèmes ; ces notes sont reproduites intégralement dans le document généré (section « Fiches détaillées par scénario »).

## 4. Systèmes couverts (colonnes de la matrice)

Le catalogue de points de contrôle (`systems.ts`) regroupe **58 points de contrôle** (dans la configuration de référence — le nombre exact varie selon les paramètres du projet) répartis en 14 catégories :

- **Alarme incendie** — tons d'alerte/évacuation, communication vocale, signalisation, transmission
- **Désenfumage dédié** — ventilateurs de pressurisation des cages, extraction/alimentation d'air, registres motorisés, poste de commande des pompiers
- **Évacuation mécanique générale** — ventilateurs non dédiés au désenfumage
- **Traitement d'air (UTA)** — arrêt général vs unités dédiées au désenfumage
- **Volets coupe-feu / coupe-fumée** — traversées de séparations, registres combinés motorisés
- **Ascenseurs** — rappel Phase I, bascule palier alternatif, fonctionnement Phase II, pressurisation de gaine, sécurité positive
- **Contrôle d'accès** — déverrouillage fail-safe sur le parcours d'évacuation et à l'accès pompier
- **Portes à verrouillage** — dispositifs de retenue magnétique, réentrée aux cages d'escalier
- **Génératrice** — démarrage automatique, transfert ATS, signalisation d'état
- **Pompes incendie** — démarrage automatique (pompe principale et jockey), arrêt manuel uniquement
- **Gicleurs** — débit d'eau (alarme) et signaux de supervision (vanne, pression, niveau, température)
- **Ventilation mécanique diverse** — registres muraux, vide-ordures
- **Communication** — radio pompier (DAS), interphonie d'urgence
- **Éclairage de sécurité** — allumage automatique, affichages de sortie

## 5. Utiliser l'outil sur un projet

### 5.1 Architecture

```
src/lib/fire-alarm-matrix/
  types.ts            Modèle de données (scénarios, points de contrôle, config projet)
  references.ts        Référentiel normatif centralisé
  systems.ts            Catalogue des points de contrôle (colonnes)
  scenarios.ts           Catalogue des scénarios (lignes) + analyse d'ingénierie
  config.ts               Schéma de validation (zod) + configuration de référence
  build-matrix.ts           Moteur de règles : filtre le catalogue selon le projet
  export.ts                  Export CSV (Excel/LibreOffice) et Markdown (document complet)
  index.ts                     Point d'entrée public du module

scripts/generate-fire-alarm-matrix.ts   CLI de génération
fire-alarm-matrix/examples/*.json        Configurations de projet type
fire-alarm-matrix/output/                Matrices générées (CSV + MD)
```

### 5.2 Adapter un nouveau projet

1. Copier un fichier de `fire-alarm-matrix/examples/` (ex. `tour-standard.json`) et ajuster les paramètres au projet réel : nombre de cages d'escalier, approche de désenfumage retenue, présence d'un garage souterrain, d'un ascenseur pompier dédié, etc. — voir `ProjectConfig` dans `types.ts` pour la liste complète et sa documentation.
2. Générer la matrice :

   ```bash
   npm run matrix:generate -- fire-alarm-matrix/examples/mon-projet.json
   ```

3. Les fichiers `mon-projet.csv` (table brute, à ouvrir dans Excel) et `mon-projet.md` (document complet avec fiches détaillées) sont produits dans `fire-alarm-matrix/output/`.
4. Réviser la matrice générée avec l'ingénieur au dossier : confirmer les numéros d'article, ajuster les états marqués `SELON-CONCEPTION` selon les choix de conception propres au projet, et documenter toute déviation.

Les colonnes et lignes non pertinentes pour un projet donné (ex. pas de garage souterrain, une seule cage d'escalier, approche par compartimentation sans ventilateurs dédiés) sont **retirées automatiquement** — le catalogue complet demeure inchangé, seule la sélection varie. C'est ce qui rend l'outil réutilisable d'un projet à l'autre sans réécriture.

### 5.3 Faire évoluer le catalogue

Le catalogue (systèmes et scénarios) est le patrimoine technique de la firme et doit être enrichi au fil des projets plutôt que dupliqué : ajouter un point de contrôle manquant dans `systems.ts`, ou un scénario propre à une typologie de bâtiment (ex. tour mixte avec étages commerciaux) dans `scenarios.ts`, profite immédiatement à tous les projets futurs. `validateCatalog()` (appelée automatiquement à chaque génération) garantit qu'aucun scénario ne référence un point de contrôle inexistant.

## 6. Rôle dans la mise en service (CAN/ULC-S1001)

La matrice générée est destinée à servir directement de document de référence pour la planification des **essais intégrés** exigés par CAN/ULC-S1001 avant l'occupation : chaque ligne de la matrice devient un cas d'essai (déclencher la cause, confirmer que chaque effet listé se produit dans l'état et le délai prescrits), et chaque colonne devient un point de vérification transversal (confirmer qu'un système donné réagit correctement à *tous* les scénarios qui le concernent, pas seulement au premier testé). La section « Fiches détaillées par scénario » du document généré est structurée à cette fin.

## 7. Exemples fournis

- `fire-alarm-matrix/examples/tour-standard.json` — tour de 22 étages, 2 cages d'escalier, garage souterrain, approche par extraction à l'étage sinistré (configuration la plus représentative de la pratique courante au Québec).
- `fire-alarm-matrix/examples/tour-compartimentee-sans-garage.json` — variante à une seule cage d'escalier, approche par compartimentation (sans ventilateurs dédiés d'extraction), sans garage souterrain ni contrôle d'accès électromagnétique — démontre le retrait automatique des points non pertinents.

Les matrices correspondantes, déjà générées, sont disponibles dans `fire-alarm-matrix/output/` à titre de référence.
