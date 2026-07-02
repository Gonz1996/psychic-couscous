import { EFFECT_POINTS } from "./systems";
import { SCENARIOS } from "./scenarios";
import type { EffectPoint, MatrixResult, MatrixRow, ProjectConfig, Scenario, ScenarioEffect } from "./types";

/**
 * Vérifie l'intégrité référentielle du catalogue : tout effectId cité par
 * un scénario doit exister dans le catalogue de points de contrôle. Cette
 * vérification tourne à chaque génération (coût négligible) pour éviter
 * qu'une faute de frappe silencieuse dans un identifiant ne produise une
 * matrice incomplète sans avertissement — un outil réutilisé sur plusieurs
 * projets doit échouer bruyamment plutôt que produire un livrable erroné.
 */
export function validateCatalog(): void {
  const knownIds = new Set(EFFECT_POINTS.map((p) => p.id));
  const errors: string[] = [];

  for (const scenario of SCENARIOS) {
    for (const effect of scenario.effects) {
      if (!knownIds.has(effect.effectId)) {
        errors.push(`Scénario ${scenario.id} (${scenario.label}) référence le point de contrôle inconnu "${effect.effectId}".`);
      }
    }
  }

  const duplicateEffectIds = findDuplicates(EFFECT_POINTS.map((p) => p.id));
  if (duplicateEffectIds.length > 0) {
    errors.push(`Identifiants de points de contrôle dupliqués dans le catalogue: ${duplicateEffectIds.join(", ")}`);
  }
  const duplicateScenarioIds = findDuplicates(SCENARIOS.map((s) => s.id));
  if (duplicateScenarioIds.length > 0) {
    errors.push(`Identifiants de scénarios dupliqués dans le catalogue: ${duplicateScenarioIds.join(", ")}`);
  }

  if (errors.length > 0) {
    throw new Error(`Intégrité du catalogue causes-effets compromise:\n- ${errors.join("\n- ")}`);
  }
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

/**
 * Génère la matrice causes-effets applicable à un projet donné : filtre le
 * catalogue complet selon les paramètres de configuration (colonnes et
 * lignes non pertinentes retirées), sans jamais modifier le contenu
 * technique des entrées retenues.
 */
export function generateCauseEffectMatrix(config: ProjectConfig): MatrixResult {
  validateCatalog();

  const effects: EffectPoint[] = EFFECT_POINTS.filter((p) => !p.appliesIf || p.appliesIf(config));
  const effectIds = new Set(effects.map((e) => e.id));

  const scenarios: Scenario[] = SCENARIOS.filter((s) => !s.appliesIf || s.appliesIf(config));

  const rows: MatrixRow[] = scenarios.map((scenario) => {
    const cells = new Map<string, ScenarioEffect | undefined>();
    for (const effect of scenario.effects) {
      if (!effectIds.has(effect.effectId)) continue; // colonne retirée pour ce projet
      if (effect.appliesIf && !effect.appliesIf(config)) continue;
      cells.set(effect.effectId, effect);
    }
    return { scenario, cells };
  });

  return {
    config,
    generatedAt: new Date().toISOString(),
    effects,
    scenarios,
    rows,
  };
}
