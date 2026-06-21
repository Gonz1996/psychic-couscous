"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/lib/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Option {
  id: string;
  name: string;
}

type Defaults = Partial<Record<string, string>>;

export function EmployeeForm({
  action,
  disciplines,
  offices,
  managers,
  defaults,
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  disciplines: Option[];
  offices: Option[];
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
            <Field label="Prénom" name="firstName" defaultValue={d.firstName} error={err.firstName} required />
            <Field label="Nom" name="lastName" defaultValue={d.lastName} error={err.lastName} required />
            <Field label="Courriel" name="email" type="email" defaultValue={d.email} error={err.email} required />
            <Field label="Matricule" name="employeeNo" defaultValue={d.employeeNo} error={err.employeeNo} required />
            <Field label="Poste" name="title" defaultValue={d.title} error={err.title} required />
            <SelectField label="Discipline" name="disciplineId" defaultValue={d.disciplineId} options={disciplines} error={err.disciplineId} />
            <SelectField label="Bureau" name="officeId" defaultValue={d.officeId} options={offices} error={err.officeId} />
            <SelectField label="Gestionnaire" name="managerId" defaultValue={d.managerId} options={managers} optional />
            <Field label="Date d'embauche" name="hireDate" type="date" defaultValue={d.hireDate} error={err.hireDate} required />
            <Field label="Capacité hebdo (h)" name="weeklyCapacityHours" type="number" step="0.5" defaultValue={d.weeklyCapacityHours ?? "37.5"} />
            <Field label="Cible facturation (%)" name="billableTargetPct" type="number" defaultValue={d.billableTargetPct ?? "80"} />
            <Field label="Coût horaire ($)" name="costRate" type="number" step="0.01" defaultValue={d.costRate ?? "0"} />
            <Field label="Taux facturable ($)" name="billRate" type="number" step="0.01" defaultValue={d.billRate ?? "0"} />
            <SelectField
              label="Statut"
              name="status"
              defaultValue={d.status ?? "ACTIVE"}
              options={[
                { id: "ACTIVE", name: "Actif" },
                { id: "INACTIVE", name: "Inactif" },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/employes">Annuler</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue} />
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
  optional,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Option[];
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
      >
        {optional && <option value="">— Aucun —</option>}
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
