import { cn } from "@/lib/cn";

import { Button } from "./button";

interface ErrorStateProps {
  message?: string;
  /** Shows a "Try again" button when provided. */
  onRetry?: () => void;
  className?: string;
}

/** Inline failure message for a section whose data could not load. Announced to screen readers. */
export function ErrorState({
  message = "Something went wrong while loading this section.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error-border bg-error-bg p-4",
        className,
      )}
    >
      <p className="text-body-sm text-error">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
