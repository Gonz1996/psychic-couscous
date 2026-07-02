# MEP Resource Command Center

Système centralisé de pilotage des ressources pour une firme de génie-conseil **MEP** (mécanique, électricité, plomberie). Il offre une vue temps réel de la **charge**, de la **capacité**, de la **performance** et de la **disponibilité** des équipes, avec détection automatique des risques et un assistant d'aide à la décision.

> Savoir immédiatement : qui est surchargé, qui est disponible, quels projets dépassent leur budget, lesquels risquent d'être en retard, et comment rééquilibrer la charge.

## Fonctionnalités

- **Tableau de bord exécutif** — KPIs (capacité, utilisation moyenne, surchargés, disponibles, projets à risque, budget consommé) et graphiques (charge future, évolution, par discipline, par employé).
- **Gestion des employés** — utilisation, disponibilité, facturation, heures assignées/réalisées/restantes, indicateurs couleur (vert/jaune/orange/rouge).
- **Gestion des projets** — écart budget, écart échéancier, rentabilité, prévision à terminaison (EAC), détection des dépassements/retards/sous-estimations/manques de ressources.
- **Planification de capacité** — prévisions 4/8/12 semaines, heatmap de charge, simulateur d'affectation et rééquilibrage suggéré.
- **Alertes automatiques** — seuils critiques de surcharge, dépassements et retards.
- **Assistant IA** — moteur de recommandations déterministe + questions en langage naturel (propulsé par Claude si une clé API est fournie).
- **Rapports de gestion** — rapport exécutif imprimable / exportable en PDF.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI |
| Visualisation | Recharts |
| Backend | Next.js (Server Components, Route Handlers, Server Actions) |
| Base de données | PostgreSQL |
| ORM | Prisma 6 |
| Authentification | NextAuth (Auth.js v5) |
| IA | Anthropic Claude (optionnel) |
| Déploiement cible | Vercel |

## Prérequis

- **Node.js ≥ 20** (testé avec Node 24). Vérifier : `node -v`.
- Aucune installation de PostgreSQL requise : un **PostgreSQL portable** est utilisé en local (binaires dans `.localdb/`, non versionnés).

## Démarrage rapide

```bash
npm install            # dépendances (si nécessaire)
npm run db:start       # Postgres portable local (port 5433) + base mep_dev
npm run db:migrate     # crée les tables (1re fois)
npm run db:seed        # ~20 employés, 14 projets, données réalistes
npm run dev            # http://localhost:3000
```

Se connecter ensuite avec le compte de démonstration.

### Identifiants de démonstration

| Rôle | Courriel | Mot de passe |
|---|---|---|
| Administrateur | `admin@expertsmep.com` | `demo1234` |
| Gestionnaire | `sophie.gagnon@expertsmep.com` | `demo1234` |

## Scripts npm

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement (surveillance par *polling* — voir note réseau) |
| `npm run build` | Build de production (disque local ou Vercel — voir note réseau) |
| `npm run start` | Serveur de production (après `build`) |
| `npm run db:start` | Démarre PostgreSQL portable + crée `mep_dev` |
| `npm run db:stop` | Arrête PostgreSQL portable |
| `npm run db:status` | État du serveur PostgreSQL |
| `npm run db:fetch` | (Ré)installe les binaires PostgreSQL portables |
| `npm run db:migrate` | Applique les migrations Prisma (dev) |
| `npm run db:seed` | Recharge les données de démonstration |
| `npm run db:reset` | Réinitialise la base + re-seed |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run db:psql` | Console psql sur la base locale |

## Assistant IA (optionnel)

Sans clé, l'assistant répond via un **moteur de règles déterministe**. Pour activer les réponses en langage naturel via **Claude**, renseigner dans `.env` :

```env
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-sonnet-4-6"   # ou claude-opus-4-8 / claude-haiku-4-5-20251001
```

## ⚠️ Note importante — lecteur réseau

Ce projet a été créé sur un **lecteur réseau** (`Q:`). La surveillance native de fichiers et la création de jonctions NTFS y échouent, ce qui gêne l'outillage Next.js/Turbopack. Mesures prises :

- `npm run dev` force le **polling** (`scripts/dev.mjs`) et Prisma est déclaré `serverExternalPackages` (évite les jonctions).
- Le **build de production Turbopack** crée des jonctions incompatibles avec un partage réseau.

**➡️ Pour de meilleures performances et un build local fiable, copier le projet sur un disque local (`C:`)** :

```bash
robocopy "Q:\...\mep-resource-command-center" "C:\mep-rcc" /E /XD node_modules .next .localdb
cd C:\mep-rcc
npm install
npm run db:fetch && npm run db:start && npm run db:migrate && npm run db:seed
npm run dev
```

Le déploiement **Vercel** (Linux) n'est pas concerné par ces limites.

## Déploiement (Vercel)

1. Pousser le dépôt sur GitHub.
2. Importer dans Vercel et provisionner un PostgreSQL géré (Neon, Vercel Postgres, Supabase…).
3. Variables : `DATABASE_URL`, `AUTH_SECRET` (`npx auth secret`), optionnellement `ANTHROPIC_API_KEY`.
4. `prisma migrate deploy` au build ; lancer le seed une fois si désiré.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture et principes
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — modèle de données + diagramme ERD
- [`docs/SCREENS.md`](docs/SCREENS.md) — plan des écrans
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — feuille de route
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — intégrations futures (QuickBooks, M365, Power BI…)
- [`docs/FIRE-ALARM-CAUSE-EFFECT-MATRIX.md`](docs/FIRE-ALARM-CAUSE-EFFECT-MATRIX.md) — outil de génération de matrices causes-effets (alarme incendie, bâtiments multirésidentiels de grande hauteur)

## Outils métier

- **Matrice causes-effets — alarme incendie** (`src/lib/fire-alarm-matrix/`) — génère la matrice causes-effets complète (désenfumage, ascenseurs, ventilation, contrôle d'accès, génératrice, pompes incendie, gicleurs…) d'un bâtiment multirésidentiel de grande hauteur, conforme CNB 2015/Code de construction du Québec/CAN-ULC-S1001, paramétrable par projet. Voir [`docs/FIRE-ALARM-CAUSE-EFFECT-MATRIX.md`](docs/FIRE-ALARM-CAUSE-EFFECT-MATRIX.md).

  ```bash
  npm run matrix:generate -- fire-alarm-matrix/examples/tour-standard.json
  ```
