// =====================================================================
// Courbes de répartition temporelle — étale un total d'heures sur N
// semaines selon un profil de charge. Fonctions PURES.
//   • uniform : charge constante
//   • front   : avant-projet (front-loaded), décroissante
//   • back    : arrière-projet (back-loaded), croissante
// =====================================================================

export type LoadCurve = "uniform" | "front" | "back";

export const CURVE_LABELS: Record<LoadCurve, string> = {
  uniform: "Uniforme",
  front: "Avant-projet (front-loaded)",
  back: "Arrière-projet (back-loaded)",
};

/** Poids normalisés (somme = 1) pour `n` semaines selon la courbe. */
export function curveWeights(n: number, curve: LoadCurve): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    if (curve === "front") raw.push(n - i); // décroissant
    else if (curve === "back") raw.push(i + 1); // croissant
    else raw.push(1); // uniforme
  }
  const sum = raw.reduce((s, x) => s + x, 0);
  return raw.map((x) => x / sum);
}

/**
 * Répartit `total` heures sur `n` semaines selon la courbe, arrondi à 2
 * décimales, le reliquat d'arrondi étant placé sur la dernière semaine non
 * nulle pour que la somme reste exacte.
 */
export function distributeHours(total: number, n: number, curve: LoadCurve): number[] {
  const weights = curveWeights(n, curve);
  const round2 = (x: number) => Math.round(x * 100) / 100;
  const hours = weights.map((w) => round2(total * w));
  const diff = round2(total - hours.reduce((s, x) => s + x, 0));
  if (Math.abs(diff) >= 0.01) {
    for (let i = hours.length - 1; i >= 0; i--) {
      if (hours[i] > 0 || diff > 0) {
        hours[i] = round2(hours[i] + diff);
        break;
      }
    }
  }
  return hours;
}
