# Architecture d'intégrations (futures)

Le système est conçu pour s'intégrer à l'écosystème d'une firme MEP. Toutes les intégrations passent par une **couche d'adaptateurs** isolée (`src/lib/integrations/*`, à venir) : chaque service externe expose un adaptateur qui normalise ses données vers le modèle interne (employés, projets, heures), de sorte que le domaine métier reste agnostique de la source.

```
Services externes ──► Adaptateurs (normalisation) ──► Jobs de synchronisation ──► PostgreSQL ──► Domaine métier
```

Principes : synchronisation planifiée (cron) + webhooks quand disponibles ; mapping d'identifiants externes conservé sur chaque entité (`externalId`, `source`) ; secrets via variables d'environnement / coffre.

## QuickBooks (comptabilité)

- **But** : heures facturables réelles, honoraires facturés, coûts, rentabilité réelle par projet.
- **Moyen** : API QuickBooks Online (OAuth 2.0). Synchroniser clients, projets (sub-customers), factures et feuilles de temps.
- **Impact** : remplace/complète `TimeEntry` et alimente la rentabilité réelle (vs projetée).

## Microsoft 365 / Outlook

- **But** : absences, vacances et disponibilités depuis les calendriers ; authentification SSO.
- **Moyen** : Microsoft Graph API (OAuth 2.0). Lire les événements « hors bureau », synchroniser vers `Absence`. SSO via Entra ID (Azure AD) comme provider NextAuth additionnel.

## Microsoft Teams

- **But** : pousser les alertes critiques et permettre d'interroger l'assistant IA depuis Teams.
- **Moyen** : Teams Incoming Webhooks (alertes) et/ou bot (Bot Framework) relayant vers `/api/ai/query`.

## Excel

- **But** : import initial des données et export des rapports.
- **Moyen** : import/export `.xlsx` (SheetJS) — affectations, budgets, employés. Utile pour la reprise de données existantes.

## Power BI

- **But** : analytique avancée et tableaux de bord direction.
- **Moyen** : exposer une vue/jeu de données en lecture seule (endpoint sécurisé ou connexion directe PostgreSQL via passerelle) consommé par Power BI.

## Modèle de données — préparations

Pour accueillir ces intégrations sans rupture :

- Ajouter `externalId` + `source` (enum) sur `Employee`, `Project`, `Client`, `TimeEntry`.
- Table `SyncLog` (service, statut, horodatage, erreurs) pour la traçabilité.
- Table `IntegrationConfig` (jetons OAuth chiffrés, paramètres par service).
