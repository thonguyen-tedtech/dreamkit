interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
}

/** Placeholder shown when a list request succeeded but returned no rows. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card border border-dashed border-border py-14 text-center">
      <p className="font-display text-lg text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
    </div>
  );
}

interface ErrorStateProps {
  readonly message: string;
}

/** Placeholder shown when a fetch failed. */
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
