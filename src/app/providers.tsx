"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, type ReactNode, Suspense, useEffect } from "react";

import { env } from "@/config/env";
import { ThemeSync } from "@/components/theme/theme-sync";
import { ToastViewport } from "@/components/ui/toast";
import { useSessionSync } from "@/features/session";
import { getQueryClient } from "@/lib/query-client";
import { MOCKS_CHANGED_EVENT } from "@/mocks/config";
import { usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { useProjectStore } from "@/stores/project-store";
import { useThemeStore } from "@/stores/theme-store";
import { useUIStore } from "@/stores/ui-store";

// Opt-in (NEXT_PUBLIC_QUERY_DEVTOOLS=true), development only, loaded on demand:
// no preload link, and the import is dropped from production bundles.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development" && env.queryDevtools
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((module) => ({
          default: module.ReactQueryDevtools,
        })),
      )
    : () => null;

/** Rehydrates persisted Zustand stores after mount so SSR and first client render match. */
function StoreHydration() {
  useEffect(() => {
    void useThemeStore.persist.rehydrate();
    void useProjectStore.persist.rehydrate();
    void useUIStore.persist.rehydrate();
    void usePlaygroundPrefsStore.persist.rehydrate();
  }, []);
  return null;
}

/** Refetches everything when the mock scenario changes (e.g. __mocks.set({ scenario: "error" })). */
function MockSync({ client }: { client: QueryClient }) {
  useEffect(() => {
    const onChange = () => void client.invalidateQueries();
    window.addEventListener(MOCKS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(MOCKS_CHANGED_EVENT, onChange);
  }, [client]);
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
      <MockSync client={queryClient} />
      {children}
      <ToastViewport />
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </Suspense>
    </QueryClientProvider>
  );
}
