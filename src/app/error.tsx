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
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="opacity-70">An unexpected error occurred while loading this page.</p>
      {error.digest && <p className="font-mono text-sm opacity-50">Reference: {error.digest}</p>}
      <button type="button" onClick={retry} className="rounded border px-4 py-2">
        Try again
      </button>
    </div>
  );
}
