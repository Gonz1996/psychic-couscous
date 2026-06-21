# Plan des écrans

| Écran | Route | Accès | Contenu |
|---|---|---|---|
| Connexion | `/login` | Public | Formulaire courriel/mot de passe (NextAuth). |
| Tableau de bord exécutif | `/dashboard` | Protégé | 8 KPIs + 4 graphiques + liste des projets critiques. |
| Employés | `/employes` | Protégé | Tableau filtrable (recherche, discipline) avec indicateurs couleur d'utilisation, disponibilité et facturation. |
| Fiche employé | `/employes/[id]` | Protégé | Profil, 6 indicateurs clés, charge prévisionnelle 12 sem., projets affectés, absences. |
| Projets | `/projets` | Protégé | Tableau filtrable (statut, recherche) : avancement, budget, écart échéancier, marge, drapeaux de risque. |
| Fiche projet | `/projets/[id]` | Protégé | KPIs (EAC, écarts, marge), suivi budget/échéancier, rentabilité, équipe affectée. |
| Capacité | `/capacite` | Protégé | Prévisions 4/8/12 sem., heatmap de charge 12 sem., simulateur d'affectation + rééquilibrages suggérés. |
| Assistant IA | `/ia` | Protégé | Chat Q&R (règles ou Claude) + recommandations prioritaires. |
| Alertes | `/alertes` | Protégé | Alertes groupées par sévérité (critique / avertissement / info). |
| Rapports | `/rapports` | Protégé | Rapport exécutif imprimable (PDF) : synthèse, charge par discipline, surcharges, projets à risque, recommandations. |

## Navigation

Coquille applicative commune (`src/components/layout/shell.tsx`) :
- **Barre latérale** (desktop) / **tiroir** (mobile) : Tableau de bord, Employés, Projets, Capacité, Alertes, Assistant IA, Rapports.
- **Barre supérieure** : titre de la page, utilisateur connecté, déconnexion.

## Codes couleur d'utilisation (transversaux)

| Bande | Plage | Signification |
|---|---|---|
| 🟢 Vert | 0–85 % | Capacité disponible |
| 🟡 Jaune | 85–100 % | Charge optimale |
| 🟠 Orange | 100–110 % | En surcharge |
| 🔴 Rouge | > 110 % | Surcharge critique |
