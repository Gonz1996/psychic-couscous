"use client";
import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { saveTimesheet } from "@/lib/actions/timeentries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Row {
  projectId: string;
  label: string;
  hours: number;
  billable: boolean;
  planned: number;
}
interface Option {
  id: string;
  name: string;
}

export function TimesheetForm({
  employeeId,
  weekStart,
  initialRows,
  allProjects,
}: {
  employeeId: string;
  weekStart: string;
  initialRows: Row[];
  allProjects: Option[];
}) {
  const [state, action, pending] = useActionState(saveTimesheet, undefined);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [addId, setAddId] = useState("");

  const available = allProjects.filter((p) => !rows.some((r) => r.projectId === p.id));
  const total = rows.reduce((s, r) => s + (Number(r.hours) || 0), 0);

  const update = (pid: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.projectId === pid ? { ...r, ...patch } : r)));
  const addRow = () => {
    const p = allProjects.find((x) => x.id === addId);
    if (p) {
      setRows((rs) => [...rs, { projectId: p.id, label: p.name, hours: 0, billable: true, planned: 0 }]);
      setAddId("");
    }
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="weekStart" value={weekStart} />
      <input type="hidden" name="projectIds" value={rows.map((r) => r.projectId).join(",")} />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun projet pour cette semaine. Ajoutez-en un ci-dessous.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead className="text-right">Planifié</TableHead>
              <TableHead className="w-28">Heures</TableHead>
              <TableHead className="w-24 text-center">Facturable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.projectId}>
                <TableCell className="font-medium">{r.label}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.planned ? `${r.planned} h` : "—"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    name={`hours_${r.projectId}`}
                    value={r.hours}
                    onChange={(e) => update(r.projectId, { hours: Number(e.target.value) })}
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    name={`billable_${r.projectId}`}
                    checked={r.billable}
                    onChange={(e) => update(r.projectId, { billable: e.target.checked })}
                    className="size-4 accent-primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {available.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">— Ajouter un projet —</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={addRow} disabled={!addId}>
            <Plus className="size-4" /> Ajouter
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Enregistrer la semaine
        </Button>
        <span className="text-sm text-muted-foreground">
          Total : <strong className="tabular-nums text-foreground">{total} h</strong>
        </span>
        {state?.ok && <span className="text-sm text-emerald-600">Enregistré.</span>}
        {state?.error && <span className="text-sm text-destructive">{state.error}</span>}
      </div>
    </form>
  );
}
