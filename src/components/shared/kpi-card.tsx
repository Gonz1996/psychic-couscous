import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "danger" | "warn" | "good" | "info";

const TONES: Record<Tone, string> = {
  default: "text-foreground",
  danger: "text-red-600",
  warn: "text-orange-600",
  good: "text-emerald-600",
  info: "text-blue-600",
};

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className={cn("mt-2 text-2xl font-bold tabular-nums", TONES[tone])}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
