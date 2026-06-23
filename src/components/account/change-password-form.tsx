"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { changePassword } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current">Mot de passe actuel</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="next">Nouveau mot de passe</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Mot de passe mis à jour avec succès. ✓</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Mettre à jour
      </Button>
    </form>
  );
}
