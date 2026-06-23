import { auth } from "@/auth";
import { USER_ROLE_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/shared/page-header";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="max-w-md space-y-6">
      <PageHeader title="Mon compte" description={session?.user?.email ?? undefined} />

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nom</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Courriel</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rôle</span>
            <span className="font-medium">{role ? (USER_ROLE_LABELS[role] ?? role) : "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>Choisissez un mot de passe d&apos;au moins 6 caractères.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
