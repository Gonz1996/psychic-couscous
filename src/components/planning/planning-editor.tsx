"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { computePlan, type FinancialParams } from "@/lib/finance";
import { saveProjectPlan, type PlanPayload } from "@/lib/actions/planning";
import { fmtCurrency, fmtHours } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DiscOption { id: string; name: string }
interface Emp { id: string; name: string; disciplineId: string; costRate: number; productivityFactor: number }
interface Initial {
  feeDesign: number;
  feeSupervision: number;
  targetProfitPct: number;
  overheadPct: number;
  riskReservePct: number;
  directorId: string | null;
  disciplines: { disciplineId: string; effortPct: number }[];
  staffing: { disciplineId: string; employeeId: string; effortPct: number }[];
}

const SELECT = "h-9 rounded-md border border-input bg-transparent px-2 text-sm";

export function PlanningEditor({
  projectId,
  initial,
  disciplines,
  employees,
}: {
  projectId: string;
  initial: Initial;
  disciplines: DiscOption[];
  employees: Emp[];
}) {
  const router = useRouter();
  const [feeDesign, setFeeDesign] = React.useState(initial.feeDesign);
  const [feeSupervision, setFeeSupervision] = React.useState(initial.feeSupervision);
  const [profit, setProfit] = React.useState(initial.targetProfitPct);
  const [overhead, setOverhead] = React.useState(initial.overheadPct);
  const [risk, setRisk] = React.useState(initial.riskReservePct);
  const [directorId, setDirectorId] = React.useState(initial.directorId ?? "");
  const [discs, setDiscs] = React.useState(initial.disciplines);
  const [staff, setStaff] = React.useState(initial.staffing);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const discName = (id: string) => disciplines.find((d) => d.id === id)?.name ?? id;
  const fees = (feeDesign || 0) + (feeSupervision || 0);
  const params: FinancialParams = { targetProfitPct: profit, overheadPct: overhead, riskReservePct: risk };
  const plan = computePlan(
    fees,
    params,
    discs,
    staff,
    employees.map((e) => ({ id: e.id, loadedRate: e.costRate, productivity: e.productivityFactor })),
  );

  const usedDisc = new Set(discs.map((d) => d.disciplineId));
  const availDisc = disciplines.filter((d) => !usedDisc.has(d.id));

  const addDiscipline = () => availDisc.length && setDiscs((p) => [...p, { disciplineId: availDisc[0].id, effortPct: 0 }]);
  const setDiscPct = (id: string, pct: number) =>
    setDiscs((p) => p.map((d) => (d.disciplineId === id ? { ...d, effortPct: pct } : d)));
  const changeDiscId = (oldId: string, newId: string) => {
    setDiscs((p) => p.map((d) => (d.disciplineId === oldId ? { ...d, disciplineId: newId } : d)));
    setStaff((p) => p.map((s) => (s.disciplineId === oldId ? { ...s, disciplineId: newId } : s)));
  };
  const removeDiscipline = (id: string) => {
    setDiscs((p) => p.filter((d) => d.disciplineId !== id));
    setStaff((p) => p.filter((s) => s.disciplineId !== id));
  };
  const addStaff = (discId: string) => {
    const usedEmp = new Set(staff.filter((s) => s.disciplineId === discId).map((s) => s.employeeId));
    const cand =
      employees.find((e) => e.disciplineId === discId && !usedEmp.has(e.id)) ??
      employees.find((e) => !usedEmp.has(e.id));
    if (cand) setStaff((p) => [...p, { disciplineId: discId, employeeId: cand.id, effortPct: 0 }]);
  };
  const setStaffPct = (discId: string, empId: string, pct: number) =>
    setStaff((p) => p.map((s) => (s.disciplineId === discId && s.employeeId === empId ? { ...s, effortPct: pct } : s)));
  const changeStaffEmp = (discId: string, oldEmp: string, newEmp: string) =>
    setStaff((p) => p.map((s) => (s.disciplineId === discId && s.employeeId === oldEmp ? { ...s, employeeId: newEmp } : s)));
  const removeStaff = (discId: string, empId: string) =>
    setStaff((p) => p.filter((s) => !(s.disciplineId === discId && s.employeeId === empId)));

  async function save() {
    setSaving(true);
    setMsg(null);
    const payload: PlanPayload = {
      feeDesign: feeDesign || 0,
      feeSupervision: feeSupervision || 0,
      targetProfitPct: profit,
      overheadPct: overhead,
      riskReservePct: risk,
      directorId: directorId || null,
      disciplines: discs,
      staffing: staff,
    };
    const res = await saveProjectPlan(projectId, payload);
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Plan enregistré ✓" });
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error ?? "Erreur." });
    }
  }

  return (
    <div className="space-y-4">
      {/* Honoraires & paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Honoraires &amp; paramètres financiers</CardTitle>
          <CardDescription>Le budget de production est le seul montant converti en heures.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <NumField label="Honoraires conception ($)" value={feeDesign} onChange={setFeeDesign} />
            <NumField label="Honoraires surveillance ($)" value={feeSupervision} onChange={setFeeSupervision} />
            <div className="space-y-1.5">
              <Label>Directeur</Label>
              <select value={directorId} onChange={(e) => setDirectorId(e.target.value)} className={cn(SELECT, "w-full")}>
                <option value="">— Aucun —</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumField label="Profit cible (%)" value={profit} onChange={setProfit} />
            <NumField label="Frais généraux (%)" value={overhead} onChange={setOverhead} />
            <NumField label="Réserve de risque (%)" value={risk} onChange={setRisk} />
          </div>
          <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-5">
            <Stat label="Honoraires totaux" value={fmtCurrency(fees)} />
            <Stat label={`− Profit ${profit}%`} value={fmtCurrency(plan.reserved.profit)} />
            <Stat label={`− Frais ${overhead}%`} value={fmtCurrency(plan.reserved.overhead)} />
            <Stat label={`− Réserve ${risk}%`} value={fmtCurrency(plan.reserved.risk)} />
            <Stat label="= Budget production" value={fmtCurrency(plan.productionBudget)} strong />
          </div>
        </CardContent>
      </Card>

      {/* Répartition par discipline */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle>Répartition par discipline</CardTitle>
            <CardDescription>La somme des % doit faire 100 %.</CardDescription>
          </div>
          <PctBadge sum={plan.disciplineSumPct} />
        </CardHeader>
        <CardContent className="space-y-2">
          {discs.length === 0 && <p className="text-sm text-muted-foreground">Aucune discipline. Ajoutez-en une.</p>}
          {discs.map((d) => {
            const cd = plan.disciplines.find((x) => x.disciplineId === d.disciplineId);
            return (
              <div key={d.disciplineId} className="flex items-center gap-2">
                <select value={d.disciplineId} onChange={(e) => changeDiscId(d.disciplineId, e.target.value)} className={cn(SELECT, "flex-1")}>
                  {disciplines.filter((o) => o.id === d.disciplineId || !usedDisc.has(o.id)).map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <Input type="number" className="w-20" value={d.effortPct} onChange={(e) => setDiscPct(d.disciplineId, Number(e.target.value) || 0)} />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="w-32 text-right text-sm tabular-nums">{fmtCurrency(cd?.budget ?? 0)}</span>
                <Button variant="ghost" size="icon" onClick={() => removeDiscipline(d.disciplineId)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
          {availDisc.length > 0 && (
            <Button variant="outline" size="sm" onClick={addDiscipline}>
              <Plus className="size-4" /> Ajouter une discipline
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Répartition par employé, par discipline */}
      {discs.map((d) => {
        const cd = plan.disciplines.find((x) => x.disciplineId === d.disciplineId);
        const rows = staff.filter((s) => s.disciplineId === d.disciplineId);
        return (
          <Card key={d.disciplineId}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">Équipe — {discName(d.disciplineId)}</CardTitle>
                <CardDescription>Budget discipline : {fmtCurrency(cd?.budget ?? 0)}</CardDescription>
              </div>
              <PctBadge sum={cd?.staffingSumPct ?? 0} />
            </CardHeader>
            <CardContent>
              {rows.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead className="w-20">% effort</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">H prévues</TableHead>
                      <TableHead className="text-right">H ajustées</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((s) => {
                      const cs = cd?.staffing.find((x) => x.employeeId === s.employeeId);
                      const usedEmp = new Set(rows.filter((r) => r !== s).map((r) => r.employeeId));
                      return (
                        <TableRow key={s.employeeId}>
                          <TableCell>
                            <select value={s.employeeId} onChange={(e) => changeStaffEmp(d.disciplineId, s.employeeId, e.target.value)} className={cn(SELECT, "w-full")}>
                              {employees.filter((o) => o.id === s.employeeId || !usedEmp.has(o.id)).map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" className="h-8 w-16" value={s.effortPct} onChange={(e) => setStaffPct(d.disciplineId, s.employeeId, Number(e.target.value) || 0)} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{fmtCurrency(cs?.budget ?? 0)}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtHours(cs?.plannedHours ?? 0)}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{fmtHours(cs?.adjustedHours ?? 0)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeStaff(d.disciplineId, s.employeeId)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              <Button variant="outline" size="sm" className="mt-3" onClick={() => addStaff(d.disciplineId)}>
                <Plus className="size-4" /> Ajouter un employé
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Totaux + sauvegarde */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 pt-6">
          <Stat label="Heures prévues (total)" value={fmtHours(plan.totalPlannedHours)} />
          <Stat label="Heures ajustées (total)" value={fmtHours(plan.totalAdjustedHours)} strong />
          <Stat label="Budget réparti" value={fmtCurrency(plan.totalBudgetUsed)} />
          <div className="ml-auto flex items-center gap-3">
            {!plan.valid && <span className="text-xs text-amber-600">⚠ Les répartitions devraient totaliser 100 %.</span>}
            {msg && <span className={cn("text-sm", msg.ok ? "text-emerald-600" : "text-destructive")}>{msg.text}</span>}
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Enregistrer le plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("tabular-nums", strong ? "text-lg font-bold" : "font-medium")}>{value}</div>
    </div>
  );
}

function PctBadge({ sum }: { sum: number }) {
  const ok = Math.abs(sum - 100) < 0.5;
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
        ok ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800",
      )}
    >
      Σ {Math.round(sum)} %
    </span>
  );
}
