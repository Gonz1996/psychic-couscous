import {
  LayoutDashboard,
  Landmark,
  FlaskConical,
  Users,
  FolderKanban,
  Contact,
  Layers,
  CalendarRange,
  Clock,
  Bell,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Flame,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/direction", label: "Direction", icon: Landmark },
  { href: "/employes", label: "Employés", icon: Users },
  { href: "/projets", label: "Projets", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Contact },
  { href: "/disciplines", label: "Disciplines", icon: Layers },
  { href: "/capacite", label: "Capacité", icon: CalendarRange },
  { href: "/simulation", label: "Simulateur", icon: FlaskConical },
  { href: "/saisie", label: "Saisie de temps", icon: Clock },
  { href: "/alertes", label: "Alertes", icon: Bell },
  { href: "/ia", label: "Assistant IA", icon: Sparkles },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
  { href: "/matrice-incendie", label: "Matrice incendie", icon: Flame },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: ShieldCheck, adminOnly: true },
];

export function titleForPath(path: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => path === i.href || path.startsWith(i.href + "/"));
  return match?.label ?? "MEP Command Center";
}
