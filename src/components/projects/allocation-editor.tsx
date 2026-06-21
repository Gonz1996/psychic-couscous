"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { assignAllocation } from "@/lib/actions/allocations";
import { SelectField, type Option } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function currentMonday(): string {
  const d = new Date();
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = u.getUTCDay();
  u.setUTCDate(u.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return u.toISOString().slice(0, 10);
}

export function AllocationEditor({ projectId, employees }: { projectId: string; employees: Option[] }) {
  const [state, action, pending] = useActionState(assignAllocation.bind(null, projectId), undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-5 sm:items-end">
      <div className="sm:col-span-2">
        <SelectField label="Employé" name="employeeId" options={employees} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hoursPerWeek">Heures / sem.</Label>
        <Input id="hoursPerWeek" name="hoursPerWeek" type="number" step="0.5" defaultValue="8" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="startWeek">Semaine de début</Label>
        <Input id="startWeek" name="startWeek" type="date" defaultValue={currentMonday()} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="numWeeks">Nb semaines</Label>
        <Input id="numWeeks" name="numWeeks" type="number" defaultValue="4" />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-5">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Affecter
        </Button>
        <span className="text-xs text-muted-foreground">Mettre 0 h retire l&apos;affectation sur la période.</span>
        {state?.error && <span className="text-sm text-destructive">{state.error}</span>}
        {state?.ok && <span className="text-sm text-emerald-600">Affectation enregistrée.</span>}
      </div>
    </form>
  );
}
