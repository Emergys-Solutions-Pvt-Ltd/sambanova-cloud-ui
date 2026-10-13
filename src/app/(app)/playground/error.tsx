"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

/** Error boundary for the Playground route: inline failure card with "Try again". */
export default function PlaygroundError({
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
    <div className="p-6">
      <ErrorState message="Couldn’t load the Playground." onRetry={retry} />
    </div>
  );
}
