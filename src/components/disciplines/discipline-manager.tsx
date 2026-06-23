"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createDiscipline, updateDiscipline, deleteDiscipline } from "@/lib/actions/disciplines";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DisciplineDTO {
  id: string;
  name: string;
  code: string;
  color: string;
  usage: number; // employés + projets
}

export function DisciplineManager({ disciplines, canWrite }: { disciplines: DisciplineDTO[]; canWrite: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  // Édition en ligne.
  const [edits, setEdits] = React.useState<Record<string, { name: string; code: string; color: string }>>({});
  const editOf = (d: DisciplineDTO) => edits[d.id] ?? { name: d.name, code: d.code, color: d.color };
  const setEdit = (id: string, patch: Partial<{ name: string; code: string; color: string }>) =>
    setEdits((p) => ({ ...p, [id]: { ...editOf(disciplines.find((d) => d.id === id)!), ...p[id], ...patch } }));

  // Ajout.
  const [nName, setNName] = React.useState("");
  const [nCode, setNCode] = React.useState("");
  const [nColor, setNColor] = React.useState("#64748b");

  async function add() {
    setBusy("add"); setMsg(null);
    const fd = new FormData();
    fd.set("name", nName); fd.set("code", nCode); fd.set("color", nColor);
    const res = await createDiscipline(undefined, fd);
    setBusy(null);
    if (res?.ok) { setNName(""); setNCode(""); setNColor("#64748b"); setMsg({ ok: true, text: "Discipline ajoutée ✓" }); router.refresh(); }
    else setMsg({ ok: false, text: res?.error ?? "Erreur." });
  }
  async function save(id: string) {
    setBusy(id); setMsg(null);
    const e = editOf(disciplines.find((d) => d.id === id)!);
    const fd = new FormData();
    fd.set("name", e.name); fd.set("code", e.code); fd.set("color", e.color);
    const res = await updateDiscipline(id, undefined, fd);
    setBusy(null);
    if (res?.ok) { setMsg({ ok: true, text: "Enregistré ✓" }); router.refresh(); }
    else setMsg({ ok: false, text: res?.error ?? "Erreur." });
  }
  async function remove(id: string) {
    setBusy(id); setMsg(null);
    const res = await deleteDiscipline(id);
    setBusy(null);
    if (res?.ok) { setMsg({ ok: true, text: "Supprimée ✓" }); router.refresh(); }
    else setMsg({ ok: false, text: res?.error ?? "Erreur." });
  }

  return (
    <div className="space-y-4">
      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajouter une discipline</CardTitle>
            <CardDescription>Ex. Structure, Civil, Architecture, Procédé, Télécommunications, Sécurité…</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input value={nName} onChange={(e) => setNName(e.target.value)} className="w-56" /></div>
            <div className="space-y-1.5"><Label>Code</Label><Input value={nCode} onChange={(e) => setNCode(e.target.value)} className="w-28" placeholder="STRUCT" /></div>
            <div className="space-y-1.5"><Label>Couleur</Label><input type="color" value={nColor} onChange={(e) => setNColor(e.target.value)} className="h-9 w-14 rounded-md border border-input" /></div>
            <Button onClick={add} disabled={busy === "add" || !nName || !nCode}>
              {busy === "add" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Ajouter
            </Button>
            {msg && <span className={msg.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{msg.text}</span>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Couleur</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="w-32">Code</TableHead>
                <TableHead className="text-right">Utilisation</TableHead>
                {canWrite && <TableHead className="w-32"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplines.map((d) => {
                const e = editOf(d);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      {canWrite ? (
                        <input type="color" value={e.color} onChange={(ev) => setEdit(d.id, { color: ev.target.value })} className="h-8 w-12 rounded border border-input" />
                      ) : (
                        <span className="inline-block size-4 rounded-full" style={{ backgroundColor: d.color }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {canWrite ? <Input value={e.name} onChange={(ev) => setEdit(d.id, { name: ev.target.value })} className="h-8" /> : d.name}
                    </TableCell>
                    <TableCell>
                      {canWrite ? <Input value={e.code} onChange={(ev) => setEdit(d.id, { code: ev.target.value })} className="h-8 w-24" /> : d.code}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{d.usage}</TableCell>
                    {canWrite && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => save(d.id)} disabled={busy === d.id} title="Enregistrer">
                            {busy === d.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(d.id)} disabled={busy === d.id || d.usage > 0} title={d.usage > 0 ? "Utilisée — non supprimable" : "Supprimer"}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
