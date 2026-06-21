import { utilizationStyle } from "@/lib/thresholds";
import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Badge coloré d'utilisation (VERT / JAUNE / ORANGE / ROUGE). */
export function UtilBadge({ pct, className }: { pct: number; className?: string }) {
  const s = utilizationStyle(pct);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
        s.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.bg)} />
      {fmtPct(pct)}
    </span>
  );
}

/** Barre de charge colorée selon le seuil. */
export function UtilBar({ pct, className }: { pct: number; className?: string }) {
  const s = utilizationStyle(pct);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

/** Pastille de couleur seule. */
export function UtilDot({ pct, className }: { pct: number; className?: string }) {
  const s = utilizationStyle(pct);
  return <span className={cn("inline-block size-2.5 rounded-full", s.bg, className)} title={fmtPct(pct)} />;
}
