"use client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
}

export function TimesheetSelector({
  employees,
  employeeId,
  week,
}: {
  employees: Option[];
  employeeId: string;
  week: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label>Employé</Label>
        <select
          value={employeeId}
          onChange={(e) => router.push(`/saisie?emp=${e.target.value}&week=${week}`)}
          className="h-9 w-64 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {employees.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wk">Semaine (choisir un jour)</Label>
        <Input
          id="wk"
          type="date"
          value={week}
          onChange={(e) => e.target.value && router.push(`/saisie?emp=${employeeId}&week=${e.target.value}`)}
          className="w-44"
        />
      </div>
    </div>
  );
}
