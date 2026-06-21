"use client";
import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ClientForm() {
  const [state, action, pending] = useActionState(createClient, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" className="w-56" placeholder="Ex. Ville de Laval" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" className="w-32" placeholder="VDL" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sector">Secteur</Label>
            <Input id="sector" name="sector" className="w-44" placeholder="Municipal" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Ajouter
          </Button>
          {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
          {state?.ok && <p className="w-full text-sm text-emerald-600">Client ajouté.</p>}
        </form>
      </CardContent>
    </Card>
  );
}
