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

Depuis `C:\mep-rcc` :

```bash
git init
git add .
git commit -m "MEP Resource Command Center"
git branch -M main
git remote add origin https://github.com/<votre-compte>/mep-rcc.git
git push -u origin main
```

> `.env` et `.localdb/` sont déjà exclus par `.gitignore` — aucun secret ni binaire n'est poussé.

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

La base de production démarre **vide** (schéma seulement). Deux options :

- **Démo** : charger les données fictives une fois, depuis votre poste, en pointant sur la prod :
  ```bash
  # PowerShell — attention : écrase toute donnée existante
  $env:DATABASE_URL="<chaîne Neon>"; npm run db:seed
  ```
- **Production réelle** : ne pas seeder. Créer plutôt un vrai compte administrateur (ajouter un enregistrement `User` avec un mot de passe haché bcrypt), puis saisir vos employés/projets via l'interface.

> ⚠️ Le seed crée des comptes de démonstration (`admin@expertsmep.com` / `demo1234`). **Ne pas les laisser en production** — changez le mot de passe ou supprimez-les.

## Notes techniques

- **Prisma en serverless** : `prisma generate` s'exécute dans `vercel-build` (sur Linux) → le bon moteur est généré. Si vous passez à l'URL *pooled* de Neon, ajoutez `directUrl = env("DIRECT_URL")` au bloc `datasource` du schéma et définissez `DIRECT_URL` (connexion directe) pour les migrations.
- **Mises à jour** : chaque `git push` sur `main` redéploie et applique les nouvelles migrations automatiquement.
- **Domaine** : ajouter un domaine personnalisé dans Vercel → Settings → Domains.
