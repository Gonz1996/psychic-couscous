"use client";
import { useActionState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="size-6" />
        </div>
        <CardTitle className="text-xl">MEP Resource Command Center</CardTitle>
        <CardDescription>Connectez-vous pour accéder au tableau de bord</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Courriel</Label>
            <Input id="email" name="email" type="email" defaultValue="admin@expertsmep.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" defaultValue="demo1234" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Se connecter
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Démo : admin@expertsmep.com / demo1234
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
