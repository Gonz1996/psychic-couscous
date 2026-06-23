"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/lib/actions/projects";
import { Field, SelectField, type Option } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS: Option[] = [
  { id: "PLANNING", name: "En planification" },
  { id: "ACTIVE", name: "En cours" },
  { id: "ON_HOLD", name: "En attente" },
  { id: "COMPLETED", name: "Terminé" },
  { id: "CANCELLED", name: "Annulé" },
];

type Defaults = Partial<Record<string, string>>;

export function ProjectForm({
  action,
  clients,
  disciplines,
  managers,
  defaults,
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  clients: Option[];
  disciplines: Option[];
  managers: Option[];
  defaults?: Defaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const d = defaults ?? {};
  const err = state?.fieldErrors ?? {};

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Numéro" name="number" defaultValue={d.number} error={err.number} required />
            <Field label="Nom" name="name" defaultValue={d.name} error={err.name} required />
            <SelectField label="Client" name="clientId" defaultValue={d.clientId} options={clients} error={err.clientId} />
            <SelectField label="Discipline" name="disciplineId" defaultValue={d.disciplineId} options={disciplines} error={err.disciplineId} />
            <SelectField label="Chargé de projet" name="projectManagerId" defaultValue={d.projectManagerId} options={managers} error={err.projectManagerId} />
            <SelectField label="Statut" name="status" defaultValue={d.status ?? "ACTIVE"} options={STATUS} />
            <Field label="Budget heures" name="budgetHours" type="number" step="1" defaultValue={d.budgetHours ?? "0"} />
            <Field label="Budget honoraires ($)" name="budgetFees" type="number" step="1" defaultValue={d.budgetFees ?? "0"} />
            <Field label="Avancement (%)" name="percentComplete" type="number" defaultValue={d.percentComplete ?? "0"} />
            <Field label="Date de début" name="startDate" type="date" defaultValue={d.startDate} error={err.startDate} required />
            <Field label="Date de fin" name="endDate" type="date" defaultValue={d.endDate} error={err.endDate} required />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Phase du projet</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="inConception" defaultChecked={d.inConception === "1"} className="size-4 rounded border-input" />
                En conception
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="inSurveillance" defaultChecked={d.inSurveillance === "1"} className="size-4 rounded border-input" />
                En surveillance
              </label>
            </div>
          </fieldset>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/projets">Annuler</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
