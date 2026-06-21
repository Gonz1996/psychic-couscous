# Feuille de route

## Phase 0 — MVP (livré ✅)

- [x] Architecture, modèle de données, migrations Prisma
- [x] Authentification (NextAuth, rôles)
- [x] Gestion des employés (indicateurs, fiche)
- [x] Gestion des projets (budget, EAC, échéancier, rentabilité)
- [x] Planification de capacité (prévisions, heatmap, simulation)
- [x] Tableau de bord exécutif (KPIs + graphiques)
- [x] Détections automatiques + centre d'alertes
- [x] Assistant IA (règles + Claude optionnel)
- [x] Rapports de gestion imprimables
- [x] Données de démonstration réalistes

## Phase 1 — Saisie & administration (4–6 semaines)

- [ ] CRUD complet (formulaires) : employés, projets, clients, affectations
- [ ] Saisie de temps hebdomadaire par les employés
- [ ] Édition de l'avancement et des budgets par les chargés de projet
- [ ] Gestion des absences (calendrier d'équipe)
- [ ] Contrôle d'accès par rôle (RBAC) appliqué aux actions d'écriture

## Phase 2 — Collaboration & notifications (4–6 semaines)

- [ ] Notifications (courriel/Teams) sur seuils critiques
- [ ] Affectation par glisser-déposer dans la planification
- [ ] Historique et journalisation des modifications
- [ ] Commentaires et suivi par projet

## Phase 3 — Intégrations (voir INTEGRATIONS.md)

- [ ] QuickBooks (heures facturables, honoraires, coûts réels)
- [ ] Microsoft 365 / Outlook (absences, calendriers)
- [ ] Teams (alertes, requêtes à l'assistant)
- [ ] Excel (import/export)
- [ ] Power BI (jeu de données analytique)

## Phase 4 — Analytique avancée & IA (continu)

- [ ] Prévision de charge basée sur l'historique (tendances)
- [ ] Optimisation automatique des affectations
- [ ] Détection d'anomalies de rentabilité
- [ ] Tableaux de bord personnalisables

## Dette technique à adresser

- [ ] Montants en `Decimal` (précision comptable)
- [ ] Tests unitaires de la logique métier (`src/lib/*`)
- [ ] Tests E2E (Playwright)
- [ ] Pagination/virtualisation si la firme dépasse ~100 employés
