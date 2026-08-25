import type { ReactNode } from "react";

/** Shared input styling for every form in the tournament feature. */
export const INPUT_CLASS =
  "h-11 w-full rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground disabled:opacity-50";

/**
 * Same styling as `INPUT_CLASS` but without `w-full` — for compact,
 * content-sized controls (e.g. filter selects sitting side by side).
 * Deliberately a separate constant rather than `${INPUT_CLASS} w-auto`:
 * Tailwind's cascade is order-of-generation, not order-in-string, so a
 * later `w-auto` in the class list doesn't reliably beat `w-full`.
 */
export const FILTER_SELECT_CLASS =
  "h-11 rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground disabled:opacity-50";

interface FieldProps {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

/** Label + control + error/hint wrapper, used across every tournament form. */
export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-label text-muted">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
