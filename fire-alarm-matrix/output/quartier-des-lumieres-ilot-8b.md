# Matrice causes-effets — système d'alarme incendie

**Projet :** Quartier des Lumières — Îlot 8B
**Préparé par :** À compléter par l'ingénieur au dossier
**Généré le :** 2026-07-02T17:37:07.696Z

## Configuration du projet

| Paramètre | Valeur |
|---|---|
| Bâtiment de grande hauteur (>36 m, 3.2.6 CNB) | Oui |
| Nombre de cages d'escalier | 4 |
| Approche de désenfumage | extraction-etage-sinistre |
| Garage souterrain | Oui |
| Ascenseur pompier dédié | Oui |
| Portes à contrôle d'accès électromagnétique | Oui |
| Communication vocale | Oui |
| Génératrice de secours | Oui |
| Pompe incendie | Oui |
| Pompe d'appoint (jockey) | Oui |
| Gicleurs partout | Oui |
| Détecteurs de fumée en gaine | Oui |
| Avertisseurs de logement raccordés au réseau central | Oui |
| Réentrée aux cages d'escalier | Oui |
| Système radio pompier (DAS) | Oui |
| Interphonie d'urgence en cage d'escalier | Non |
| Notes | Configuration établie à partir des réponses fournies par le client (4 cages d'escalier, approche par extraction à l'étage sinistré, garage souterrain, ascenseur pompier dédié, contrôle d'accès électromagnétique, génératrice, pompe incendie + jockey, détecteurs de gaine, avertisseurs de logement interconnectés). Adresse et numéro de projet à compléter. |

## Légende des états

`MARCHE`/`ARRET` (ventilateurs, pompes), `OUVERT`/`FERME` (registres, portes), `DEVERROUILLE`/`VERROUILLE` (contrôle d'accès), `ACTIF`/`INACTIF` (signalisation, fonctions), `SIGNAL-ALERTE`/`SIGNAL-EVACUATION`/`SIGNAL-SUPERVISION`/`SIGNAL-DERANGEMENT` (réseau avertisseur), `RAPPEL-PALIER-DESIGNATION`/`RAPPEL-PALIER-ALTERNATIF` (ascenseurs), `DISPONIBLE-MODE-POMPIER`/`CONTROLE-MANUEL-POMPIER` (préséance manuelle), `POSITION-REPLI-SECURITAIRE` (état de repli sur dérangement/perte de commande), `SELON-CONCEPTION` (dépend d'un choix de conception à documenter au projet), `AUCUNE-ACTION` (explicitement aucune action). Cellule vide = point de contrôle non concerné par ce scénario.

## Points de contrôle retenus (colonnes)

| ID | Catégorie | Système | Point commandé | Référence(s) |
|---|---|---|---|---|
| AI-01 | alarme-incendie | Réseau avertisseur d'incendie | Signal sonore d'alerte (ton continu) | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 | alarme-incendie | Réseau avertisseur d'incendie | Signal sonore d'évacuation (ton temporel/voix) | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 | alarme-incendie | Communication vocale | Message vocal préenregistré d'évacuation | CNB2015 3.2.4.21 |
| AI-04 | alarme-incendie | Communication vocale | Message vocal préenregistré d'alerte | CNB2015 3.2.4.21 |
| AI-05 | communication | Communication vocale | Diffusion vocale en direct (microphone pompier/préposé) | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 | alarme-incendie | Avertisseurs visuels | Avertisseurs stroboscopiques | CNB2015 3.2.4.18 |
| AI-07 | alarme-incendie | Tableau annonciateur principal | Indication de la zone en alarme | CNB2015 3.2.4.11 |
| AI-08 | alarme-incendie | Répétiteur(s) d'annonciateur | Indication de la zone en alarme | CNB2015 3.2.4.11 |
| AI-09 | communication | Transmission à la télésurveillance | Signal transmis à la station de surveillance | CNB2015 3.2.4.8 |
| AI-10 | communication | Transmission au service de sécurité incendie | Signal transmis au SSI (directement ou via télésurveillance) | CNB2015 3.2.4.8 |
| AI-11 | alarme-incendie | Réseau avertisseur d'incendie | Verrouillage clavier (mise sous silence/réarmement inhibés) | CAN-ULC-S524 généralités |
| AI-12 | alarme-incendie | Réseau avertisseur d'incendie | Enregistrement horodaté de l'événement | CAN-ULC-S1001 5 |
| DF-01 | desenfumage | Ventilateur de pressurisation — cage d'escalier A | Démarrage | CNB2015 3.2.6.3 |
| DF-02 | desenfumage | Ventilateur de pressurisation — cage d'escalier B | Démarrage | CNB2015 3.2.6.3 |
| DF-02B | desenfumage | Ventilateur de pressurisation — cage d'escalier C/D | Démarrage | CNB2015 3.2.6.3 |
| DF-03 | desenfumage | Ventilateur d'extraction désenfumage — étage sinistré | Démarrage | NFPA-92 conception |
| DF-04 | desenfumage | Ventilateur d'alimentation d'air — étages adjacents | Démarrage | NFPA-92 conception |
| DF-05 | volets | Registres motorisés de désenfumage — conduit d'extraction, étage sinistré | Ouverture | NFPA-92 conception |
| DF-06 | volets | Registres motorisés de désenfumage — conduits des autres étages | Fermeture | NFPA-92 conception |
| DF-07 | desenfumage | Ventilateur de désenfumage — garage souterrain | Démarrage (grande vitesse / mode désenfumage) | CNB2015 3.2.6.4 |
| DF-08 | desenfumage | Poste de commande des pompiers (FSCS) | Disponibilité de la commande manuelle prioritaire | CNB2015 3.2.6.8 |
| EM-01 | evacuation-mecanique | Ventilateurs d'évacuation générale (salles de bain/cuisines communes) | Arrêt | CNB2015 3.2.6.4 |
| EM-02 | evacuation-mecanique | Ventilateur d'évacuation du garage (mode qualité de l'air) | Bascule en mode désenfumage (voir DF-07) / arrêt du mode CO normal | CNB2015 3.2.6.4 |
| TA-01 | traitement-air | Unités de traitement d'air desservant plus d'un étage | Arrêt | CNB2015 3.2.6.4 |
| TA-02 | traitement-air | Unité de traitement d'air dédiée à la pressurisation/désenfumage | Démarrage (fonction inverse de TA-01) | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 | traitement-air | Appareils de toit (RTU) desservant un seul logement | Aucune action | CNB2015 3.2.6.4 |
| VO-01 | volets | Volets coupe-feu — traversées de séparations coupe-feu | Fermeture | CNB2015 3.1.8.3 |
| VO-02 | volets | Volets coupe-fumée — gaines verticales | Fermeture (sauf ceux utilisés pour le désenfumage) | CNB2015 3.1.8.5 |
| VO-03 | volets | Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré | Position désenfumage (ouvert ou fermé selon séquence) | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 | ventilation-mecanique | Registres coupe-feu muraux (traversées de murs coupe-feu) | Fermeture | CNB2015 3.1.8.3 |
| VM-02 | ventilation-mecanique | Ventilation du local de vide-ordures / local de recyclage | Arrêt | CNB2015 3.2.6.4 |
| AS-01 | ascenseurs | Tous les ascenseurs | Rappel Phase I — palier de désignation | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 | ascenseurs | Tous les ascenseurs | Rappel Phase I — bascule vers le palier alternatif | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 | ascenseurs | Tous les ascenseurs | Interdiction d'arrêt/ouverture des portes à l'étage sinistré | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 | ascenseurs | Ascenseur désigné pompiers | Disponibilité du fonctionnement Phase II (manuel, clé pompier) | CSA-B44 2.27.3 |
| AS-05 | desenfumage | Pressurisation de la gaine d'ascenseur | Démarrage | CNB2015 3.2.6.7 |
| AS-06 | ascenseurs | Poste de commande principal / répétiteur | Confirmation visuelle du rappel | CNB2015 3.2.6.9 |
| AS-07 | ascenseurs | Tous les ascenseurs | Fonctionnement sélectif sur alimentation de secours | CNB2015 3.2.7.2; CNB2015 3.2.7.2 |
| AS-08 | ascenseurs | Tous les ascenseurs | Rappel automatique sur perte du signal (sécurité positive) | CSA-B44 2.27.3.2 |
| CA-01 | controle-acces | Portes de contrôle d'accès sur le parcours d'évacuation | Déverrouillage | CNB2015 3.4.6.16 |
| CA-02 | controle-acces | Porte d'accès principale — service incendie | Déverrouillage | CNB2015 3.2.5.5 |
| CA-03 | controle-acces | Portes de contrôle d'accès hors parcours d'évacuation | Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | CNB2015 3.4.6.16 |
| PV-01 | portes-verrouillage | Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) | Relâchement (fermeture des portes) | CNB2015 3.1.8.12 |
| PV-02 | portes-verrouillage | Portes de cage d'escalier — réentrée | Déverrouillage pour réentrée | CNB2015 3.4.6.20 |
| GE-01 | generatrice | Génératrice de secours | Démarrage automatique (sur perte d'alimentation normale) | CNB2015 3.2.7.1; CNB2015 3.2.7.2 |
| GE-02 | generatrice | Commutateur de transfert automatique (ATS) | Transfert aux charges de sécurité incendie | CNB2015 3.2.7.2; CNB2015 3.2.7.2 |
| GE-03 | generatrice | Génératrice de secours | Signal de fonctionnement/dérangement | CNB2015 3.2.7.1 |
| PI-01 | pompes-incendie | Pompe incendie principale | Démarrage automatique (chute de pression détectée) | CNB2015 3.2.5.9 |
| PI-02 | pompes-incendie | Pompe d'appoint (jockey) | Démarrage automatique (maintien de pression) | CNB2015 3.2.5.9 |
| PI-03 | pompes-incendie | Contrôleur de pompe incendie | Signal de marche/dérangement transmis au tableau | CNB2015 3.2.5.9; CNB2015 3.2.4.11 |
| PI-04 | pompes-incendie | Pompe incendie principale | Arrêt — manuel uniquement | CNB2015 3.2.5.9 |
| GI-01 | gicleurs | Détecteur de débit d'eau (flow switch) | Signal d'alarme au tableau | CNB2015 3.2.4.10 |
| GI-02 | gicleurs | Vanne de contrôle de zone de gicleurs | Signal de supervision — vanne fermée | CNB2015 3.2.4.10 |
| GI-03 | gicleurs | Réseau de gicleurs | Signal de supervision — pression basse | CNB2015 3.2.4.10 |
| GI-04 | gicleurs | Réservoir/citerne d'eau incendie | Signal de supervision — niveau bas | CNB2015 3.2.4.10 |
| GI-05 | gicleurs | Local technique chauffé abritant le réseau | Signal de supervision — température basse | CNB2015 3.2.4.10 |
| CO-01 | communication | Système de communication bidirectionnelle pompiers (antenne distribuée) | Disponibilité continue, statut vérifié à l'alarme | RBQ à confirmer |
| ES-01 | eclairage-securite | Éclairage de sécurité / issues | Allumage automatique | CNB2015 3.2.7.1 |
| ES-02 | eclairage-securite | Affichage lumineux de sortie | Alimentation confirmée par la source de secours | CNB2015 3.2.7.1 |

## Matrice complète

| Scénario | AI-01 | AI-02 | AI-03 | AI-04 | AI-05 | AI-06 | AI-07 | AI-08 | AI-09 | AI-10 | AI-11 | AI-12 | DF-01 | DF-02 | DF-02B | DF-03 | DF-04 | DF-05 | DF-06 | DF-07 | DF-08 | EM-01 | EM-02 | TA-01 | TA-02 | TA-03 | VO-01 | VO-02 | VO-03 | VM-01 | VM-02 | AS-01 | AS-02 | AS-03 | AS-04 | AS-05 | AS-06 | AS-07 | AS-08 | CA-01 | CA-02 | CA-03 | PV-01 | PV-02 | GE-01 | GE-02 | GE-03 | PI-01 | PI-02 | PI-03 | PI-04 | GI-01 | GI-02 | GI-03 | GI-04 | GI-05 | CO-01 | ES-01 | ES-02 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **S01** — Alarme générale — détecteur de fumée en aire commune | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S02** — Alarme générale — détecteur de fumée en gaine (conduit d'air) | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S03** — Alarme générale — détecteur thermique | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S04** — Alarme générale — déclencheur manuel (poste d'alarme manuelle) | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S05** — Alarme générale — débit d'eau gicleur (flow switch) | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  | MARCHE |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S06** — Alarme — détecteur de fumée privé de logement raccordé au réseau central | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S17** — Alarme — garage souterrain (détection combinée fumée/CO ou thermique) | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME | MARCHE | DISPONIBLE-MODE-POMPIER | ARRET | SELON-CONCEPTION | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S19** — Détection de fumée au palier d'ascenseur (détecteur dédié au rappel) | SIGNAL-ALERTE | SIGNAL-EVACUATION | ACTIF | ACTIF | DISPONIBLE-MODE-POMPIER | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | ACTIF | MARCHE | MARCHE | MARCHE | MARCHE | MARCHE | OUVERT | FERME |  | DISPONIBLE-MODE-POMPIER | ARRET |  | ARRET | MARCHE | AUCUNE-ACTION | FERME | FERME | SELON-CONCEPTION | FERME | ARRET | RAPPEL-PALIER-DESIGNATION | RAPPEL-PALIER-ALTERNATIF | INACTIF | DISPONIBLE-MODE-POMPIER | MARCHE | ACTIF |  |  | DEVERROUILLE | DEVERROUILLE | SELON-CONCEPTION | FERME | DEVERROUILLE |  |  |  |  |  |  |  |  |  |  |  |  | ACTIF |  |  |
| **S07** — Supervision — vanne de contrôle de gicleurs fermée |  |  |  |  |  |  | SIGNAL-SUPERVISION | SIGNAL-SUPERVISION | ACTIF |  |  | ACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | SIGNAL-DERANGEMENT |  |  |  |  |  |  |  |  |  |
| **S08** — Supervision — pression basse dans le réseau de gicleurs |  |  |  |  |  |  | SIGNAL-SUPERVISION | SIGNAL-SUPERVISION | ACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | MARCHE |  |  |  |  |  |  |  |  |  |  |
| **S09** — Supervision — niveau bas de réservoir/citerne ou température basse de local protégé |  |  |  |  |  |  | SIGNAL-SUPERVISION | SIGNAL-SUPERVISION | ACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S10** — Perte de l'alimentation électrique normale |  |  |  |  |  |  | SIGNAL-DERANGEMENT |  | ACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | SELON-CONCEPTION |  |  |  |  |  |  | MARCHE | ACTIF | ACTIF | SELON-CONCEPTION |  |  |  |  |  |  |  |  |  | MARCHE | ACTIF |
| **S11** — Défaut de communication / dérangement du système (perte de boucle, court-circuit) |  |  |  |  |  |  | SIGNAL-DERANGEMENT | SIGNAL-DERANGEMENT | ACTIF |  |  | ACTIF | POSITION-REPLI-SECURITAIRE |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | POSITION-REPLI-SECURITAIRE |  |  |  |  |  |  |  |  |  | RAPPEL-PALIER-DESIGNATION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S18** — Défaillance générale du tableau (perte CA et réserve batterie) |  |  |  |  |  |  |  |  | SIGNAL-DERANGEMENT |  |  |  | POSITION-REPLI-SECURITAIRE |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | POSITION-REPLI-SECURITAIRE |  |  |  |  |  |  |  |  |  | RAPPEL-PALIER-DESIGNATION |  |  |  | FERME |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S12** — Activation manuelle du poste de commande des pompiers (FSCS override) |  |  |  |  | DISPONIBLE-MODE-POMPIER |  | ACTIF |  |  |  |  |  | SELON-CONCEPTION |  |  | SELON-CONCEPTION |  |  |  |  | CONTROLE-MANUEL-POMPIER |  |  |  |  |  |  |  | SELON-CONCEPTION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S13** — Activation manuelle — fonctionnement Phase II de l'ascenseur (clé pompier) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | CONTROLE-MANUEL-POMPIER |  | ACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S20** — Retrait de la clé Phase II / fin du contrôle manuel pompier |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | RAPPEL-PALIER-DESIGNATION |  |  | INACTIF |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S14** — Mode essai/vérification technicien (walk test) |  |  |  |  |  |  | ACTIF |  | INACTIF |  |  | ACTIF | AUCUNE-ACTION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | AUCUNE-ACTION |  |  |  |  |  |  |  | AUCUNE-ACTION |  |  | AUCUNE-ACTION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S15** — Pré-alarme / signal de vérification d'alarme (temporisation d'investigation) | AUCUNE-ACTION | AUCUNE-ACTION |  |  |  |  | ACTIF |  |  |  |  | ACTIF | AUCUNE-ACTION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | AUCUNE-ACTION |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **S16** — Réarmement du système après intervention | INACTIF | INACTIF |  |  |  | INACTIF |  |  |  |  |  | ACTIF | ARRET |  |  | ARRET |  |  |  |  |  |  |  | MARCHE |  |  |  |  | FERME |  |  | SELON-CONCEPTION |  |  |  |  |  |  |  | VERROUILLE |  |  | OUVERT |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Fiches détaillées par scénario

### S01 — Alarme générale — détecteur de fumée en aire commune

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur de fumée ponctuel (corridor, hall, cage d'escalier, aire commune)  
**Référence(s) :** CNB2015 3.2.4.9; CNB2015 3.2.4.20; CNB2015 3.2.6.1

Un détecteur de fumée situé dans une aire commune (corridor d'étage, hall, cage d'escalier) passe en alarme et est confirmé par le tableau.

**Analyse d'ingénierie / interactions entre systèmes :** C'est le scénario de référence de la matrice : tous les systèmes interreliés (désenfumage, ascenseurs, contrôle d'accès, portes à retenue, arrêt de ventilation) réagissent à l'ÉTAT d'alarme du tableau, pas au type de dispositif. Les autres scénarios d'alarme (S02 à S06, S17) réutilisent cette même séquence en n'ajoutant que les particularités propres à leur dispositif initiateur ou à leur zone. La zone d'alarme correspond à l'étage où se trouve le détecteur ; le désenfumage vise cet étage et les étages adjacents (étage +1/-1) selon 3.2.4.19-3.2.4.20.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection de fumée en aire commune — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection de fumée en aire commune — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection de fumée en aire commune — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection de fumée en aire commune — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection de fumée en aire commune — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection de fumée en aire commune — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S02 — Alarme générale — détecteur de fumée en gaine (conduit d'air)

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur de fumée de conduit (duct detector), sur alimentation ou retour d'air d'une UTA desservant plusieurs étages  
**Référence(s) :** CNB2015 3.2.4.9; CNB2015 3.2.6.4

Un détecteur de fumée installé dans un conduit d'air (alimentation ou retour) d'une unité de traitement d'air desservant plus d'un étage détecte de la fumée.

**Analyse d'ingénierie / interactions entre systèmes :** Double fonction à distinguer clairement dans la conception : (1) fonction de COMMANDE — arrêt immédiat de l'UTA concernée et fermeture des registres associés au conduit, indépendamment de toute temporisation, pour empêcher la fumée de se propager par le réseau ; (2) fonction de SIGNALISATION — puisque le détecteur est raccordé au réseau avertisseur d'incendie (3.2.4.9), son activation constitue également une alarme générale déclenchant la séquence complète de désenfumage/évacuation. Certaines autorités compétentes acceptent que le détecteur de conduit soit configuré en signal de SUPERVISION plutôt qu'en ALARME lorsque sa seule fonction est l'arrêt de l'appareil desservant un compartiment unique déjà protégé par gicleurs — ce choix de conception doit être validé avec l'autorité compétente (RBQ/service incendie) et documenté au projet.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection de fumée en gaine d'air — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection de fumée en gaine d'air — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection de fumée en gaine d'air — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection de fumée en gaine d'air — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection de fumée en gaine d'air — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection de fumée en gaine d'air — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | 0 s | Fermeture immédiate du registre du conduit détecté en alarme. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | 0 s | Arrêt immédiat et prioritaire de l'UTA associée au conduit en alarme — fonction de commande indépendante de la temporisation générale. | CNB2015 3.2.4.9 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S03 — Alarme générale — détecteur thermique

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur thermique (chaleur fixe ou taux de montée), local technique, garage, cuisine des aires communes  
**Référence(s) :** CNB2015 3.2.4.9

Un détecteur thermique installé dans un local où la fumée normale d'exploitation rendrait un détecteur de fumée sujet aux fausses alarmes (garage, local technique, cuisine commune) passe en alarme.

**Analyse d'ingénierie / interactions entre systèmes :** Comportement de séquence identique à S01 ; seule la zone d'origine change (local technique/garage/cuisine plutôt que corridor). Lorsque le local est le garage souterrain, ce scénario se combine avec S17 (désenfumage du garage).

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection thermique en local technique/garage/cuisine commune — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection thermique en local technique/garage/cuisine commune — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection thermique en local technique/garage/cuisine commune — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection thermique en local technique/garage/cuisine commune — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection thermique en local technique/garage/cuisine commune — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection thermique en local technique/garage/cuisine commune — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S04 — Alarme générale — déclencheur manuel (poste d'alarme manuelle)

**Catégorie :** Alarme  
**Dispositif initiateur :** Poste d'alarme manuelle (station manuelle), à proximité de chaque issue  
**Référence(s) :** CNB2015 3.2.4.6

Un occupant actionne un poste d'alarme manuelle situé sur le parcours d'évacuation.

**Analyse d'ingénierie / interactions entre systèmes :** Comportement de séquence identique à S01. Le poste manuel demeure le moyen d'activation le plus fiable (aucune dépendance à la détection automatique) et sa zone correspond à l'étage où il est situé.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Activation d'un poste d'alarme manuelle — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Activation d'un poste d'alarme manuelle — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Activation d'un poste d'alarme manuelle — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Activation d'un poste d'alarme manuelle — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Activation d'un poste d'alarme manuelle — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Activation d'un poste d'alarme manuelle — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S05 — Alarme générale — débit d'eau gicleur (flow switch)

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur de débit d'eau (flow switch) sur une canalisation de zone de gicleurs  
**Référence(s) :** CNB2015 3.2.4.10

Un débit d'eau soutenu (au-delà du délai anti-à-coup, typ. 45-90 s) est détecté dans une zone de gicleurs, confirmant l'écoulement d'au moins une tête de gicleur ouverte.

**Analyse d'ingénierie / interactions entre systèmes :** Le débit d'eau gicleur est un signal d'ALARME au même titre qu'une détection automatique — la matrice doit donc reproduire l'intégralité de la séquence de désenfumage/évacuation, pas seulement une notification. C'est une distinction cruciale à ne pas confondre avec les signaux de SUPERVISION (S07-S09), qui eux ne déclenchent aucune action de désenfumage/évacuation.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Débit d'eau confirmé — zone de gicleurs — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Débit d'eau confirmé — zone de gicleurs — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Débit d'eau confirmé — zone de gicleurs — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Débit d'eau confirmé — zone de gicleurs — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Débit d'eau confirmé — zone de gicleurs — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Débit d'eau confirmé — zone de gicleurs — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| PI-01 — Pompe incendie principale — Démarrage automatique (chute de pression détectée) | MARCHE | — | Le débit d'eau soutenu provoque généralement la chute de pression déclenchant le démarrage automatique de la pompe incendie. | CNB2015 3.2.5.9 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S06 — Alarme — détecteur de fumée privé de logement raccordé au réseau central

**Catégorie :** Alarme  
**Dispositif initiateur :** Avertisseur de fumée de logement interconnecté au réseau avertisseur du bâtiment  
**Référence(s) :** CCQ-Ch1 3.2.4.9.

Un avertisseur de fumée situé à l'intérieur d'un logement, dont le raccordement au système central est exigé ou choisi au projet, passe en alarme.

**Analyse d'ingénierie / interactions entre systèmes :** Point de vigilance projet-spécifique : le CNB 2015 n'exige pas systématiquement que les avertisseurs de fumée privés des logements d'un immeuble multirésidentiel soient raccordés au système d'alarme central — l'exigence dépend de la classification, de la hauteur du bâtiment et des modifications québécoises applicables (Code de construction du Québec, Chapitre I). Lorsque le raccordement est exigé ou retenu (paramètre `suiteSmokeAlarmsReportToFacp` du projet), le comportement suit la séquence standard, avec pour zone le logement/étage d'origine. Lorsqu'il n'est PAS raccordé, l'avertisseur de logement demeure autonome (alarme locale uniquement, non visible du tableau central) — ce cas n'apparaît alors pas dans la matrice du projet.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection de fumée dans un logement (interconnecté au réseau central) — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection de fumée dans un logement (interconnecté au réseau central) — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection de fumée dans un logement (interconnecté au réseau central) — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection de fumée dans un logement (interconnecté au réseau central) — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection de fumée dans un logement (interconnecté au réseau central) — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection de fumée dans un logement (interconnecté au réseau central) — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S17 — Alarme — garage souterrain (détection combinée fumée/CO ou thermique)

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur de fumée/thermique ou détecteur combiné CO-fumée du garage souterrain  
**Référence(s) :** CNB2015 3.2.6.4

Un dispositif de détection du garage souterrain passe en alarme.

**Analyse d'ingénierie / interactions entre systèmes :** S'ajoute à la séquence standard le basculement du réseau d'évacuation du garage (normalement en régulation de qualité de l'air/CO) vers le mode désenfumage grande vitesse. Si le garage constitue un compartiment résistant au feu distinct avec une issue indépendante (fréquent en pratique québécoise), la pressurisation des cages d'escalier du bâtiment résidentiel au-dessus peut ne pas être requise pour ce scénario — à confirmer par l'analyse de code et la conception du désenfumage propre au projet ; le paramètre `hasUndergroundParking` active ce scénario mais la portée exacte demeure une décision de conception à documenter.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection dans le garage souterrain — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection dans le garage souterrain — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection dans le garage souterrain — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection dans le garage souterrain — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection dans le garage souterrain — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection dans le garage souterrain — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-07 — Ventilateur de désenfumage — garage souterrain — Démarrage (grande vitesse / mode désenfumage) | MARCHE | — | Basculement du réseau d'évacuation du garage en mode désenfumage grande vitesse. | CNB2015 3.2.6.4 |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| EM-02 — Ventilateur d'évacuation du garage (mode qualité de l'air) — Bascule en mode désenfumage (voir DF-07) / arrêt du mode CO normal | SELON-CONCEPTION | — | Suspension du mode normal de gestion du CO au profit du mode désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Bascule vers le palier alternatif si le palier de désignation est en cause. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S19 — Détection de fumée au palier d'ascenseur (détecteur dédié au rappel)

**Catégorie :** Alarme  
**Dispositif initiateur :** Détecteur de fumée au palier d'ascenseur, à la machinerie ou en tête de gaine  
**Référence(s) :** CNB2015 3.2.6.9; CSA-B44 2.27

Détecteur dédié, distinct des détecteurs d'aire commune, requis à chaque palier d'ascenseur, à la salle de machinerie et en tête de gaine pour commander spécifiquement le rappel des ascenseurs.

**Analyse d'ingénierie / interactions entre systèmes :** Ce dispositif a une fonction PREMIÈRE de commande du rappel d'ascenseur, avec une logique propre distincte de la séquence générale : si le détecteur en alarme est celui du palier de désignation, le rappel bascule automatiquement vers le palier alternatif (AS-02) plutôt que de rappeler les ascenseurs vers un palier envahi de fumée. Il déclenche également l'alarme générale du bâtiment (comme tout détecteur raccordé au réseau), d'où la séquence complète reproduite ci-dessous ; mais dans la pratique de commissioning (essais CAN/ULC-S1001), ce point est systématiquement testé séparément des autres détecteurs de fumée en raison de sa criticité pour la sécurité des pompiers.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | SIGNAL-ALERTE | — | Détection de fumée au palier d'ascenseur — diffusion du ton d'alerte dans les zones non visées par l'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | SIGNAL-EVACUATION | — | Détection de fumée au palier d'ascenseur — diffusion du ton d'évacuation à l'étage sinistré et aux étages adjacents. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-03 — Communication vocale — Message vocal préenregistré d'évacuation | ACTIF | — | Détection de fumée au palier d'ascenseur — message vocal d'évacuation dans les zones concernées. | CNB2015 3.2.4.21 |
| AI-04 — Communication vocale — Message vocal préenregistré d'alerte | ACTIF | — | Détection de fumée au palier d'ascenseur — message vocal d'alerte dans les zones non évacuées. | CNB2015 3.2.4.21 |
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion en direct disponible en tout temps pour surpasser le message préenregistré. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | ACTIF | — | Détection de fumée au palier d'ascenseur — avertisseurs visuels synchronisés dans les zones en évacuation. | CNB2015 3.2.4.18 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Identification de la zone au tableau annonciateur principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | ACTIF | — | Reproduction de l'indication de zone au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission automatique à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-10 — Transmission au service de sécurité incendie — Signal transmis au SSI (directement ou via télésurveillance) | ACTIF | — | Transmission au service de sécurité incendie. | CNB2015 3.2.4.8 |
| AI-11 — Réseau avertisseur d'incendie — Verrouillage clavier (mise sous silence/réarmement inhibés) | ACTIF | 0 s | Mise sous silence/réarmement inhibés durant la temporisation minimale. | CAN-ULC-S524 généralités |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier A pour maintenir une voie d'évacuation praticable. | CNB2015 3.2.6.3 |
| DF-02 — Ventilateur de pressurisation — cage d'escalier B — Démarrage | MARCHE | — | Pressurisation de la cage d'escalier B (bâtiment à issues multiples). | CNB2015 3.2.6.3 |
| DF-02B — Ventilateur de pressurisation — cage d'escalier C/D — Démarrage | MARCHE | — | Pressurisation des cages d'escalier additionnelles. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | MARCHE | — | Détection de fumée au palier d'ascenseur — extraction de l'air à l'étage sinistré (approche par extraction). | NFPA-92 conception |
| DF-04 — Ventilateur d'alimentation d'air — étages adjacents — Démarrage | MARCHE | — | Mise en surpression des étages adjacents pour limiter la propagation verticale de fumée. | NFPA-92 conception |
| DF-05 — Registres motorisés de désenfumage — conduit d'extraction, étage sinistré — Ouverture | OUVERT | — | Ouverture du registre d'extraction à l'étage sinistré. | NFPA-92 conception |
| DF-06 — Registres motorisés de désenfumage — conduits des autres étages — Fermeture | FERME | — | Fermeture des registres des étages non visés pour concentrer l'extraction. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | DISPONIBLE-MODE-POMPIER | — | Le poste de commande des pompiers demeure disponible pour reprise manuelle. | CNB2015 3.2.6.8 |
| EM-01 — Ventilateurs d'évacuation générale (salles de bain/cuisines communes) — Arrêt | ARRET | — | Arrêt des ventilateurs d'évacuation générale non dédiés au désenfumage. | CNB2015 3.2.6.4 |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | ARRET | — | Arrêt des UTA centrales desservant plus d'un étage. | CNB2015 3.2.6.4 |
| TA-02 — Unité de traitement d'air dédiée à la pressurisation/désenfumage — Démarrage (fonction inverse de TA-01) | MARCHE | — | Maintien en fonction des UTA dédiées au désenfumage/à la pressurisation. | CNB2015 3.2.6.4; NFPA-92 conception |
| TA-03 — Appareils de toit (RTU) desservant un seul logement — Aucune action | AUCUNE-ACTION | — | Appareil local à un seul compartiment, non visé par l'arrêt général. | CNB2015 3.2.6.4 |
| VO-01 — Volets coupe-feu — traversées de séparations coupe-feu — Fermeture | FERME | — | Fermeture des volets coupe-feu (logique indépendante, sur détection thermique locale). | CNB2015 3.1.8.3 |
| VO-02 — Volets coupe-fumée — gaines verticales — Fermeture (sauf ceux utilisés pour le désenfumage) | FERME | — | Fermeture des volets coupe-fumée hors séquence active de désenfumage. | CNB2015 3.1.8.5 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position dictée par la séquence de désenfumage active à l'étage sinistré. | CNB2015 3.1.8.5; NFPA-92 conception |
| VM-01 — Registres coupe-feu muraux (traversées de murs coupe-feu) — Fermeture | FERME | — | Fermeture des registres muraux aux traversées de murs coupe-feu. | CNB2015 3.1.8.3 |
| VM-02 — Ventilation du local de vide-ordures / local de recyclage — Arrêt | ARRET | — | Arrêt de la ventilation du local de vide-ordures/recyclage. | CNB2015 3.2.6.4 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Rappel Phase I de tous les ascenseurs au palier de désignation. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-02 — Tous les ascenseurs — Rappel Phase I — bascule vers le palier alternatif | RAPPEL-PALIER-ALTERNATIF | — | Priorité absolue : si le palier en alarme est le palier de désignation, bascule immédiate et automatique vers le palier alternatif avant toute ouverture de porte. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-03 — Tous les ascenseurs — Interdiction d'arrêt/ouverture des portes à l'étage sinistré | INACTIF | — | Aucun arrêt/ouverture de porte à l'étage sinistré tant que le rappel est actif. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | DISPONIBLE-MODE-POMPIER | — | Ascenseur pompier disponible pour prise de contrôle manuelle après rappel. | CSA-B44 2.27.3 |
| AS-05 — Pressurisation de la gaine d'ascenseur — Démarrage | MARCHE | — | Pressurisation de la gaine d'ascenseur selon la stratégie retenue. | CNB2015 3.2.6.7 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Confirmation visuelle du rappel au poste de commande. | CNB2015 3.2.6.9 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | DEVERROUILLE | — | Déverrouillage fail-safe des portes de contrôle d'accès sur le parcours d'évacuation. | CNB2015 3.4.6.16 |
| CA-02 — Porte d'accès principale — service incendie — Déverrouillage | DEVERROUILLE | — | Déverrouillage de la porte d'accès prioritaire du service incendie. | CNB2015 3.2.5.5 |
| CA-03 — Portes de contrôle d'accès hors parcours d'évacuation — Statu quo (verrouillage maintenu, selon stratégie de sécurité du projet) | SELON-CONCEPTION | — | Statu quo pour les portes hors parcours d'évacuation, selon la stratégie de sécurité du projet. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Relâchement des dispositifs de retenue — fermeture des portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |
| PV-02 — Portes de cage d'escalier — réentrée — Déverrouillage pour réentrée | DEVERROUILLE | — | Déverrouillage pour réentrée aux étages, si cette stratégie est requise au projet. | CNB2015 3.4.6.20 |
| CO-01 — Système de communication bidirectionnelle pompiers (antenne distribuée) — Disponibilité continue, statut vérifié à l'alarme | ACTIF | — | Statut du système radio pompier vérifié, actif en permanence. | RBQ à confirmer |

### S07 — Supervision — vanne de contrôle de gicleurs fermée

**Catégorie :** Supervision (gicleurs)  
**Dispositif initiateur :** Interrupteur de supervision de vanne (tamper switch)  
**Référence(s) :** CNB2015 3.2.4.10

Une vanne de contrôle du réseau de gicleurs est détectée fermée ou partiellement fermée.

**Analyse d'ingénierie / interactions entre systèmes :** Signal de SUPERVISION, pas une alarme feu : aucune action de désenfumage, d'évacuation, de rappel d'ascenseur ou de déverrouillage de porte ne doit être déclenchée. C'est une erreur de conception fréquente à éviter — traiter un signal de supervision comme une alarme provoque des évacuations et des rappels d'ascenseur inutiles et use la confiance des occupants envers le système. Seule une signalisation locale et distante (dérangement/supervision) est requise, avec délai de restauration de 90 secondes typiquement toléré (arrêt/réouverture pour entretien) avant transmission au tableau.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Indication d'un signal de supervision (distinct visuellement/sonorement d'une alarme) au tableau principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Reproduction au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission du signal de supervision à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement. | CAN-ULC-S1001 5 |
| PI-03 — Contrôleur de pompe incendie — Signal de marche/dérangement transmis au tableau | SIGNAL-DERANGEMENT | — | Le contrôleur de pompe signale l'état de la vanne de contrôle amont, pertinent à la disponibilité du réseau. | CNB2015 3.2.5.9; CNB2015 3.2.4.11 |

### S08 — Supervision — pression basse dans le réseau de gicleurs

**Catégorie :** Supervision (gicleurs)  
**Dispositif initiateur :** Manocontact de supervision de pression  
**Référence(s) :** CNB2015 3.2.4.10; CNB2015 3.2.5.9

La pression du réseau de gicleurs descend sous le seuil de supervision.

**Analyse d'ingénierie / interactions entre systèmes :** Signal de supervision. Peut légitimement provoquer le démarrage automatique de la pompe d'appoint (jockey) dont la fonction même est de maintenir la pression — cette action est une fonction hydraulique normale, pas une réponse à une alarme feu, et ne doit pas être confondue avec le démarrage de la pompe principale (réservé à une chute de pression nettement plus importante, typique d'un débit d'incendie réel).

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Indication au tableau principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Reproduction au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission à la télésurveillance. | CNB2015 3.2.4.8 |
| PI-02 — Pompe d'appoint (jockey) — Démarrage automatique (maintien de pression) | MARCHE | — | Démarrage automatique de la pompe d'appoint pour rétablir la pression normale du réseau. | CNB2015 3.2.5.9 |

### S09 — Supervision — niveau bas de réservoir/citerne ou température basse de local protégé

**Catégorie :** Supervision (gicleurs)  
**Dispositif initiateur :** Détecteur de niveau (réservoir) ou détecteur de température basse (local chauffé)  
**Référence(s) :** CNB2015 3.2.4.10

Signal de supervision sur le niveau d'eau du réservoir dédié ou sur la température d'un local chauffé abritant des composantes du réseau.

**Analyse d'ingénierie / interactions entre systèmes :** Signal de supervision affectant la disponibilité future du réseau (risque de gel ou de réserve insuffisante), sans lien avec un événement de feu en cours.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Indication au tableau principal. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | SIGNAL-SUPERVISION | — | Reproduction au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission à la télésurveillance. | CNB2015 3.2.4.8 |

### S10 — Perte de l'alimentation électrique normale

**Catégorie :** Opération manuelle  
**Dispositif initiateur :** Relais de détection de perte de tension au tableau de distribution normal  
**Référence(s) :** CNB2015 3.2.7.1; CNB2015 3.2.7.2; CNB2015 3.2.7.2

Interruption de l'alimentation électrique normale du bâtiment (réseau public).

**Analyse d'ingénierie / interactions entre systèmes :** Ce scénario est indépendant d'une alarme incendie : aucune évacuation n'est déclenchée par une simple perte de courant. Ce qui est déclenché, c'est la chaîne d'alimentation de secours des charges de sécurité (3.2.7.2) — génératrice, transfert automatique, éclairage de sécurité, et le passage du système d'alarme lui-même sur sa source secondaire (batteries, puis génératrice). Si la perte de puissance affecte aussi les ventilateurs de désenfumage en cours de fonctionnement (parce qu'une alarme était déjà active), ceux-ci doivent redémarrer automatiquement une fois l'alimentation de secours rétablie, sans intervention manuelle.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | SIGNAL-DERANGEMENT | — | Le tableau d'alarme signale son propre transfert sur source secondaire (batteries). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission du dérangement d'alimentation à la télésurveillance. | CNB2015 3.2.4.8 |
| AS-07 — Tous les ascenseurs — Fonctionnement sélectif sur alimentation de secours | SELON-CONCEPTION | — | Retour sélectif d'un nombre limité d'ascenseurs en service sur génératrice, priorité à l'ascenseur pompier. | CNB2015 3.2.7.2; CNB2015 3.2.7.2 |
| GE-01 — Génératrice de secours — Démarrage automatique (sur perte d'alimentation normale) | MARCHE | — | Démarrage automatique de la génératrice sur perte confirmée de l'alimentation normale. | CNB2015 3.2.7.1; CNB2015 3.2.7.2 |
| GE-02 — Commutateur de transfert automatique (ATS) — Transfert aux charges de sécurité incendie | ACTIF | 10 s | Transfert automatique des charges de sécurité incendie dans le délai maximal prescrit. | CNB2015 3.2.7.2; CNB2015 3.2.7.2 |
| GE-03 — Génératrice de secours — Signal de fonctionnement/dérangement | ACTIF | — | Signalisation de l'état de la génératrice au tableau/à la télésurveillance. | CNB2015 3.2.7.1 |
| PI-01 — Pompe incendie principale — Démarrage automatique (chute de pression détectée) | SELON-CONCEPTION | — | La pompe incendie demeure disponible sur alimentation de secours si une demande de pression survient pendant la panne. | CNB2015 3.2.5.9 |
| ES-01 — Éclairage de sécurité / issues — Allumage automatique | MARCHE | — | Allumage automatique de l'éclairage de sécurité/issues. | CNB2015 3.2.7.1 |
| ES-02 — Affichage lumineux de sortie — Alimentation confirmée par la source de secours | ACTIF | — | Confirmation de l'alimentation de secours aux affichages de sortie. | CNB2015 3.2.7.1 |

### S11 — Défaut de communication / dérangement du système (perte de boucle, court-circuit)

**Catégorie :** Dérangement  
**Dispositif initiateur :** Circuit de boucle de détection, module de sortie ou lien de communication réseau  
**Référence(s) :** CAN-ULC-S524 généralités; CSA-B44 2.27.3.2

Une boucle de détection, un module de commande déporté ou un lien de communication entre panneaux devient ouvert, court-circuité ou hors ligne.

**Analyse d'ingénierie / interactions entre systèmes :** Un dérangement ne doit provoquer NI évacuation NI désenfumage automatique — il s'agit d'une perte de capacité de surveillance, pas d'un événement de feu confirmé. Deux exceptions importantes à documenter dans la matrice détaillée du projet : (1) le rappel d'ascenseur doit se produire automatiquement si le circuit précis de rappel est atteint (AS-08, sécurité positive exigée par CSA B44) ; (2) chaque équipement de désenfumage motorisé asservi au module défaillant doit prendre sa position de repli sécuritaire prédéterminée à la conception (ex. registre à ressort de rappel qui se ferme sur perte d'alimentation de commande) plutôt qu'une position indéterminée.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | SIGNAL-DERANGEMENT | — | Indication de dérangement (distincte d'une alarme) au tableau principal, identifiant la boucle/le module affecté. | CNB2015 3.2.4.11 |
| AI-08 — Répétiteur(s) d'annonciateur — Indication de la zone en alarme | SIGNAL-DERANGEMENT | — | Reproduction au(x) répétiteur(s). | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | ACTIF | — | Transmission du dérangement à la télésurveillance. | CNB2015 3.2.4.8 |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'événement. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | POSITION-REPLI-SECURITAIRE | — | Aucun démarrage automatique ; le ventilateur affecté demeure dans son état de repli défini à la conception jusqu'au rétablissement. | CNB2015 3.2.6.3 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | POSITION-REPLI-SECURITAIRE | — | Les registres motorisés asservis au module affecté prennent leur position de repli sécuritaire prédéterminée. | CNB2015 3.1.8.5; NFPA-92 conception |
| AS-08 — Tous les ascenseurs — Rappel automatique sur perte du signal (sécurité positive) | RAPPEL-PALIER-DESIGNATION | — | Sécurité positive : perte de continuité du circuit de rappel d'un ascenseur = rappel automatique de cet ascenseur. | CSA-B44 2.27.3.2 |

### S18 — Défaillance générale du tableau (perte CA et réserve batterie)

**Catégorie :** Dérangement  
**Dispositif initiateur :** Alimentation principale et secondaire (batteries) du panneau de contrôle d'incendie  
**Référence(s) :** CAN-ULC-S524 généralités; CSA-B44 2.27.3.2

Perte simultanée de l'alimentation en courant alternatif et de la réserve de batteries du panneau de contrôle d'incendie (défaillance totale).

**Analyse d'ingénierie / interactions entre systèmes :** Scénario extrême, dimensionnant pour la conception à sécurité positive de plusieurs sous-systèmes. Chaque équipement asservi doit être conçu pour revenir à une position/un état SÉCURITAIRE en l'absence de commande — c'est un principe fondamental à valider explicitement pour chaque point de la matrice réelle d'un projet (pas seulement ceux énumérés ci-dessous) lors de la revue de conception et des essais intégrés CAN/ULC-S1001. Les ascenseurs, en particulier, doivent revenir en rappel par sécurité positive (voir S11/AS-08) plutôt que de demeurer en service normal advenant l'incapacité du système à confirmer l'absence d'alarme.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | SIGNAL-DERANGEMENT | — | Un signal de dérangement critique doit être transmis à la télésurveillance via une voie indépendante du panneau défaillant (ex. communicateur redondant) avant la perte totale. | CNB2015 3.2.4.8 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | POSITION-REPLI-SECURITAIRE | — | Les ventilateurs de désenfumage ne peuvent plus recevoir de commande automatique ; état de repli selon la conception (souvent arrêt, sauf si un mode local de secours est prévu). | CNB2015 3.2.6.3 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | POSITION-REPLI-SECURITAIRE | — | Tous les registres motorisés de désenfumage reviennent à leur position de repli sécuritaire (généralement fermée, ou ouverte si la conception l'exige — à documenter point par point). | CNB2015 3.1.8.5; NFPA-92 conception |
| AS-08 — Tous les ascenseurs — Rappel automatique sur perte du signal (sécurité positive) | RAPPEL-PALIER-DESIGNATION | — | Sécurité positive : perte totale de signal = rappel de tous les ascenseurs. | CSA-B44 2.27.3.2 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | FERME | — | Les dispositifs de retenue à sécurité positive (courant requis pour maintenir l'ouverture) libèrent automatiquement les portes coupe-feu maintenues ouvertes. | CNB2015 3.1.8.12 |

### S12 — Activation manuelle du poste de commande des pompiers (FSCS override)

**Catégorie :** Opération manuelle  
**Dispositif initiateur :** Poste de commande de désenfumage des pompiers (Firefighters' Smoke Control Station)  
**Référence(s) :** CNB2015 3.2.6.8

Un pompier prend le contrôle manuel direct des ventilateurs et registres de désenfumage depuis le poste de commande dédié, en dérogation de la séquence automatique.

**Analyse d'ingénierie / interactions entre systèmes :** Le poste de commande des pompiers a préséance absolue sur la logique automatique — c'est une exigence fondamentale de 3.2.6.8 : les pompiers doivent pouvoir imposer une stratégie de désenfumage différente de celle programmée par défaut (ex. pressuriser un étage différent selon l'évolution réelle de l'incendie constatée sur place). Toute commande manuelle prise à ce poste doit être clairement indiquée au tableau principal et empêcher un retour automatique en séquence normale tant que le poste n'a pas été explicitement remis en mode automatique.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-05 — Communication vocale — Diffusion vocale en direct (microphone pompier/préposé) | DISPONIBLE-MODE-POMPIER | — | Diffusion vocale en direct disponible en complément de la reprise manuelle du désenfumage. | CNB2015 3.2.4.21; CNB2015 3.2.6.8 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Indication au tableau principal que le désenfumage est sous contrôle manuel pompier. | CNB2015 3.2.4.11 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | SELON-CONCEPTION | — | État déterminé directement par la commande manuelle du pompier, indépendamment de la séquence automatique. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | SELON-CONCEPTION | — | État déterminé directement par la commande manuelle du pompier. | NFPA-92 conception |
| DF-08 — Poste de commande des pompiers (FSCS) — Disponibilité de la commande manuelle prioritaire | CONTROLE-MANUEL-POMPIER | — | Prise de contrôle manuelle confirmée au poste de commande, préséance sur la séquence automatique. | CNB2015 3.2.6.8 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | SELON-CONCEPTION | — | Position des registres motorisés déterminée par la commande manuelle. | CNB2015 3.1.8.5; NFPA-92 conception |

### S13 — Activation manuelle — fonctionnement Phase II de l'ascenseur (clé pompier)

**Catégorie :** Opération manuelle  
**Dispositif initiateur :** Commutateur à clé Phase II dans la cabine de l'ascenseur désigné pompiers  
**Référence(s) :** CSA-B44 2.27.3

Un pompier, une fois l'ascenseur rappelé au palier de désignation (Phase I), insère la clé et prend le contrôle manuel exclusif de la cabine (Phase II).

**Analyse d'ingénierie / interactions entre systèmes :** La Phase II retire l'ascenseur de tout appel normal ou de secours automatique ; seul l'occupant de la cabine (le pompier muni de la clé) commande les déplacements. Cette opération est indépendante des autres ascenseurs du bâtiment, qui demeurent en rappel Phase I (AS-01) tant que l'alarme est active.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | CONTROLE-MANUEL-POMPIER | — | Prise de contrôle manuelle exclusive de la cabine par la clé Phase II. | CSA-B44 2.27.3 |
| AS-06 — Poste de commande principal / répétiteur — Confirmation visuelle du rappel | ACTIF | — | Indication au poste de commande principal que l'ascenseur pompier est sous contrôle manuel. | CNB2015 3.2.6.9 |

### S20 — Retrait de la clé Phase II / fin du contrôle manuel pompier

**Catégorie :** Opération manuelle  
**Dispositif initiateur :** Commutateur à clé Phase II dans la cabine de l'ascenseur désigné pompiers  
**Référence(s) :** CSA-B44 2.27.3

Le pompier retire la clé du commutateur Phase II, mettant fin au contrôle manuel exclusif de la cabine.

**Analyse d'ingénierie / interactions entre systèmes :** Par sécurité positive, le retrait de la clé ne doit PAS remettre l'ascenseur en service normal automatiquement : la cabine retourne en position de attente Phase I (rappelée au palier de désignation, portes ouvertes, hors service) jusqu'à ce qu'un réarmement explicite du système soit effectué (voir S16).

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | RAPPEL-PALIER-DESIGNATION | — | Retour à l'état de rappel Phase I (attente), portes ouvertes, hors service pour l'usage normal. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| AS-04 — Ascenseur désigné pompiers — Disponibilité du fonctionnement Phase II (manuel, clé pompier) | INACTIF | — | Fin du contrôle manuel exclusif ; la cabine retourne en attente Phase I. | CSA-B44 2.27.3 |

### S14 — Mode essai/vérification technicien (walk test)

**Catégorie :** Essai / vérification  
**Dispositif initiateur :** Commutateur de mode essai au tableau de contrôle, activé par un technicien autorisé  
**Référence(s) :** CAN-ULC-S536 généralités; CAN-ULC-S537 généralités

Le système est placé en mode essai afin de permettre la vérification individuelle des dispositifs initiateurs sans provoquer les actions de terrain (désenfumage, rappel d'ascenseur, déverrouillage) ni transmettre de fausses alarmes à la télésurveillance ou au service incendie.

**Analyse d'ingénierie / interactions entre systèmes :** Exigence opérationnelle critique pour limiter les nuisances lors de l'entretien et des essais périodiques (CAN/ULC-S536) : en mode essai, l'activation d'un dispositif initiateur doit produire une indication locale (lumineuse/sonore de confirmation) SANS déclencher les actions de terrain normalement associées à une alarme. La transmission vers la télésurveillance doit être explicitement mise en mode « essai » (et non simplement coupée) afin que la station de surveillance ne traite pas les signaux comme une urgence réelle, conformément aux bonnes pratiques de coordination avec la télésurveillance avant tout essai.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Confirmation locale de l'activation du dispositif testé, affichée distinctement comme un événement d'essai. | CNB2015 3.2.4.11 |
| AI-09 — Transmission à la télésurveillance — Signal transmis à la station de surveillance | INACTIF | — | Transmission normale à la télésurveillance suspendue et remplacée par un signal de mode essai coordonné au préalable avec la station. | CNB2015 3.2.4.8 |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage de l'essai au journal, distinct des événements réels. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | AUCUNE-ACTION | — | Aucun démarrage réel des ventilateurs de désenfumage en mode essai. | CNB2015 3.2.6.3 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | AUCUNE-ACTION | — | Aucun rappel réel des ascenseurs en mode essai. | CNB2015 3.2.6.9; CSA-B44 2.27 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | AUCUNE-ACTION | — | Aucun déverrouillage réel des portes de contrôle d'accès en mode essai. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | AUCUNE-ACTION | — | Aucun relâchement réel des dispositifs de retenue en mode essai. | CNB2015 3.1.8.12 |

### S15 — Pré-alarme / signal de vérification d'alarme (temporisation d'investigation)

**Catégorie :** Essai / vérification  
**Dispositif initiateur :** Détecteur de fumée configuré avec fonction de vérification d'alarme (temporisation programmable)  
**Référence(s) :** CAN-ULC-S524 généralités

Un détecteur de fumée dans une zone désignée à risque de fausses alarmes déclenche une temporisation d'investigation avant la confirmation en alarme générale, permettant au personnel sur place de vérifier et, le cas échéant, de réinitialiser sans déclencher l'évacuation complète.

**Analyse d'ingénierie / interactions entre systèmes :** Fonctionnalité d'usage optionnel — non exigée par le CNB — permise par CAN/ULC-S524 pour certains types de détecteurs et certaines zones, et couramment utilisée en pratique québécoise pour réduire les fausses alarmes dans les aires où l'activité normale (vapeur, poussière) peut affecter les détecteurs. Doit être limitée aux zones et détecteurs explicitement autorisés par l'analyse de risque du projet et jamais appliquée aux postes manuels, aux détecteurs de gicleurs (débit d'eau) ni aux détecteurs situés directement sur un parcours d'évacuation. Si la temporisation expire sans réinitialisation, le système bascule automatiquement en alarme générale confirmée (S01).

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | AUCUNE-ACTION | — | Aucun signal d'alerte diffusé aux occupants durant la temporisation d'investigation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | AUCUNE-ACTION | — | Aucun signal d'évacuation diffusé durant la temporisation d'investigation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-07 — Tableau annonciateur principal — Indication de la zone en alarme | ACTIF | — | Indication de pré-alarme (distincte visuellement d'une alarme confirmée) au tableau principal. | CNB2015 3.2.4.11 |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage du début de la temporisation d'investigation. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | AUCUNE-ACTION | — | Aucune action de désenfumage tant que l'alarme n'est pas confirmée. | CNB2015 3.2.6.3 |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | AUCUNE-ACTION | — | Aucun rappel d'ascenseur tant que l'alarme n'est pas confirmée. | CNB2015 3.2.6.9; CSA-B44 2.27 |

### S16 — Réarmement du système après intervention

**Catégorie :** Opération manuelle  
**Dispositif initiateur :** Commande de réarmement (reset) au tableau de contrôle, effectuée par une personne autorisée  
**Référence(s) :** CAN-ULC-S524 généralités

Après confirmation que l'événement est terminé et que les conditions sont sécuritaires, une personne autorisée procède au réarmement du système, ramenant les équipements asservis à leur position normale.

**Analyse d'ingénierie / interactions entre systèmes :** Le réarmement du panneau ne doit pas automatiquement remettre en service normal les ascenseurs rappelés : conformément à CSA B44, le retour en service normal des ascenseurs après un rappel Phase I nécessite une confirmation distincte (généralement une remise en service manuelle par le personnel autorisé au poste de commande), même une fois le panneau réarmé — mesure de sécurité additionnelle pour éviter qu'un ascenseur ne reprenne le service normal alors que les conditions à un étage demeurent incertaines.

| Point de contrôle | État | Délai | Justification | Référence(s) |
|---|---|---|---|---|
| AI-01 — Réseau avertisseur d'incendie — Signal sonore d'alerte (ton continu) | INACTIF | — | Arrêt du signal sonore d'alerte. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-02 — Réseau avertisseur d'incendie — Signal sonore d'évacuation (ton temporel/voix) | INACTIF | — | Arrêt du signal sonore d'évacuation. | CNB2015 3.2.4.20; CNB2015 3.2.4.19 |
| AI-06 — Avertisseurs visuels — Avertisseurs stroboscopiques | INACTIF | — | Arrêt des avertisseurs visuels. | CNB2015 3.2.4.18 |
| AI-12 — Réseau avertisseur d'incendie — Enregistrement horodaté de l'événement | ACTIF | — | Horodatage du réarmement au journal du tableau. | CAN-ULC-S1001 5 |
| DF-01 — Ventilateur de pressurisation — cage d'escalier A — Démarrage | ARRET | — | Arrêt des ventilateurs de pressurisation, retour à l'état normal. | CNB2015 3.2.6.3 |
| DF-03 — Ventilateur d'extraction désenfumage — étage sinistré — Démarrage | ARRET | — | Arrêt des ventilateurs d'extraction, retour à l'état normal. | NFPA-92 conception |
| TA-01 — Unités de traitement d'air desservant plus d'un étage — Arrêt | MARCHE | — | Redémarrage des UTA centrales, retour à l'état normal. | CNB2015 3.2.6.4 |
| VO-03 — Registres combinés coupe-feu/coupe-fumée motorisés — étage sinistré — Position désenfumage (ouvert ou fermé selon séquence) | FERME | — | Retour des registres combinés à leur position normale de repos. | CNB2015 3.1.8.5; NFPA-92 conception |
| AS-01 — Tous les ascenseurs — Rappel Phase I — palier de désignation | SELON-CONCEPTION | — | Le panneau lève l'état de rappel, mais le retour en service normal des ascenseurs exige une confirmation manuelle distincte au poste de commande (CSA B44). | CNB2015 3.2.6.9; CSA-B44 2.27 |
| CA-01 — Portes de contrôle d'accès sur le parcours d'évacuation — Déverrouillage | VERROUILLE | — | Retour au verrouillage normal des portes de contrôle d'accès une fois l'alarme levée. | CNB2015 3.4.6.16 |
| PV-01 — Dispositifs de retenue magnétique (portes coupe-feu maintenues ouvertes) — Relâchement (fermeture des portes) | OUVERT | — | Réarmement des dispositifs de retenue en position ouverte (portes coupe-feu retenues de nouveau). | CNB2015 3.1.8.12 |
