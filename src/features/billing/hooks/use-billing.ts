"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type User } from "@/types/domain";

import { getBillingAddress, purchaseCredits } from "../api/billing.api";

/** Saved billing address (for prefilling Add Credits). Signed-in users only. */
export function useBillingAddress() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.billing.address(),
    queryFn: ({ signal }) => getBillingAddress(signal),
    enabled: authenticated,
  });
}

/** Buys credits, then updates the user's balance everywhere it is shown (sidebar badge, Usage Overview). */
export function useBuyCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseCredits,
    onSuccess: ({ balance }, { billingAddress }) => {
      queryClient.setQueryData(queryKeys.billing.address(), billingAddress);

      const user = useSessionStore.getState().user;
      if (user) {
        const updated: User = { ...user, creditBalance: balance };
        queryClient.setQueryData(queryKeys.session.me(), updated);
        useSessionStore.getState().setUser(updated);
      }
    },
  });
}
