import { apiClient, type PaginatedResponse, type PaginationParams } from "@/lib/api";
import {
  type AddPaymentMethodInput,
  type AutoRechargeSettings,
  type BillingAddress,
  type Invoice,
  type PaymentMethod,
  type PurchaseCreditsInput,
  type PurchaseCreditsResponse,
  type UpdateAutoRechargeInput,
} from "@/types/domain";

/** The billing address saved on the account, or `null` before the first purchase. */
export async function getBillingAddress(signal?: AbortSignal) {
  const { data } = await apiClient.get<BillingAddress | null>("/billing/address", { signal });
  return data;
}

/**
 * Buys credit for the signed-in user. In production the card is tokenized by the payment
 * provider in the browser and only the token is sent here; the mock accepts the raw fields.
 */
export async function purchaseCredits(input: PurchaseCreditsInput) {
  const { data } = await apiClient.post<PurchaseCreditsResponse>("/billing/credits", input, {
    skipRetry: true,
  });
  return data;
}

/** Saved cards, newest first. */
export async function listPaymentMethods(signal?: AbortSignal) {
  const { data } = await apiClient.get<PaymentMethod[]>("/billing/payment-methods", { signal });
  return data;
}

/** Saves a card (tokenized by the payment provider in production, like `purchaseCredits`). */
export async function addPaymentMethod(input: AddPaymentMethodInput) {
  const { data } = await apiClient.post<PaymentMethod>("/billing/payment-methods", input, {
    skipRetry: true,
  });
  return data;
}

export async function removePaymentMethod(paymentMethodId: string) {
  await apiClient.delete(`/billing/payment-methods/${encodeURIComponent(paymentMethodId)}`);
}

export async function getAutoRecharge(signal?: AbortSignal) {
  const { data } = await apiClient.get<AutoRechargeSettings>("/billing/auto-recharge", {
    signal,
  });
  return data;
}

export async function updateAutoRecharge(input: UpdateAutoRechargeInput) {
  const { data } = await apiClient.put<AutoRechargeSettings>("/billing/auto-recharge", input, {
    skipRetry: true,
  });
  return data;
}

/** Invoices, newest first. */
export async function listInvoices(params: Required<PaginationParams>, signal?: AbortSignal) {
  const { data } = await apiClient.get<PaginatedResponse<Invoice>>("/billing/invoices", {
    params,
    signal,
  });
  return data;
}

/** The invoice as a PDF file. */
export async function downloadInvoicePdf(invoiceId: string) {
  const { data } = await apiClient.get<Blob>(
    `/billing/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    { responseType: "blob", headers: { Accept: "application/pdf" } },
  );
  return data;
}
