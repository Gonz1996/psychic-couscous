import { auth } from "@/auth";
import { canWrite } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await auth();
  const writable = canWrite(session?.user?.role);
  const clients = await prisma.client.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Donneurs d'ouvrage et nombre de projets associés." />
      {writable && <ClientForm />}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead className="text-right">Projets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.sector ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{c._count.projects}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
