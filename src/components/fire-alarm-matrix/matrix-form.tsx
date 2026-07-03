"use client";
import { useActionState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { generateMatrixAction, type MatrixFormState } from "@/lib/actions/fire-alarm-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const initialState: MatrixFormState = { status: "idle" };

const EQUIPMENT_FIELDS: { name: string; label: string; defaultChecked?: boolean }[] = [
  { name: "isHighBuilding", label: "Bâtiment de grande hauteur (>36 m, art. 3.2.6 CNB)", defaultChecked: true },
  { name: "hasUndergroundParking", label: "Garage souterrain" },
  { name: "hasFirefightersElevator", label: "Ascenseur pompier dédié" },
  { name: "hasElectromagneticAccessControlDoors", label: "Contrôle d'accès électromagnétique" },
  { name: "hasVoiceCommunication", label: "Communication vocale", defaultChecked: true },
  { name: "hasStandbyGenerator", label: "Génératrice de secours", defaultChecked: true },
  { name: "hasFirePump", label: "Pompe incendie", defaultChecked: true },
  { name: "hasJockeyPump", label: "Pompe d'appoint (jockey)" },
  { name: "hasWetSprinklerThroughout", label: "Gicleurs partout", defaultChecked: true },
  { name: "hasDuctSmokeDetectors", label: "Détecteurs de fumée en gaine" },
  { name: "suiteSmokeAlarmsReportToFacp", label: "Avertisseurs de logement raccordés au réseau central" },
  { name: "hasStairReentry", label: "Réentrée aux cages d'escalier" },
  { name: "hasFireDeptRadioSystem", label: "Système radio pompier (DAS)" },
  { name: "hasEmergencyIntercomInStairs", label: "Interphonie d'urgence en cage d'escalier" },
  { name: "hasNaturalGasShutoff", label: "Vanne d'arrêt automatique du gaz naturel" },
  { name: "hasCommercialKitchenHood", label: "Cuisine commerciale (hotte + extinction dédiée)" },
  { name: "hasCctv", label: "Vidéosurveillance (CCTV) au poste de sécurité", defaultChecked: true },
];

export function FireAlarmMatrixForm() {
  const [state, formAction, pending] = useActionState(generateMatrixAction, initialState);
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-6">
            {state.status === "error" && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p>
            )}

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Identification du projet</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du projet" name="projectName" error={err.projectName} required />
                <Field label="Numéro de projet" name="projectNumber" />
                <Field label="Adresse" name="address" />
                <Field label="Préparé par" name="preparedBy" />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Configuration structurale</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Nombre de cages d'escalier"
                  name="numberOfExitStairs"
                  defaultValue="2"
                  options={[
                    { id: "1", name: "1" },
                    { id: "2", name: "2" },
                    { id: "3", name: "3" },
                    { id: "4", name: "4" },
                  ]}
                  error={err.numberOfExitStairs}
                />
                <SelectField
                  label="Approche de désenfumage"
                  name="smokeControlApproach"
                  defaultValue="extraction-etage-sinistre"
                  options={[
                    { id: "extraction-etage-sinistre", name: "Extraction à l'étage sinistré" },
                    { id: "pressurisation-cages-seulement", name: "Pressurisation des cages seulement" },
                    { id: "compartimentation", name: "Compartimentation" },
                  ]}
                  error={err.smokeControlApproach}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Équipements et caractéristiques</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {EQUIPMENT_FIELDS.map((f) => (
                  <CheckboxField key={f.name} name={f.name} label={f.label} defaultChecked={f.defaultChecked} />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Notes</legend>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes complémentaires (optionnel)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </fieldset>

            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Générer la matrice
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.status === "success" && <MatrixResult result={state.result} />}
    </div>
  );
}

function MatrixResult({ result }: { result: Extract<MatrixFormState, { status: "success" }>["result"] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{result.projectName}</CardTitle>
            <CardDescription>
              {result.scenarioCount} scénarios × {result.effectCount} points de contrôle · généré le{" "}
              {new Date(result.generatedAt).toLocaleString("fr-CA")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DownloadButton
              label="Télécharger Excel (.xlsx)"
              icon={FileSpreadsheet}
              filename={`${result.fileSlug}.xlsx`}
              content={result.xlsxBase64}
              encoding="base64"
              mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              variant="default"
            />
            <DownloadButton
              label="CSV"
              icon={Download}
              filename={`${result.fileSlug}.csv`}
              content={result.csv}
              mimeType="text/csv;charset=utf-8"
            />
            <DownloadButton
              label="Markdown"
              icon={FileText}
              filename={`${result.fileSlug}.md`}
              content={result.markdown}
              mimeType="text/markdown;charset=utf-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Scénario</TableHead>
              {result.effects.map((e) => (
                <TableHead key={e.id} title={`${e.system} — ${e.point}`}>
                  {e.id}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="sticky left-0 bg-card font-medium" title={row.initiatingDevice}>
                  {row.id} — {row.label}
                </TableCell>
                {row.cells.map((cell, i) => (
                  <TableCell key={result.effects[i].id} className="text-xs whitespace-nowrap">
                    {cell ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={name} name={name} defaultValue={defaultValue} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { id: string; name: string }[];
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={name} className="flex items-center gap-2 text-sm">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 rounded border-input accent-primary"
      />
      {label}
    </label>
  );
}

function DownloadButton({
  label,
  icon: Icon,
  filename,
  content,
  mimeType,
  encoding = "text",
  variant = "outline",
}: {
  label: string;
  icon: typeof Download;
  filename: string;
  content: string;
  mimeType: string;
  encoding?: "text" | "base64";
  variant?: "default" | "outline";
}) {
  function handleDownload() {
    const blob =
      encoding === "base64"
        ? new Blob([Uint8Array.from(atob(content), (c) => c.charCodeAt(0))], { type: mimeType })
        : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={handleDownload}>
      <Icon className="size-4" />
      {label}
    </Button>
  );
}
