import { apiClient } from "@/lib/api";
import {
  type BillingAddress,
  type PurchaseCreditsInput,
  type PurchaseCreditsResponse,
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
