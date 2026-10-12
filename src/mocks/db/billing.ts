import { type BillingAddress, type CreditPurchase } from "@/types/domain";

/**
 * Billing data kept per account in localStorage: the saved billing address and the purchase
 * history. Card details are never stored; the real API hands them to a payment provider.
 */
const BILLING_KEY = "sn:mock-billing";

interface AccountBilling {
  address: BillingAddress | null;
  purchases: CreditPurchase[];
}

type BillingByAccount = Record<string, AccountBilling>;

function read(): BillingByAccount {
  try {
    return JSON.parse(localStorage.getItem(BILLING_KEY) ?? "{}") as BillingByAccount;
  } catch {
    return {};
  }
}

const emptyBilling = (): AccountBilling => ({ address: null, purchases: [] });

export function getBillingAddress(accountId: string): BillingAddress | null {
  return read()[accountId]?.address ?? null;
}

/** Records a purchase and remembers the billing address for next time. */
export function recordPurchase(accountId: string, amount: number, address: BillingAddress) {
  const all = read();
  const current = all[accountId] ?? emptyBilling();

  const purchase: CreditPurchase = {
    id: `pur_${crypto.randomUUID().slice(0, 8)}`,
    amount,
    createdAt: new Date().toISOString(),
  };
  all[accountId] = { address, purchases: [...current.purchases, purchase] };
  localStorage.setItem(BILLING_KEY, JSON.stringify(all));
  return purchase;
}
