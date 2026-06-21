# Modèle de données

PostgreSQL via Prisma. Schéma complet : [`prisma/schema.prisma`](../prisma/schema.prisma).

## Diagramme entités-relations

```mermaid
erDiagram
    Office ||--o{ Employee : "regroupe"
    Discipline ||--o{ Employee : "classe"
    Discipline ||--o{ Project : "classe"
    Client ||--o{ Project : "commande"
    Employee ||--o{ Employee : "gère (manager)"
    Employee ||--o{ Project : "dirige (CP)"
    Employee ||--o{ Allocation : "est affecté"
    Employee ||--o{ TimeEntry : "saisit"
    Employee ||--o{ Absence : "prend"
    Project ||--o{ Allocation : "reçoit"
    Project ||--o{ TimeEntry : "consomme"
    Employee ||--o| User : "se connecte"

    Office {
      string id PK
      string name
      string city
      string province
    }
    Discipline {
      string id PK
      string name
      string code
      string color
    }
    Employee {
      string id PK
      string employeeNo
      string firstName
      string lastName
      string email
      string title
      enum   status
      float  weeklyCapacityHours
      int    billableTargetPct
      float  costRate
      float  billRate
      string disciplineId FK
      string officeId FK
      string managerId FK
    }
    Client {
      string id PK
      string name
      string code
      string sector
    }
    Project {
      string id PK
      string number
      string name
      enum   status
      float  budgetHours
      float  budgetFees
      int    percentComplete
      date   startDate
      date   endDate
      string clientId FK
      string disciplineId FK
      string projectManagerId FK
    }
    Allocation {
      string id PK
      string employeeId FK
      string projectId FK
      date   weekStart
      float  hours
    }
    TimeEntry {
      string id PK
      string employeeId FK
      string projectId FK
      date   weekStart
      float  hours
      bool   billable
    }
    Absence {
      string id PK
      string employeeId FK
      enum   type
      date   startDate
      date   endDate
      float  hours
    }
    User {
      string id PK
      string email
      string passwordHash
      enum   role
      string employeeId FK
    }
```

## Entités

| Entité | Rôle |
|---|---|
| **Office** | Bureaux (Montréal, Québec, Gatineau). |
| **Discipline** | Électricité, Mécanique/CVAC, Plomberie, Protection incendie, Contrôles. Porte une couleur pour les graphiques. |
| **Employee** | Membre de l'équipe : poste, discipline, bureau, gestionnaire, capacité hebdomadaire, cible de facturation, taux coût/facturable. |
| **Client** | Donneur d'ouvrage. |
| **Project** | Mandat : budget heures/honoraires, avancement, échéancier, chargé de projet, discipline. |
| **Allocation** | Heures **planifiées** par employé / projet / semaine (le « prévu »). |
| **TimeEntry** | Heures **réalisées** par employé / projet / semaine (le « réel »), facturables ou non. |
| **Absence** | Vacances, congés, formation — réduisent la disponibilité réelle. |
| **User** | Compte de connexion (NextAuth), lié optionnellement à un employé. |

## Choix de modélisation

- **Prévu vs réel séparés** (`Allocation` vs `TimeEntry`) : permet de comparer planification et exécution (utilisation prévue, % réalisé, dérives).
- **Granularité hebdomadaire** (`weekStart` = lundi UTC) : suffisante pour la planification de capacité, volume de données maîtrisé.
- **Montants en `Float`** pour le MVP ; migrer vers `Decimal` en production pour une précision comptable.
- **Énumérations** (`ProjectStatus`, `AbsenceType`, `EmployeeStatus`, `UserRole`) pour l'intégrité des statuts.
