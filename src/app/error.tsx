"use client";

import { useEffect } from "react";

/** Route-level error boundary. Final styling lands after the design tokens (Work Area B). */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-heading-lg">Something went wrong</h1>
      <p className="text-muted">An unexpected error occurred while loading this page.</p>
      {error.digest && <p className="text-caption text-muted">Reference: {error.digest}</p>}
      <button
        type="button"
        onClick={retry}
        className="rounded-md border border-default bg-surface px-4 py-2 font-medium hover:bg-hover"
      >
        Try again
      </button>
    </div>
  );
}
