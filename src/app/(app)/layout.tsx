import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/actions";
import { Shell } from "@/components/layout/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <Shell
      user={{ name: session.user.name, email: session.user.email, role: session.user.role }}
      signOutAction={signOutAction}
    >
      {children}
    </Shell>
  );
}
