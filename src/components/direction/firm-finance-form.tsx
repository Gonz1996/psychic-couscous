"use client";
import * as React from "react";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveFirmFinance, type FirmFormState } from "@/lib/actions/firm";
import type { FirmFinance } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtCurrency } from "@/lib/format";

function NumInput({
  name, label, value, onChange, disabled,
}: { name: string; label: string; value: number; onChange: (n: number) => void; disabled: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name} name={name} type="number" step="0.01" min="0" inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        disabled={disabled}
      />
    </div>
  );
}

export function FirmFinanceForm({ firm, canWrite }: { firm: FirmFinance; canWrite: boolean }) {
  const [state, action, pending] = useActionState<FirmFormState, FormData>(saveFirmFinance, undefined);

  const [revenue, setRevenue] = React.useState(firm.totalRevenue);
  const [expenses, setExpenses] = React.useState(firm.totalExpenses);
  const [gst, setGst] = React.useState(firm.gstOwed);
  const [qst, setQst] = React.useState(firm.qstOwed);
  const [das, setDas] = React.useState(firm.sourceDeductionsOwed);
  const [pen, setPen] = React.useState(firm.penaltiesOwed);

  const n = (x: number) => (Number.isFinite(x) ? x : 0);
  const netResult = n(revenue) - n(expenses);
  const totalObligations = n(gst) + n(qst) + n(das) + n(pen);
  const afterObligations = netResult - totalObligations;

  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={!canWrite} className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Vue firme (QuickBooks — {firm.periodLabel})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumInput name="totalRevenue" label="Revenu firme total ($)" value={revenue} onChange={setRevenue} disabled={!canWrite} />
            <NumInput name="totalExpenses" label="Dépenses firme totales ($)" value={expenses} onChange={setExpenses} disabled={!canWrite} />
          </div>
          <div className="mt-2 flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Résultat net (revenu − dépenses)</span>
            <span className={`font-semibold tabular-nums ${netResult >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtCurrency(netResult)}</span>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Obligations fiscales à remettre au gouvernement</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumInput name="gstOwed" label="TPS à remettre ($)" value={gst} onChange={setGst} disabled={!canWrite} />
            <NumInput name="qstOwed" label="TVQ à remettre ($)" value={qst} onChange={setQst} disabled={!canWrite} />
            <NumInput name="sourceDeductionsOwed" label="DAS / retenues à la source ($)" value={das} onChange={setDas} disabled={!canWrite} />
            <NumInput name="penaltiesOwed" label="Pénalités et intérêts ($)" value={pen} onChange={setPen} disabled={!canWrite} />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total des obligations fiscales</span>
              <span className="font-semibold tabular-nums text-amber-700">{fmtCurrency(totalObligations)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border-2 border-dashed px-3 py-2 text-sm">
              <span className="font-medium">Résultat net après obligations</span>
              <span className={`font-bold tabular-nums ${afterObligations >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtCurrency(afterObligations)}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {canWrite && (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Enregistrer
          </Button>
          {state?.ok && <span className="text-sm text-emerald-600">Enregistré ✓</span>}
          {state?.error && <span className="text-sm text-destructive">{state.error}</span>}
          {firm.updatedAt && !state?.ok && (
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour : {new Date(firm.updatedAt).toLocaleDateString("fr-CA")}
            </span>
          )}
        </div>
      )}
      {!canWrite && <p className="text-xs text-muted-foreground">Lecture seule — droits ADMIN ou GESTIONNAIRE requis pour modifier.</p>}
    </form>
  );
}
