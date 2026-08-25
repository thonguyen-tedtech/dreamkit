import { cn } from "@/lib/cn";

interface BadgeProps {
  readonly label: string;
  /** Tailwind background/text utility classes, e.g. from TOURNAMENT_STATUS_TONE. */
  readonly tone?: string;
  readonly className?: string;
}

/** Small pill used for tournament/match status and format labels. */
export function Badge({ label, tone, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-label",
        tone ?? "bg-surface-strong text-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
