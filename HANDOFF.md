# 📋 Document de transition — MEP Resource Command Center

> **But de ce document** : permettre à un nouveau Claude (ou développeur) de reprendre le projet **sans accès à la conversation précédente**. Autonome et exhaustif. Dernière mise à jour : **2026-06-23** (import QuickBooks #26 terminé — voir §14).

---

## 1. CONTEXTE DU PROJET

**Client / utilisateur** : Cristhian Garzon — `cgarzon@expertsmep.com` — **directeur** de **MEP Experts Conseils**, firme de génie-conseil **MEP** (mécanique, électricité, plomberie, protection incendie/gicleurs, coordination/BIM) basée au Québec, ~16 employés.

**Produit** : « **MEP Resource Command Center** » — application web locale (déployable sur Vercel) de **gestion des ressources, de la capacité, de la profitabilité et de la planification financière** des projets de la firme.

**Objectif d'affaires central** : faire de l'app **l'outil principal de gestion de la charge** et **maintenir une marge bénéficiaire cible ≥ 30 %** sur tous les projets. Savoir en temps réel : qui est surchargé / disponible, quels projets dépassent budget/échéancier, quelle est la marge projetée, et aider aux décisions (embauche, accepter/refuser un mandat).

**Historique** : construit de zéro entre le **2026-06-20 et 2026-06-22**. D'abord un MVP (7 modules en lecture), puis Phase 1 (saisie CRUD), import des vraies données (Excel + QuickBooks partiel), puis début d'un **module de planification financière** (cascade honoraires → budget → heures), dont la **Phase A est terminée**.

---

## 2. DÉCISIONS PRISES (importantes)

### Technique
- **Stack** : Next.js **16** (App Router, Turbopack), React **19**, TypeScript, Tailwind CSS **v4**, ShadCN (composants **vendorés** dans `src/components/ui`), **Prisma 6** (`@prisma/client` + `prisma`), PostgreSQL, **NextAuth v5 / Auth.js** (Credentials + **JWT**, pas d'adapter DB), Recharts **3**, Zod **4**, bcryptjs, `@anthropic-ai/sdk`.
- **⚠️ Prisma est FIGÉ en v6** : Prisma 7 a retiré `url` du schéma (exige des *driver adapters* + `prisma.config.ts`). Ne PAS mettre à jour vers 7 sans refonte. (`package.json` : `@prisma/client@^6.19.3`, `prisma@^6.19.3`.)
- **Auth** : Credentials + JWT. **Pas de middleware** ; la protection se fait dans `src/app/(app)/layout.tsx` via `auth()` + `redirect`. RBAC : `ADMIN`/`MANAGER` peuvent écrire, `VIEWER` lecture seule (helper `src/lib/rbac.ts`).
- **Montants en `Float`** (pas Decimal) pour le MVP — à migrer en Decimal pour précision comptable en prod.

### 🚨 Décision opérationnelle CRITIQUE — emplacement d'exécution
- **L'app S'EXÉCUTE depuis `C:\mep-rcc`** (disque local) — **PAS** depuis `Q:`.
- **`Q:` est un lecteur réseau SMB** (`\\192.168.100.3\…`). **Turbopack (seul bundler de Next 16) ne peut PAS y créer les jonctions NTFS** dont il a besoin (`failed to create junction point, os error 80`) → casse `next dev` ET `next build`. Aucune option de config ne contourne ça.
- **`C:\mep-rcc` = source de vérité + dépôt git + base de données locale.**
- **`Q:\1.Cristhian\AI TEST\09_AI_PROJECT\mep-resource-command-center` = copie de sauvegarde** (synchronisée par `robocopy`, **sans git**). Ne pas y exécuter dev/build.
- **Node** est à `C:\Program Files\nodejs` (présent dans le PATH **Machine** mais pas toujours dans le PATH d'une session shell d'outil — le **préfixer** : `$env:Path = "C:\Program Files\nodejs;$env:Path"`).
- **Déploiement Vercel** (Linux) n'a pas la limite de jonctions → le build y fonctionne. Voir `docs/DEPLOYMENT.md`.

### Données
- **Base repartie à neuf** depuis les données de démo fictives → **vraies données** importées (16 employés, 35 projets).
- Disciplines des employés **déduites** des colonnes de rôles des fichiers Excel (fiable).
- Tout le monde **rattaché à Cristhian** (directeur). Un seul bureau « Bureau principal ».
- Projets importés avec **budgets/dates/% NEUTRES** (budget 0, dates [aujourd'hui, +1 an], % 0) **exprès**, pour ne pas générer de fausses alertes tant que les vraies valeurs ne sont pas saisies.
- 13 projets rattachés à de **vrais clients** (préfixes MACH/GLA/COREV/CONSTRUGEP/Desjardins/Hapopex) ; 22 restent « Client à confirmer ».
- **Valeurs par défaut financières** (Phase A) : profit cible **30 %**, frais généraux **10 %**, réserve de risque **5 %** (configurables par projet).

---

## 3. HYPOTHÈSES RETENUES (à valider avec le client)

- **Disciplines employés** déduites des rôles Excel : Issam Hannachi mis en **Mécanique** (apparaît méca ET élec) ; Philippe Dubreuil en **Gestion de projet** (chargé de projet principal, non-ing.). À confirmer.
- **Capacité hebdo = 37,5 h**, **cible facturation = 80 %**, **coût horaire chargé = 0 $**, **facteur de productivité = 1.0**, **date d'embauche = date d'import** — tous des **placeholders** à remplacer par les vraies valeurs (probablement par poste : Senior/Intermédiaire/Junior avec taux et productivité différents — voir spec §BASE DE DONNÉES EMPLOYÉS).
- **Convention de courriel** : `{1re lettre prénom}{nom}@expertsmep.com` (ex. `cgarzon`, `mpion`) — déduite du vrai courriel de Cristhian.
- **Clients** : seuls les préfixes récurrents fiables ont été assignés. Les vrais noms complets/clients sont dans le rapport QuickBooks « rentabilité des projets » (ex. MACH = « Groupe Mach », GLA = « Groupe Lajeunesse Allard inc. », Desjardins = « Banque Desjardins »…).

---

## 4. DONNÉES DE RÉFÉRENCE

### Connexion (compte admin)
| Champ | Valeur |
|---|---|
| URL locale | **http://localhost:3000** |
| Courriel | **cgarzon@expertsmep.com** |
| Mot de passe | **mep2026** *(le client a peut-être changé via la page « Mon compte » → vérifier ; sinon réinitialisable via un script Prisma qui met à jour `User.passwordHash` avec `bcrypt.hash(...)`)* |
| Rôle | ADMIN |

### Employés (16) — déduits des Excel
| Nom | Discipline | Notes |
|---|---|---|
| Cristhian Garzon | Électricité | **Directeur / ADMIN**, manager de tous |
| Philippe Dubreuil | Gestion de projet | Chargé de projet principal |
| Michel Pion, Ludovic Dionne, Salah Bousmal, Issam Hannachi | Mécanique / CVAC | |
| Marc-André Tétrault, Miguel Baril-Lahaie | Électricité | |
| Benjamin Allard, David Lajeunesse | Protection incendie | (gicleurs) |
| Ines Abouda, Toby Ho, Paméla Michaud, Simon Vermette-Chevrier, Jade Pelletier, Jimmy Bouchard | Coordination / BIM | coordonnateurs/modélisateurs |

### Disciplines actuelles en base
`Mécanique / CVAC`, `Électricité`, `Protection incendie`, `Coordination / BIM`, `Gestion de projet`, `Multidisciplinaire (MEP)` (cette dernière sert d'étiquette aux projets).
**Spec demande d'ajouter (configurables)** : Structure, Civil, Architecture, Procédé, Télécommunications, Sécurité, Autres. → **À FAIRE** (+ UI de gestion des disciplines).

### Projets (35) — voir base ; 13 ont un vrai client, 22 sur « Client à confirmer ».

### 📁 Fichiers sources du client (à relire au besoin)
- **Suivi des projets (Excel)** : `O:\Planification\3_Suivi_Des_Projets\Suivi_Des_Projets\`
  - `MEP - Suivi des Projets (2026-05-26).xlsx` (feuilles `Conception`, `Data`)
  - `MEP - Suivi de la Surveillance (2026-05-12).xlsx` (feuilles `Surveillance`, `Data`)
  - Colonnes utiles : Numéro, Nom, Chargé de Projet, Ing. Méca/Élec/Gicleurs (conception ET surveillance), Coordonnateur, « Prochaine Émission » (phase).
- **QuickBooks (CSV)** dans `Q:\1.Cristhian\AI TEST\09_AI_PROJECT\` :
  - `MEP Experts Conseils_Rapport sur la rentabilité des projets.csv` → **par projet** : `Projet`, `Client`, `Revenus`, `Coûts`, `Profit`, `Marge` (≈ 80 lignes ; clés = numéro projet). **= la source autoritaire des honoraires réels + clients réels.**
  - `MEP Experts Conseils_Timesheet Detail by Employee.csv` → **heures réelles** par employé : colonnes `Date de l'activité`, `Durée` (format `HH:MM`, ex. `08:00` = 8 h), `Client` (= « 24103 - MACH 110, O'Connor » OU catégories non-projet « Formation interne », « Amélioration continue »…), `Description`. Groupé par employé (le nom de l'employé est sur une ligne, suivi de ses lignes d'activité). Période : 1 jan – 21 juin 2026.
  - `MEP Experts Conseils_État des résultats.csv` → P&L firme (Revenu 1 576 802,60 $ ; Profit **−59 192,46 $** ; Traitements 1 226 274 $…).
  - `MEP Experts Conseils_Bilan détaillé.csv` → bilan (peu pertinent pour la planif des ressources).
- ⚠️ Le numéro de projet QB peut différer légèrement (espaces, préfixes) du numéro en base — **faire le matching par le numéro en tête** (regex `^\d{5}` ou les 5-6 premiers chiffres).

### Le client configure des **serveurs MCP** pour la prochaine session
`windows-mcp`, `revit`, **`quickbooks`**. → **Un MCP QuickBooks pourrait permettre une intégration LIVE** (au lieu des CSV). Vérifier sa disponibilité via ToolSearch avant de retomber sur les CSV.

### Seuils de couleur
- **Actuels en code** (`src/lib/thresholds.ts`) : Vert <85, Jaune 85-100, **Orange 100-110, Rouge >110**.
- **Spec demande** : Vert 0-85, Jaune 85-100, **Rouge 100-115, Critique >115**. → **À aligner en Phase B** (impacte `RagBand`, badges, graphiques — faire prudemment ou ajouter une bande « occupation » séparée).

---

## 5. STRUCTURE DES FICHIERS (`C:\mep-rcc`)

```
C:\mep-rcc\
├── Demarrer-MEP.bat          ← double-clic : démarre DB + dev (fenêtre à garder ouverte)
├── package.json              ← scripts npm (voir §10)
├── next.config.ts            ← (vide ; ESLint plus configurable ici en Next 16)
├── prisma/
│   ├── schema.prisma         ← modèles (voir ci-dessous)
│   ├── migrations/           ← 2 migrations : init + add_financial_planning
│   ├── seed.ts               ← données DÉMO (non utilisé en prod ; remplacé par import-real)
│   ├── import-real.ts        ← import des 16 employés + 35 projets (lit un JSON temp)
│   └── derive-clients.ts     ← assigne clients par préfixe de nom
├── scripts/
│   ├── db.ps1                ← gestion PostgreSQL portable (setup/start/stop/status/psql)
│   ├── fetch-postgres.ps1    ← (ré)installe les binaires PG 17.4
│   └── dev.mjs               ← lance next dev avec WATCHPACK_POLLING (réseau)
├── .localdb/                 ← PostgreSQL portable (binaires + données) — GITIGNORÉ
├── .env                      ← DATABASE_URL, AUTH_SECRET, ANTHROPIC_* — GITIGNORÉ
├── docs/                     ← ARCHITECTURE, DATA-MODEL, SCREENS, ROADMAP, INTEGRATIONS, DEPLOYMENT
└── src/
    ├── auth.ts               ← config NextAuth v5
    ├── middleware?           ← (aucun)
    ├── app/
    │   ├── layout.tsx        ← racine (fr, fonts Geist)
    │   ├── page.tsx          ← redirige vers /dashboard
    │   ├── globals.css       ← thème ShadCN slate (Tailwind v4) + @media print
    │   ├── (auth)/login/page.tsx
    │   ├── api/auth/[...nextauth]/route.ts
    │   ├── api/ai/query/route.ts          ← assistant (règles + Claude optionnel)
    │   └── (app)/                          ← routes protégées (garde auth dans layout.tsx)
    │       ├── layout.tsx                   ← Shell (sidebar/topbar) + auth()
    │       ├── dashboard/page.tsx
    │       ├── employes/{page, [id], [id]/modifier, nouveau}
    │       ├── projets/{page, [id], [id]/modifier, nouveau, [id]/planification}
    │       ├── clients/page.tsx
    │       ├── capacite/page.tsx
    │       ├── saisie/page.tsx              ← saisie de temps hebdo
    │       ├── ia/page.tsx
    │       ├── alertes/page.tsx
    │       ├── rapports/page.tsx
    │       └── compte/page.tsx              ← changer mot de passe
    ├── components/
    │   ├── ui/                ← ShadCN vendorés (button, card, badge, table, tabs, input, label, progress, separator, avatar)
    │   ├── layout/            ← shell.tsx, nav-items.ts
    │   ├── shared/            ← page-header, kpi-card, flag-badge, util-indicator, simple-markdown, form-fields
    │   ├── charts/            ← future-load, discipline, employee, trend, mini-load (Recharts, "use client")
    │   ├── employees/ projects/ clients/ timesheet/ account/ ai/ capacity/
    │   └── planning/planning-editor.tsx    ← ÉDITEUR DE CASCADE (Phase A)
    └── lib/
        ├── prisma.ts         ← singleton PrismaClient
        ├── auth? (dans src/auth.ts)
        ├── rbac.ts           ← canWrite / requireWrite
        ├── dates.ts          ← semaines UTC (lundi), jours ouvrables
        ├── format.ts         ← fr-CA (devise, heures, %, dates)
        ├── thresholds.ts     ← bandes de couleur (À aligner sur spec)
        ├── labels.ts         ← libellés enums + flags
        ├── metrics.ts        ← calculs employé/projet (utilisation, EAC, écarts…)
        ├── detections.ts     ← drapeaux de risque
        ├── capacity.ts       ← matrice + prévisions
        ├── queries.ts        ← accès données + agrégations dashboard
        ├── recommendations.ts← moteur de règles (questions IA)
        ├── finance.ts        ← ⭐ CASCADE BUDGÉTAIRE (Phase A) : computePlan()
        ├── ai/{context, claude}.ts
        └── actions/          ← server actions : employees, clients, projects, allocations, timeentries, account, planning
```

### Modèles Prisma (résumé)
- `Office`, `Discipline` (+`projectDisciplines`, `staffings`), `Client`, `User` (NextAuth).
- `Employee` : …, `weeklyCapacityHours`, `billableTargetPct`, `costRate` (= taux chargé), `billRate`, **`productivityFactor`** (Phase A), `managerId`, relations `directedProjects`, `staffings`.
- `Project` : `number`, `name`, `status`, `budgetHours`, `budgetFees`, **`feeDesign`, `feeSupervision`, `targetProfitPct`(30), `overheadPct`(10), `riskReservePct`(5), `directorId`** (Phase A), `percentComplete`, `startDate`, `endDate`, `clientId`, `disciplineId`, `projectManagerId`.
- `Allocation` (prévu : employé×projet×semaine×heures), `TimeEntry` (réel), `Absence`.
- **`ProjectDiscipline`** (projet×discipline×`effortPct`) et **`ProjectStaffing`** (projet×discipline×employé×`effortPct`) — Phase A.

---

## 6. TÂCHES TERMINÉES ✅

1. Scaffold Next.js + TS + Tailwind v4 + ShadCN + dépendances.
2. PostgreSQL portable 17.4 déployé en local (port 5433, base `mep_dev`).
3. Schéma Prisma initial + migration + ERD (docs).
4. Logique métier (utilisation, capacité réelle, EAC, écarts, rentabilité, détections).
5. Authentification NextAuth v5 (Credentials + JWT) + page login + garde + RBAC.
6. Les 7 modules MVP : Tableau de bord, Employés, Projets, Capacité (heatmap + simulateur d'affectation), Assistant IA (règles + Claude optionnel), Alertes, Rapports (imprimables).
7. Documentation : `docs/ARCHITECTURE`, `DATA-MODEL` (ERD Mermaid), `SCREENS`, `ROADMAP`, `INTEGRATIONS`, `DEPLOYMENT`, `README`.
8. **Phase 1 — saisie de données** : CRUD Employés (create/edit), Clients (liste/ajout), Projets (create/edit), **éditeur d'affectations** (employé×heures/sem×N semaines), **saisie de temps hebdo**. RBAC sur écritures. Navigation mise à jour.
9. **Build de prod vérifié** (`next build` OK sur C:, 20 routes) + **vercel-build** (prisma generate + migrate deploy + next build) + git init/commit.
10. **Import des vraies données** : 16 employés + 35 projets depuis Excel (base repartie à neuf), compte admin Cristhian créé.
11. **Clients** : 13 projets rattachés par préfixe.
12. **Page « Mon compte »** : changement de mot de passe (vérifie l'actuel, hash bcrypt).
13. **⭐ Phase A du module financier** : migration (champs financiers + ProjectDiscipline/Staffing + productivité + directeur) ; **moteur de cascade** `src/lib/finance.ts` (`computePlan`) ; **server action** `src/lib/actions/planning.ts` (`saveProjectPlan`) ; **éditeur** `/projets/[id]/planification` (honoraires + params → budget production → répartition discipline Σ100% → répartition employé Σ100% → budget/heures prévues/ajustées, recalcul live, sauvegarde) ; bouton « Planification » sur la fiche projet. **Vérifié : `tsc` 0 erreur, page 200.**

**Vérification utilisée tout au long** : `npx tsc --noEmit` (typage) + requêtes HTTP authentifiées (login via NextAuth `/api/auth/callback/credentials` puis GET des pages). Le `next dev` Turbopack a réussi le rendu de toutes les pages.

---

## 7. TÂCHES EN COURS ⏳

- **✅ Tâche #26 — Intégration QuickBooks : TERMINÉE (session 2026-06-22)**. Voir [§14](#14-session-2026-06-22--import-quickbooks-26-terminé) pour le détail. Résumé : honoraires + vrais clients + heures réelles importés depuis les CSV (scripts `prisma/import-qb-{fees,hours,extend}.ts`, idempotents). Base : **55 projets, 17 employés, 21 clients, 1466 TimeEntry (10 182,4 h)**. Le tableau de bord, l'utilisation, les heures consommées/projet et l'EAC sont désormais alimentés par de vraies données.
  - ⚠️ Le **module Simulation** et le **copilote IA** (spec) ne sont **toujours pas commencés** (Phase C).

- **Test utilisateur de la planification** : le client devait tester l'ergonomie de `/projets/[id]/planification`. Feedback non encore reçu — à demander avant/pendant la Phase B.

---

## 8. TÂCHES À FAIRE 📌 (spec complète du module financier)

### Phase B — Temporalisation, capacité, dashboard direction, réel
- **Génération des affectations** : répartir les `adjustedHours` de chaque `ProjectStaffing` en `Allocation` hebdomadaires entre `startDate` et `endDate`, selon une **courbe** : uniforme / avant-projet (front-loaded) / arrière-projet (back-loaded) / personnalisée. (Bouton « Générer les affectations » dans l'éditeur.)
- **Occupation & seuils** : `Occupation = heures assignées / heures disponibles` par semaine/mois/trimestre ; aligner les **seuils sur la spec (85/100/115, + bande Critique)**.
- **Tableau de bord Direction** : Financier (Honoraires totaux, Budget production, Profit prévu/**réalisé**/**projeté**, **Marge projetée**) ; Ressources (capacité totale/utilisée, surchargés, disponibles) ; Disciplines (charge, disponibilité, discipline critique).
- **Import QuickBooks** (réel) : voir tâche #26 → puis **Heures prévues VS réelles**, **Écart heures / coût / profit**, **EAC / ETC**, **Profit final prévu / Marge finale prévue**.

### Phase C — Simulation & IA
- **Module Simulation** (bouton « Simuler ») : modifier honoraires / répartitions / taux / ajouter projet ou employé → **recalcul instantané** (capacité, occupation, profit, marge, surcharge, disponibilité) **sans enregistrer**. Le moteur `finance.ts` est déjà pur → réutilisable côté client pour ça.
- **Copilote IA** (étendre `/ia`) : comprendre toutes les données + répondre à : qui est surchargé/disponible, quelle discipline manque de capacité, projets à risque/dépassement, **marge finale par projet**, **« puis-je accepter un mandat de 250 000 $ ? »**, quelle équipe peut l'absorber, qui a le plus de dispo sur 8 semaines, meilleurs/pires projets en rentabilité, CP qui sous-estiment. (Brancher sur `@anthropic-ai/sdk` si `ANTHROPIC_API_KEY` ; sinon règles.)

### Transverses / qualité
- **Gestion des disciplines** (UI configurable) + ajouter Structure/Civil/Architecture/Procédé/Télécom/Sécurité/Autres.
- **Paramètres globaux** configurables (profit/frais/réserve par défaut) — actuellement constantes code + champs par projet.
- **Vraies valeurs employés** (taux chargé, productivité par poste, capacité, date d'embauche) — saisie ou import.
- **Vrais budgets/dates/%** des projets (saisis ou via QB).
- **Gestion des absences** (UI) et **suppression** (employés/projets) — pas encore faites.
- **Comptes de connexion** pour les autres (managers/lecteurs) — UI d'admin des utilisateurs à créer (seul Cristhian a un compte).
- **Déploiement Vercel** (guide prêt : `docs/DEPLOYMENT.md`).
- **Migrer les montants en `Decimal`** pour la prod.
- **Tests** (unitaires sur `lib/*`, E2E Playwright).

---

## 9. QUESTIONS OUVERTES ❓ (à poser au client)

1. **Taux horaires chargés et facteurs de productivité** réels — par employé ou par niveau (Senior/Intermédiaire/Junior) ? (actuellement 0 $ et 1.0)
2. **Capacités hebdomadaires** réelles (37,5 h par défaut) et **bureaux** réels (un seul « Bureau principal » actuellement) ?
3. **Honoraires, dates début/fin, % d'avancement** réels par projet — via QuickBooks (Revenus) + un autre fichier, ou saisie manuelle ?
4. **Disciplines** : confirmer la liste finale (la spec en ajoute 7). Issam Hannachi → Méca ou Élec ? Philippe Dubreuil → Gestion OK ?
5. **Honoraires conception vs surveillance** : le rapport QB ne distingue pas — comment les répartir ? (les fichiers de suivi séparent Conception/Surveillance par phase)
6. **Courbe de répartition** par défaut souhaitée (uniforme / front / back) ?
7. **Aligner les seuils** sur 85/100/115 (spec) en remplaçant l'orange/rouge actuel ? Confirmer.
8. **Qui doit avoir un accès** à l'app et avec quel rôle (Admin/Gestionnaire/Lecture) ?
9. **Mot de passe** : Cristhian a-t-il changé `mep2026` ?
10. **MCP QuickBooks** : préfère-t-il une intégration **live** (MCP) plutôt que les exports CSV ?

---

## 10. INSTRUCTIONS IMPORTANTES POUR POURSUIVRE

### Démarrer l'application
- **Le plus simple** : double-cliquer **`C:\mep-rcc\Demarrer-MEP.bat`** (démarre PostgreSQL + `next dev` ; **garder la fenêtre ouverte** ; fermer = arrêter). Puis http://localhost:3000.
- **En ligne de commande** (PowerShell) :
  ```powershell
  cd C:\mep-rcc
  npm run db:start     # démarre PostgreSQL portable (port 5433)
  npm run dev          # http://localhost:3000  (ou: npm run dev:nopoll sur disque local)
  ```
- **Pour les outils Claude (shell)** : préfixer le PATH `$env:Path = "C:\Program Files\nodejs;$env:Path"` ; faire `Set-Location 'C:\mep-rcc'` ; les chemins `Q:\` ont des **espaces** (« AI TEST ») → bien quoter.

### Scripts npm utiles
`dev`, `dev:nopoll`, `build`, `start`, `db:start`/`db:stop`/`db:status`/`db:psql`, `db:migrate` (= `prisma migrate dev`), `db:seed`, `db:reset`, `db:studio` (Prisma Studio), `setup` (fetch+start+migrate deploy+seed), `vercel-build`.

### Règles de travail
- **NE JAMAIS exécuter `npm run dev`/`build` depuis `Q:`** (jonctions SMB cassées). Travailler sur **`C:\mep-rcc`**.
- Après modif du **schéma Prisma** : `npx prisma migrate dev --name <x>` (régénère le client), puis **redémarrer le serveur dev** (l'instance en cours garde l'ancien client en mémoire). La base est en **prod** → migrations **additives + valeurs par défaut** uniquement (ne pas casser les données existantes : 16 employés, 35 projets).
- **Synchroniser C: → Q:** après des changements importants (sauvegarde, non destructif) :
  ```powershell
  robocopy 'C:\mep-rcc' 'Q:\1.Cristhian\AI TEST\09_AI_PROJECT\mep-resource-command-center' /E /XD node_modules .next .localdb .git /XF "*.log" "tsconfig.tsbuildinfo"
  ```
  *(robocopy renvoie un code 1 = « fichiers copiés » = succès ; pas une erreur.)*
- **Git** : le dépôt est sur `C:\mep-rcc` (commit initial fait). `gh` n'est pas installé. Commiter quand pertinent ; le client n'a pas encore poussé sur GitHub.
- **Server Actions** : RBAC via `requireWrite()` au début. Pour des données complexes (ex. plan), passer un **objet** directement à l'action (pas via `<form>`) — voir `saveProjectPlan`.
- **Vérification** : `npx tsc --noEmit` (sur C:) + requêtes HTTP authentifiées (login via `/api/auth/callback/credentials` avec csrfToken). ⚠️ En PowerShell, **`$pid` est une variable réservée** (ID processus) — utiliser un autre nom.
- **Le classifier d'outils peut être momentanément indisponible** (« claude-opus-4-8 temporarily unavailable ») → réessayer l'action ; les opérations lecture seule passent toujours.
- **Mémoire persistante** Claude : `C:\Users\Utilisateur\.claude\projects\Q--1-Cristhian-AI-TEST-09-AI-PROJECT-Hotel-Intercontinental---HINT\memory\` contient un fichier `mep-command-center.md` rappelant l'emplacement C: et la limite réseau.

### Cascade financière (cœur du module, déjà codée — `src/lib/finance.ts`)
```
Budget production = Honoraires × (1 − profit% − frais% − réserve%)     [seul montant → heures]
Budget discipline = Budget production × %discipline                    [Σ disciplines = 100 %]
Budget employé    = Budget discipline × %employé                       [Σ employés/discipline = 100 %]
Heures prévues    = Budget employé ÷ taux chargé ($/h)
Heures ajustées   = Heures prévues ÷ facteur productivité
Occupation        = Heures assignées ÷ Heures disponibles              [seuils 85/100/115]
```
Exemple spec : Honoraires 100 000 $, profit 30 %, frais 10 %, réserve 5 % → **Budget production = 55 000 $**.

### Prochaine étape recommandée
1. ~~Import QuickBooks (#26)~~ ✅ **fait** (2026-06-22, §14).
2. ~~**Phase B — Tableau de bord Direction**~~ ✅ **fait** (2026-06-23, §15) : page `/direction`, financier réalisé (honoraires/coûts/profit/marge globale 34,7 %) + ressources + rentabilité par projet.
3. ~~Réconciliation revenus~~ ✅ + ~~Branding MEP~~ ✅ + ~~Vue firme & obligations fiscales~~ ✅ + ~~seuils 85/100/115~~ ✅ + ~~taux chargés (dérivés paie)~~ ✅ (2026-06-23, §16).
4. ~~Génération d'affectations par courbe~~ ✅ **fait** (2026-06-23, §17). **Phase B complète.**
5. ~~Phase C : Simulation~~ ✅ + ~~copilote IA~~ ✅ **faits** (2026-06-23, §18). **MVP + Phases A/B/C terminés.**
6. Transverses (§8) : **timesheet complet** (l'export ne couvre que jan-juin 2026 ; le client doit ré-exporter depuis le début des projets), **vraies dates/% projets**, valider les **taux chargés estimés** + le **fee split conception/surveillance**, UI gestion disciplines, admin utilisateurs, montants Decimal, déploiement Vercel.
7. Optionnel : ajouter `ANTHROPIC_API_KEY` au `.env` pour passer le copilote `/ia` de règles → Claude live (auto-détecté).

---

## 14. SESSION 2026-06-22 — Import QuickBooks (#26) terminé

Réalisé et commité sur `C:\mep-rcc` (+ sauvegarde Q:), `tsc` OK. Commits `6ddf7db` (Phase A enfin versionnée), `afa9736` (import fees+hours), `f310800` (extension).

**Scripts ajoutés (idempotents, source = CSV dans `Q:\1.Cristhian\AI TEST\09_AI_PROJECT\`)** :
- `prisma/import-qb-fees.ts` — `budgetFees = feeDesign = Revenus` (QB ne sépare pas conception/surveillance → `feeSupervision = 0`), réassigne les vrais clients (col Client), nettoie les clients-préfixes orphelins. Matching par numéro `^\d{5}`.
- `prisma/import-qb-hours.ts` — parse `Durée` HH:MM → heures, agrège par employé×projet×**semaine (lundi UTC)** → `TimeEntry`. Catégories non-projet exclues. Contient `EMPLOYEE_ALIASES`.
- `prisma/import-qb-extend.ts` — crée les employés/projets manquants. **À lancer en 1er**, puis fees, puis hours.

**État base après import** : **55 projets** (35 Excel + 20 créés depuis le timesheet), **17 employés**, **21 clients**, **1466 TimeEntry / 10 182,4 h** (période 2026-01-05 → 06-08).

**Décisions client appliquées** :
- Cristhian pointe au timesheet sous « **Cristhian Alonso Garzon Hoyos** » → alias (407 h rattachées).
- **David Jutras** créé (Électricité, actif, embauché 2026-01-05) — absent du roster Excel mais actif.
- **5 employés du timesheet ignorés** (anciens/contractuels, ~1 416 h non importées) : Ramadan Shaath, Samuel Lavigne, Zoe Bernard, Soukaina Azzouzi, Rosalie Faucher.

**Restes neutres** : projet **26034 (RPA Richelieu)** = aucune ligne QB (client « à confirmer », honoraires 0). Employés sans heures projet : Benjamin Allard, David Lajeunesse (gicleurs).

**Pour réimporter** (ex. nouveaux CSV) : `node --env-file=.env --import tsx prisma/import-qb-extend.ts` puis `…import-qb-fees.ts` puis `…import-qb-hours.ts`.

---

## 15. SESSION 2026-06-23 — Tableau de bord Direction (Phase B)

Commits `0f046c2` (dashboard) + `6db5aaf` (maj HANDOFF). `tsc` OK, `/direction` HTTP 200 authentifié, vérifié avec données réelles.

- **Migration `add_actual_cost`** : `Project.actualCost` (Float, défaut 0) = coûts réels QB. `import-qb-fees.ts` importe désormais la colonne **Coûts** (en plus de Revenus).
- **`src/lib/queries.ts` → `getDirectionData()`** : financier réalisé (Σ honoraires 1,41 M$, Σ coûts 0,92 M$, profit 0,49 M$, **marge globale 34,7 %**, 11 projets sous cible 30 %, 7 en perte), ressources (capacité, heures réelles, **utilisation réalisée ~69 %**, facturable), charge par discipline (heures réelles), rentabilité par projet (meilleurs/pires).
- **Page `src/app/(app)/direction/page.tsx`** + entrée nav « Direction ». Rendu serveur, pas de graphe client (v1).
- ⚠️ **Caveat affiché** : marge sur **coûts directs**, avant frais généraux firme (l'État des résultats QB, overhead inclus, est négatif).
- **Volet « projeté » (EAC $, marge projetée) omis volontairement** : bloqué sur `costRate = 0` (placeholder). Le débloquer = saisir/importer les vrais taux chargés (question §9.1).

---

## 16. SESSION 2026-06-23 (suite) — Revenus, branding, vue firme, seuils, taux

Commits `bd67436`, `a187abb`, `3532348`, `8b0c4bb`, `50cf992`. `tsc` OK, pages 200, synchronisé Q:.

- **Réconciliation revenus** : `import-qb-extend.ts` crée aussi les projets facturés sans heures → **67 projets**, Σ honoraires 1,52 M$ (≈ total rapport).
- **Branding MEP** : thème marine `#13243F` + or `#C2A14E` (`globals.css` `--brand-*`), logo officiel `public/logo-mep.png` (sidebar + login), favicon `app/icon.svg`, titre app.
- **Vue firme + obligations fiscales** : migration `add_firm_finance` (singleton, pré-rempli État des résultats : revenu **1 576 803 $**, dépenses 1 635 995 $, net **−59 192 $**), `getFirmFinance()`, action `saveFirmFinance` (RBAC), formulaire éditable TPS/TVQ/DAS/pénalités sur `/direction`. ⚠️ La marge projet (34–38 %) est **avant** overhead ; la firme est en **perte nette**.
- **Seuils 85/100/115** : `thresholds.ts` (`CRITICAL_PCT` 110→115) + usages.
- **Taux chargés** : `prisma/derive-cost-rates.ts` — `costRate = paie nette (Bilan) × 1,45 ÷ heures totales loggées`. 42–173 $/h (moy. 93). **Validé** : Σ coût MO 854 k$ vs coût QB 914 k$ = 93 %. Débloque la marge projetée + cascade. **ESTIMATION** — ajustable via formulaire employé (« Coût horaire »). Bruité par projet si saisie de temps incomplète.

---

## 17. SESSION 2026-06-23 (fin) — Génération d'affectations par courbe

Commit `891a1b6`. `tsc` OK, vérifié de bout en bout. **Phase B complète.**

- **`src/lib/scheduling.ts`** (pur) : `LoadCurve` = uniforme/avant/arrière, `curveWeights(n, curve)` (poids normalisés), `distributeHours(total, n, curve)` (somme exacte préservée, reliquat d'arrondi sur dernière semaine).
- **`generateAllocations(projectId, curve)`** (dans `actions/planning.ts`) : recompute la cascade depuis le plan enregistré (`ProjectStaffing`/`ProjectDiscipline`) → heures ajustées par employé → étalées sur les lundis entre `startDate`/`endDate` → `Allocation` (delete + createMany agrégé). RBAC.
- **Éditeur de planif** : sélecteur de courbe + bouton « Générer les affectations » (agit sur le plan **enregistré**).
- **Démo** : projet **24109** doté d'un plan (Méca 50 / Élec 30 / Coord 20) + 162 `Allocation` sur 54 sem. → visible dans `/capacite` et le dashboard. Régénérable/effaçable via l'éditeur.
- ⚠️ Dates projets = placeholder → affectations étalées sur ~1 an fictif. Saisir les vraies dates pour un échéancier réel.

---

## 18. SESSION 2026-06-23 — Phase C (Simulation + copilote IA), phase projets

Commits `0759c22` (phase conception/surveillance), `3bea50c` (simulation), `d31f02a` (copilote IA). `tsc` OK, vérifié, synchronisé Q:.

- **Phase Conception/Surveillance** (§ demande client) : `Project.inConception`/`inSurveillance` classés depuis les fichiers de suivi sur **O:** (lisibles avec `py`+openpyxl). Éditable (cases à cocher formulaire projet), badges + filtre dans la liste. 16 conception / 17 surveillance / 2 les deux / 32 non spécifiés.
- **Module Simulation** (`/simulation`) : `getDisciplineCapacity()` + `MandateSimulator` — « puis-je accepter ce mandat ? » : honoraires/durée/répartition → budget prod, heures, occupation/discipline (seuils), verdict faisabilité. Réutilise `finance.ts`/`thresholds.ts` purs. Rien enregistré.
- **Copilote IA** (`/ia`) : `answerQuestion` répond aux questions finances/capacité/mandat/rentabilité ; contexte + snapshot Claude enrichis (firm, disciplines, marge réelle, phase, taux). ⚠️ `ANTHROPIC_API_KEY` vide → mode **règles** ; ajouter une clé = Claude live auto.
- **Édition dans localhost** (demande client) : confirmé — tout est éditable dans l'app (projets/employés/taux/phase/dates, finances firme/taxes, planif, saisie). Lancer avec `Demarrer-MEP.bat`.
- ⚠️ **Heures** : l'export timesheet ne couvre que **jan-juin 2026** ; le client doit ré-exporter depuis le début de chaque projet (certains = 2024) pour réconcilier les heures avec les coûts QB.

---
*Fin du document de transition. Tout le code est sur `C:\mep-rcc` (exécutable, git) avec sauvegarde sur `Q:\…\mep-resource-command-center`.*
