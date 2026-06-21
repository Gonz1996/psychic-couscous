import { FLAG_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const FLAG_STYLES: Record<string, string> = {
  OVERLOADED: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL_OVERLOAD: "bg-red-100 text-red-800 border-red-200",
  UNDERUTILIZED: "bg-sky-100 text-sky-800 border-sky-200",
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OVER_BUDGET: "bg-red-100 text-red-800 border-red-200",
  BEHIND_SCHEDULE: "bg-amber-100 text-amber-800 border-amber-200",
  UNDERESTIMATED: "bg-purple-100 text-purple-800 border-purple-200",
  RESOURCE_SHORTAGE: "bg-rose-100 text-rose-800 border-rose-200",
};

export function FlagBadge({ flag, className }: { flag: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        FLAG_STYLES[flag] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {FLAG_LABELS[flag] ?? flag}
    </span>
  );
}
