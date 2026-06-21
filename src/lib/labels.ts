// Libellés français pour les énumérations Prisma.

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "En planification",
  ACTIVE: "En cours",
  ON_HOLD: "En attente",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export const PROJECT_STATUS_BADGE: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-blue-100 text-blue-800 border-blue-200",
  ON_HOLD: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export const ABSENCE_TYPE_LABELS: Record<string, string> = {
  VACATION: "Vacances",
  SICK: "Congé maladie",
  TRAINING: "Formation",
  HOLIDAY: "Jour férié",
  PARENTAL: "Congé parental",
  OTHER: "Autre",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  VIEWER: "Lecture seule",
};

// Codes de détection (drapeaux de risque).
export const FLAG_LABELS: Record<string, string> = {
  OVERLOADED: "Surchargé",
  CRITICAL_OVERLOAD: "Surcharge critique",
  UNDERUTILIZED: "Sous-utilisé",
  AVAILABLE: "Disponible",
  OVER_BUDGET: "Dépassement budget",
  BEHIND_SCHEDULE: "Retard",
  UNDERESTIMATED: "Sous-estimation",
  RESOURCE_SHORTAGE: "Manque de ressources",
};
