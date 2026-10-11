"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { routes } from "@/config/routes";

/** Ends the session through the API (it clears the cookie), resets user data and returns to the dashboard as a guest. */
export function useLogout() {
  const router = useRouter();
  const { mutate } = useLogoutMutation();

  return useCallback(() => {
    mutate(undefined, { onSettled: () => router.push(routes.dashboard) });
  }, [mutate, router]);
}
