"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type PaginationParams } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type User } from "@/types/domain";

import {
  addPaymentMethod,
  downloadInvoicePdf,
  getAutoRecharge,
  getBillingAddress,
  listInvoices,
  listPaymentMethods,
  purchaseCredits,
  removePaymentMethod,
  updateAutoRecharge,
} from "../api/billing.api";

/** Saved billing address (for prefilling Add Credits). Signed-in users only. */
export function useBillingAddress() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.billing.address(),
    queryFn: ({ signal }) => getBillingAddress(signal),
    enabled: authenticated,
  });
}

/**
 * Buys credits, then updates the user's balance everywhere it is shown (sidebar badge, Usage
 * Overview, Billing) and refreshes the invoice list.
 */
export function useBuyCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseCredits,
    onSuccess: ({ balance }, { billingAddress }) => {
      if (billingAddress) queryClient.setQueryData(queryKeys.billing.address(), billingAddress);

      const user = useSessionStore.getState().user;
      if (user) {
        const updated: User = { ...user, creditBalance: balance };
        queryClient.setQueryData(queryKeys.session.me(), updated);
        useSessionStore.getState().setUser(updated);
      }
    },
    // A declined card also leaves a (Failed) invoice.
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.billing.invoices() }),
  });
}

/** Saved cards, newest first. */
export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.billing.paymentMethods(),
    queryFn: ({ signal }) => listPaymentMethods(signal),
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() }),
  });
}

/** Removing the Auto Recharge card also turns Auto Recharge off, so both are refetched. */
export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePaymentMethod,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.autoRecharge() }),
      ]),
  });
}

export function useAutoRecharge() {
  return useQuery({
    queryKey: queryKeys.billing.autoRecharge(),
    queryFn: ({ signal }) => getAutoRecharge(signal),
  });
}

/** Turning Auto Recharge on while the balance is low tops up at once: balance and invoices refresh. */
export function useUpdateAutoRecharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAutoRecharge,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.billing.autoRecharge(), settings);
      if (!settings.enabled) return;
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.invoices() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.session.me() }),
      ]);
    },
  });
}

/** One page of invoices; the previous page stays on screen while the next loads. */
export function useInvoices(params: Required<PaginationParams>) {
  return useQuery({
    queryKey: queryKeys.billing.invoiceList(params),
    queryFn: ({ signal }) => listInvoices(params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Downloads an invoice PDF as `<number>.pdf`. */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ id, number }: { id: string; number: string }) => {
      const blob = await downloadInvoicePdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${number}.pdf`;
      link.click();
      // Give the browser a moment to start the download before the URL is released.
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    },
  });
}
