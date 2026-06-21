"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Menu, X } from "lucide-react";
import { NAV_ITEMS, titleForPath } from "./nav-items";
import { USER_ROLE_LABELS } from "@/lib/labels";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShellUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

export function Shell({
  user,
  signOutAction,
  children,
}: {
  user: ShellUser;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const title = titleForPath(pathname);
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const Brand = () => (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Building2 className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-sidebar-foreground">Experts MEP</span>
        <span className="block text-xs text-sidebar-foreground/60">Command Center</span>
      </span>
    </Link>
  );

  const Nav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <Nav />
        </div>
        <p className="px-3 text-xs text-sidebar-foreground/50">MEP Resource Command Center v1.0</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X />
              </Button>
            </div>
            <div className="mt-8 flex-1">
              <Nav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">
                {user.role ? (USER_ROLE_LABELS[user.role] ?? user.role) : ""}
              </div>
            </div>
            <Avatar initials={initials} />
            <form action={signOutAction}>
              <Button variant="ghost" size="icon" type="submit" title="Se déconnecter">
                <LogOut />
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
