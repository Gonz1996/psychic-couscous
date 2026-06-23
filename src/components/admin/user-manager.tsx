"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, KeyRound } from "lucide-react";
import { createUser, setUserRole, resetUserPassword } from "@/lib/actions/users";
import { USER_ROLE_LABELS } from "@/lib/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROLES = ["ADMIN", "MANAGER", "VIEWER"] as const;
const SELECT = "h-9 rounded-md border border-input bg-transparent px-2 text-sm";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  employeeName: string | null;
}
export interface EmpOption {
  id: string;
  name: string;
}

export function UserManager({ users, employees }: { users: UserDTO[]; employees: EmpOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("VIEWER");
  const [password, setPassword] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");

  async function add() {
    setBusy("add"); setMsg(null);
    const fd = new FormData();
    fd.set("email", email); fd.set("name", name); fd.set("role", role); fd.set("password", password);
    if (employeeId) fd.set("employeeId", employeeId);
    const res = await createUser(undefined, fd);
    setBusy(null);
    if (res?.ok) { setEmail(""); setName(""); setPassword(""); setEmployeeId(""); setRole("VIEWER"); setMsg({ ok: true, text: "Compte créé ✓" }); router.refresh(); }
    else setMsg({ ok: false, text: res?.error ?? "Erreur." });
  }
  async function changeRole(id: string, r: string) {
    setBusy(id); setMsg(null);
    const res = await setUserRole(id, r);
    setBusy(null);
    if (res?.ok) { setMsg({ ok: true, text: "Rôle mis à jour ✓" }); router.refresh(); }
    else setMsg({ ok: false, text: res?.error ?? "Erreur." });
  }
  async function resetPw(id: string, label: string) {
    const pw = window.prompt(`Nouveau mot de passe pour ${label} (min. 6 caractères) :`);
    if (!pw) return;
    setBusy(id); setMsg(null);
    const res = await resetUserPassword(id, pw);
    setBusy(null);
    setMsg(res?.ok ? { ok: true, text: "Mot de passe réinitialisé ✓" } : { ok: false, text: res?.error ?? "Erreur." });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Créer un compte</CardTitle>
          <CardDescription>Le titulaire pourra se connecter avec ce courriel et ce mot de passe.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="w-44" /></div>
          <div className="space-y-1.5"><Label>Courriel</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-56" /></div>
          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={`${SELECT} w-36`}>
              {ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Employé lié (optionnel)</Label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={`${SELECT} w-48`}>
              <option value="">— Aucun —</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5"><Label>Mot de passe</Label><Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-40" /></div>
          <Button onClick={add} disabled={busy === "add" || !email || !name || password.length < 6}>
            {busy === "add" ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Créer
          </Button>
          {msg && <span className={msg.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{msg.text}</span>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Courriel</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead className="w-40">Rôle</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.employeeName ?? "—"}</TableCell>
                  <TableCell>
                    <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={busy === u.id} className={`${SELECT} w-full`}>
                      {ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => resetPw(u.id, u.name)} disabled={busy === u.id} title="Réinitialiser le mot de passe">
                      <KeyRound className="size-4" /> Mot de passe
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
