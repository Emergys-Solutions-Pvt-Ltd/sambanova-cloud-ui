"use client";

import { type MouseEvent, useCallback } from "react";

import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { useAuthDialogStore } from "@/stores/auth-dialog-store";

/**
 * Guards actions that need a signed-in user. Signed-out users keep seeing the
 * normal button; clicking it opens the login dialog and, after sign-in, carries on
 * with what they asked for.
 */
export function useAuthGate() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const openDialog = useAuthDialogStore((state) => state.openDialog);

  /** onClick for a link: stops the navigation for guests and sends them to `href` after login. */
  const guardLink = useCallback(
    (href: string) => (event: MouseEvent<HTMLElement>) => {
      if (authenticated) return;
      event.preventDefault();
      openDialog({ mode: "login", returnTo: href });
    },
    [authenticated, openDialog],
  );

  /** onClick for a button: runs `action` now if signed in, otherwise after login. */
  const guardAction = useCallback(
    (action: () => void) => () => {
      if (authenticated) action();
      else openDialog({ mode: "login", onSuccess: action });
    },
    [authenticated, openDialog],
  );

  return { authenticated, guardLink, guardAction };
}
