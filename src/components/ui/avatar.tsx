import { cn } from "@/lib/utils";

function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };
