"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the root layout, so it renders its own <html>/<body> and cannot rely on
 * global styles: inline styles only.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div role="alert">
          <h1>Something went wrong</h1>
          <p>SambaNova Cloud failed to load. Please try again.</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
