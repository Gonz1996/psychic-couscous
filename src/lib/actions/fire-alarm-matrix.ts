"use server";
import { z } from "zod";
import {
  generateCauseEffectMatrix,
  projectConfigSchema,
  slugify,
  toCsv,
  toMarkdown,
  toXlsxBuffer,
  type ProjectConfig,
} from "@/lib/fire-alarm-matrix";

export interface MatrixEffectColumn {
  id: string;
  category: string;
  system: string;
  point: string;
}

export interface MatrixRowView {
  id: string;
  label: string;
  category: string;
  initiatingDevice: string;
  cells: (string | null)[]; // aligné sur MatrixEffectColumn[], même index
}

export interface MatrixViewModel {
  projectName: string;
  generatedAt: string;
  fileSlug: string;
  scenarioCount: number;
  effectCount: number;
  effects: MatrixEffectColumn[];
  rows: MatrixRowView[];
  csv: string;
  markdown: string;
  /** Classeur .xlsx encodé en base64 — décodé côté client pour le téléchargement. */
  xlsxBase64: string;
}

export type MatrixFormState =
  | { status: "idle" }
  | { status: "error"; error: string; fieldErrors?: Record<string, string> }
  | { status: "success"; result: MatrixViewModel };

const BOOLEAN_FIELDS = [
  "isHighBuilding",
  "hasUndergroundParking",
  "hasFirefightersElevator",
  "hasElectromagneticAccessControlDoors",
  "hasVoiceCommunication",
  "hasStandbyGenerator",
  "hasFirePump",
  "hasJockeyPump",
  "hasWetSprinklerThroughout",
  "hasDuctSmokeDetectors",
  "suiteSmokeAlarmsReportToFacp",
  "hasStairReentry",
  "hasFireDeptRadioSystem",
  "hasEmergencyIntercomInStairs",
] as const satisfies readonly (keyof ProjectConfig)[];

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function generateMatrixAction(_prev: MatrixFormState, formData: FormData): Promise<MatrixFormState> {
  const raw: Record<string, unknown> = {
    projectName: formData.get("projectName"),
    projectNumber: optionalText(formData.get("projectNumber")),
    address: optionalText(formData.get("address")),
    preparedBy: optionalText(formData.get("preparedBy")),
    numberOfExitStairs: Number(formData.get("numberOfExitStairs")),
    smokeControlApproach: formData.get("smokeControlApproach"),
    notes: optionalText(formData.get("notes")),
  };
  // Les cases à cocher non cochées sont absentes de FormData : traduire explicitement en booléen.
  for (const field of BOOLEAN_FIELDS) {
    raw[field] = formData.get(field) === "on";
  }

  const parsed = projectConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: "Veuillez corriger les champs indiqués.", fieldErrors: fieldErrors(parsed.error) };
  }

  const config = parsed.data;
  const matrix = generateCauseEffectMatrix(config);

  const effects: MatrixEffectColumn[] = matrix.effects.map((e) => ({
    id: e.id,
    category: e.category,
    system: e.system,
    point: e.point,
  }));

  const rows: MatrixRowView[] = matrix.rows.map((row) => ({
    id: row.scenario.id,
    label: row.scenario.label,
    category: row.scenario.category,
    initiatingDevice: row.scenario.initiatingDevice,
    cells: matrix.effects.map((e) => row.cells.get(e.id)?.state ?? null),
  }));

  const xlsxBuffer = await toXlsxBuffer(matrix);

  return {
    status: "success",
    result: {
      projectName: config.projectName,
      generatedAt: matrix.generatedAt,
      fileSlug: slugify(config.projectName || "projet"),
      scenarioCount: matrix.scenarios.length,
      effectCount: matrix.effects.length,
      effects,
      rows,
      csv: toCsv(matrix),
      markdown: toMarkdown(matrix),
      xlsxBase64: xlsxBuffer.toString("base64"),
    },
  };
}
