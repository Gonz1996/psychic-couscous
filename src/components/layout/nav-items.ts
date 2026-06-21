import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Contact,
  CalendarRange,
  Clock,
  Bell,
  Sparkles,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/employes", label: "Employés", icon: Users },
  { href: "/projets", label: "Projets", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Contact },
  { href: "/capacite", label: "Capacité", icon: CalendarRange },
  { href: "/saisie", label: "Saisie de temps", icon: Clock },
  { href: "/alertes", label: "Alertes", icon: Bell },
  { href: "/ia", label: "Assistant IA", icon: Sparkles },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
];

export function titleForPath(path: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => path === i.href || path.startsWith(i.href + "/"));
  return match?.label ?? "MEP Command Center";
}
