"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { setMockConfig } from "@/mocks/config";
import { useSessionStore } from "@/stores/session-store";

/**
 * STUB until Auth0: clears the local session. With mocks on it also flips the
 * mock API to the signed-out scenario so `GET /me` returns 401 and a reload
 * stays signed out.
 */
export function useLogout() {
  const router = useRouter();

  return useCallback(() => {
    useSessionStore.getState().logout();
    if (env.useMocks) setMockConfig({ scenario: "guest" });
    router.push(routes.dashboard);
  }, [router]);
}
