# Architecture

## Vue d'ensemble

Application web **full-stack Next.js** (App Router) en TypeScript. Le rendu et l'accès aux données se font côté serveur (React Server Components) ; seuls les éléments interactifs (graphiques, filtres, simulateur, assistant) sont des composants client.

```
Navigateur
   │  (HTML/JSON)
   ▼
Next.js App Router ── Server Components ──► lib/queries ─┐
   │  Route Handlers (/api/*)                            │
   │  Server Actions (auth)                              ▼
   │                                              lib/metrics, detections,
   ▼                                              capacity, recommendations
NextAuth (JWT, Credentials)                              │
   │                                                     ▼
   └────────────────────────────────────────────► Prisma ──► PostgreSQL
```

## Principes de conception

1. **Logique métier pure et isolée.** Tous les calculs (utilisation, capacité réelle, EAC, écarts, rentabilité, détections) vivent dans `src/lib/*` sous forme de fonctions pures, testables et réutilisées par toutes les pages et l'API. Aucune règle métier dans les composants UI.
2. **Le serveur calcule, le client affiche.** Les pages sont des Server Components qui chargent les données (`lib/queries`), appliquent la logique métier et passent des DTO simples aux composants client (graphiques Recharts, tableaux filtrables).
3. **Une seule source de vérité pour les seuils.** Les seuils de couleur (vert/jaune/orange/rouge) et les seuils de détection sont centralisés dans `src/lib/thresholds.ts`.
4. **IA à dégradation gracieuse.** L'assistant fonctionne sans dépendance externe (moteur de règles). Si `ANTHROPIC_API_KEY` est présent, il enrichit les réponses via Claude, avec repli automatique sur les règles en cas d'erreur.

## Couches

### 1. Accès aux données — `src/lib/queries.ts`, `src/lib/prisma.ts`
Charge employés et projets avec leurs relations (affectations, saisies de temps, absences) sur une fenêtre glissante (≈ −10 à +16 semaines), puis assemble les indicateurs. Singleton Prisma pour préserver le pool de connexions.

### 2. Domaine métier
- `metrics.ts` — utilisation, disponibilité, facturation, capacité réelle, heures assignées/réalisées/restantes ; pour les projets : consommé, EAC, écarts, coûts, rentabilité.
- `thresholds.ts` — bandes de couleur et seuils d'alerte.
- `detections.ts` — drapeaux de risque (surcharge, sous-utilisation, dépassement, retard, sous-estimation, manque de ressources) + score de risque projet.
- `capacity.ts` — matrice hebdomadaire et prévisions 4/8/12 semaines.
- `recommendations.ts` — moteur de règles répondant aux questions clés et générant des recommandations priorisées.
- `dates.ts` — calculs de semaines (UTC, ancrées au lundi) et jours ouvrables.

### 3. Présentation — `src/app/**`, `src/components/**`
Route group `(app)` protégé (garde de session) avec coquille (sidebar/topbar) ; route group `(auth)` pour la connexion. Composants UI ShadCN dans `components/ui`, composants métier partagés dans `components/shared`, graphiques dans `components/charts`.

### 4. Authentification — `src/auth.ts`, `src/lib/actions.ts`
NextAuth v5, stratégie **JWT**, provider **Credentials** validé contre la table `User` (mots de passe hachés avec bcrypt). La protection des routes est assurée par le layout serveur `(app)/layout.tsx` (`auth()` + redirection).

### 5. API — `src/app/api/**`
- `/api/auth/[...nextauth]` — endpoints NextAuth.
- `/api/ai/query` — assistant (règles ou Claude).

## Modèle de calcul (résumé)

- **Capacité réelle** = capacité nominale − absences (jours ouvrables au prorata).
- **Utilisation %** = heures planifiées ÷ capacité réelle.
- **Disponibilité %** = capacité résiduelle ÷ capacité réelle.
- **EAC (heures)** = heures consommées ÷ (% avancement).
- **Écart échéancier** = % avancement − % temps écoulé.
- **Rentabilité projetée** = (honoraires − coût projeté) ÷ honoraires.

Voir [`DATA-MODEL.md`](DATA-MODEL.md) pour le détail des entités.

## Sécurité

- Mots de passe hachés (bcrypt), sessions JWT signées (`AUTH_SECRET`).
- Toutes les pages applicatives derrière une garde de session ; l'API IA vérifie la session.
- Aucune donnée sensible exposée au client (les calculs et requêtes restent serveur).

## Performance

- Données chargées en une fenêtre puis calculées en mémoire (≈ 20 employés, ~750 affectations : négligeable).
- Index Prisma sur les clés de filtrage (`weekStart`, `projectId`, `employeeId`, `status`).
- Pages `dynamic = "force-dynamic"` car les indicateurs dépendent de la date courante.
