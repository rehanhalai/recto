import { cn } from "@/lib/utils";

export type ReadingStatus = "want_to_read" | "currently_reading" | "finished";

export type ReadingStatusBadgeProps = {
  status: ReadingStatus;
  className?: string;
};

const statusConfig: Record<ReadingStatus, { label: string; colors: string }> = {
  currently_reading: {
    label: "Reading",
    colors:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
  },
  finished: {
    label: "Finished",
    colors:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50",
  },
  want_to_read: {
    label: "Want to read",
    colors:
      "bg-ink-muted/10 text-ink dark:bg-ink-muted/20 border-border-subtle",
  },
};

export function ReadingStatusBadge({
  status,
  className,
}: ReadingStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        config.colors,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
