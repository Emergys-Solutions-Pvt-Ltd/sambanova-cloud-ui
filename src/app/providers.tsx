"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect } from "react";

import { ThemeSync } from "@/components/theme/theme-sync";
import { useSessionSync } from "@/features/session";
import { getQueryClient } from "@/lib/query-client";
import { useProjectStore } from "@/stores/project-store";
import { useThemeStore } from "@/stores/theme-store";
import { useUIStore } from "@/stores/ui-store";

// Loaded only in development; the import is dropped from production bundles.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
      )
    : () => null;

/** Rehydrates persisted Zustand stores after mount so SSR and first client render match. */
function StoreHydration() {
  useEffect(() => {
    void useThemeStore.persist.rehydrate();
    void useProjectStore.persist.rehydrate();
    void useUIStore.persist.rehydrate();
  }, []);
  return null;
}

function SessionSync() {
  useSessionSync();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreHydration />
      <ThemeSync />
      <SessionSync />
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
