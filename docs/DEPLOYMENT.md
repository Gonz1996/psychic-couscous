# Déploiement sur Vercel

L'application est prête pour Vercel. Le partage réseau Windows ne pouvait pas exécuter Turbopack localement, mais Vercel (Linux) n'a pas cette limite — le build s'y déroule normalement.

## Vue d'ensemble

```
GitHub (code) ──► Vercel (build + hébergement) ──► PostgreSQL géré (Neon)
```

À chaque `git push`, Vercel exécute le script **`vercel-build`** :
`prisma generate && prisma migrate deploy && next build` — les migrations sont donc appliquées automatiquement à la base de production.

## Prérequis

- Un compte **GitHub**, un compte **Vercel**, un compte **Neon** (PostgreSQL géré, offre gratuite suffisante). Alternatives : Vercel Postgres, Supabase.

## Étape 1 — Pousser le code sur GitHub

Le dépôt git est **déjà initialisé** sur `C:\mep-rcc` (historique de commits présent). Il reste à le relier à GitHub :

1. Créer un dépôt **vide** sur https://github.com/new (ex. `mep-rcc`, privé), sans README.
2. Depuis `C:\mep-rcc` :

```bash
git remote add origin https://github.com/<votre-compte>/mep-rcc.git
git push -u origin main
```

> `.env`, `.localdb/`, `node_modules/` et `.next/` sont déjà exclus par `.gitignore` — aucun secret ni binaire n'est poussé.
> Le build de production a été vérifié localement (`npm run build` — 26 routes compilées).

## Étape 2 — Créer la base PostgreSQL (Neon)

1. Créer un projet sur https://neon.tech.
2. Copier la **chaîne de connexion** (Connection string), format :
   `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
3. Pour un outil interne (faible concurrence), la connexion **directe** convient et simplifie les migrations. Pour monter en charge plus tard, utiliser l'URL **pooled** (`-pooler`) et ajouter un `directUrl` au schéma Prisma.

## Étape 3 — Importer le projet dans Vercel

1. https://vercel.com → **Add New… → Project** → importer le dépôt GitHub.
2. Framework détecté automatiquement : **Next.js**. Laisser les réglages par défaut (Vercel utilise le script `vercel-build`).

## Étape 4 — Variables d'environnement Vercel

Dans **Settings → Environment Variables** (Production + Preview) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | la chaîne de connexion Neon (étape 2) |
| `AUTH_SECRET` | générer avec `npx auth secret` (ou `openssl rand -base64 33`) |
| `ANTHROPIC_API_KEY` | *(optionnel)* clé Claude pour l'assistant IA |
| `ANTHROPIC_MODEL` | *(optionnel)* ex. `claude-sonnet-4-6` |

`AUTH_TRUST_HOST` est géré automatiquement sur Vercel — rien à ajouter.

## Étape 5 — Déployer

Cliquer **Deploy**. Le build applique les migrations puis compile l'app. À la fin, l'URL de production est fournie.

## Étape 6 — Données initiales

`prisma migrate deploy` (lancé par `vercel-build`) crée le **schéma** mais la base de prod démarre **sans données**. La base locale contient déjà les **vraies données** (16+1 employés, 67 projets, clients, honoraires/coûts/heures QuickBooks, phases, taux chargés, finances firme). Pour les transférer en production, **copier la base locale vers Neon** (recommandé) :

```powershell
# 1) Démarrer la base locale puis exporter (binaires PG portables dans .localdb)
npm run db:start
& .\.localdb\pgsql\bin\pg_dump.exe `
  --no-owner --no-privileges --data-only `
  "postgresql://postgres@localhost:5433/mep_dev" `
  -f mep_data.sql

# 2) Importer dans Neon (après que Vercel a appliqué les migrations = schéma prêt)
& .\.localdb\pgsql\bin\psql.exe "<chaîne Neon>" -f mep_data.sql
```

*(Alternative : ré-exécuter les scripts d'import — `import-real`, `import-qb-*`, `derive-*` — en pointant `DATABASE_URL` sur Neon. Plus long, mais reproductible.)*

> ⚠️ **Sécurité** : avant la mise en ligne, changer le mot de passe de Cristhian (page « Mon compte ») et créer les autres comptes via **Utilisateurs** (admin). Ne pas utiliser le seed de démo (`npm run db:seed`) en production — il insère des comptes fictifs.

## Notes techniques

- **Prisma en serverless** : `prisma generate` s'exécute dans `vercel-build` (sur Linux) → le bon moteur est généré. Si vous passez à l'URL *pooled* de Neon, ajoutez `directUrl = env("DIRECT_URL")` au bloc `datasource` du schéma et définissez `DIRECT_URL` (connexion directe) pour les migrations.
- **Mises à jour** : chaque `git push` sur `main` redéploie et applique les nouvelles migrations automatiquement.
- **Domaine** : ajouter un domaine personnalisé dans Vercel → Settings → Domains.
