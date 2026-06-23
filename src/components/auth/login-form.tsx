"use client";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center space-y-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mep.png" alt="MEP Experts Conseils" className="mx-auto w-48 rounded-lg" />
        <CardTitle className="text-lg">Resource Command Center</CardTitle>
        <CardDescription>Connectez-vous pour accéder au tableau de bord</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Courriel</Label>
            <Input id="email" name="email" type="email" defaultValue="cgarzon@expertsmep.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Se connecter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
