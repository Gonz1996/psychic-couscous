// Seuils de couleur d'utilisation (indicateurs visuels).
//   VERT   : 0 à 85 %      → capacité disponible
//   JAUNE  : 85 à 100 %    → charge optimale
//   ORANGE : 100 à 110 %   → en surcharge
//   ROUGE  : > 110 %       → surcharge critique

export type RagBand = "green" | "yellow" | "orange" | "red";

export interface BandStyle {
  band: RagBand;
  label: string;
  /** Couleur hex pour les graphiques. */
  hex: string;
  /** Classes Tailwind pour les badges/pastilles. */
  badge: string;
  /** Classe de texte. */
  text: string;
  /** Classe de fond (barres, pastilles). */
  bg: string;
  /** Classe de remplissage de barre de progression. */
  bar: string;
}

export const BAND_STYLES: Record<RagBand, BandStyle> = {
  green: {
    band: "green",
    label: "Disponible",
    hex: "#16a34a",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  yellow: {
    band: "yellow",
    label: "Optimal",
    hex: "#ca8a04",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-500",
    bar: "bg-amber-500",
  },
  orange: {
    band: "orange",
    label: "Surcharge",
    hex: "#ea580c",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    text: "text-orange-600",
    bg: "bg-orange-500",
    bar: "bg-orange-500",
  },
  red: {
    band: "red",
    label: "Critique",
    hex: "#dc2626",
    badge: "bg-red-100 text-red-800 border-red-200",
    text: "text-red-600",
    bg: "bg-red-500",
    bar: "bg-red-500",
  },
};

/** Bande de couleur pour un % d'utilisation. */
export function utilizationBand(pct: number): RagBand {
  if (pct > 110) return "red";
  if (pct > 100) return "orange";
  if (pct >= 85) return "yellow";
  return "green";
}

export function utilizationStyle(pct: number): BandStyle {
  return BAND_STYLES[utilizationBand(pct)];
}

// Seuils métier réutilisés par les détections et le moteur IA.
export const THRESHOLDS = {
  /** Au-delà : employé surchargé. */
  OVERLOAD_PCT: 100,
  /** Au-delà : surcharge critique (rouge). */
  CRITICAL_PCT: 110,
  /** En deçà : employé sous-utilisé (peut recevoir des tâches). */
  UNDERUTILIZED_PCT: 70,
  /** Écart d'échéancier (en points de %) au-delà duquel un projet est « en retard ». */
  SCHEDULE_SLIP_PCT: 10,
  /** Dépassement projeté (EAC vs budget) au-delà duquel on alerte. */
  EAC_OVERRUN_PCT: 5,
  /** Sous-estimation : dépassement projeté important avant la fin. */
  UNDERESTIMATE_PCT: 10,
} as const;
