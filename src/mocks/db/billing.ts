import { type PaginatedResponse } from "@/lib/api/types";
import {
  type AutoRechargeSettings,
  type BillingAddress,
  type CardBrand,
  type CreditPurchase,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/types/domain";

import { SEED_CARDS, SEED_INVOICES } from "../fixtures/billing";

import { addCreditsTo, findAccountById } from "./accounts";

/**
 * Billing data kept per account in localStorage (`sn:mock-billing`): saved billing address,
 * purchases, saved cards, Auto Recharge settings and invoices. Full card numbers are never stored;
 * the real API hands them to a payment provider. Accounts from fixtures/auth.ts are seeded with
 * the Figma cards and invoices the first time their billing is read.
 */
const BILLING_KEY = "sn:mock-billing";
const DAY_MS = 86_400_000;

interface StoredPaymentMethod extends PaymentMethod {
  /** Mock only: the card was the declined test card, so charges to it fail. */
  declines?: boolean;
}

interface StoredInvoice extends Invoice {
  /** Figma history; shown, but not counted as spend for Usage Tiers. */
  seeded?: boolean;
}

interface AccountBilling {
  address: BillingAddress | null;
  /** Completed purchases made in the app (the spend Usage Tiers are based on). */
  purchases: CreditPurchase[];
  paymentMethods: StoredPaymentMethod[];
  autoRecharge: AutoRechargeSettings;
  invoices: StoredInvoice[];
  seeded: boolean;
}

type BillingByAccount = Record<string, Partial<AccountBilling>>;

const emptyAutoRecharge = (): AutoRechargeSettings => ({
  enabled: false,
  threshold: null,
  amount: null,
  paymentMethodId: null,
});

function read(): BillingByAccount {
  try {
    return JSON.parse(localStorage.getItem(BILLING_KEY) ?? "{}") as BillingByAccount;
  } catch {
    return {};
  }
}

const write = (all: BillingByAccount) => localStorage.setItem(BILLING_KEY, JSON.stringify(all));
const shortId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/** Fixture accounts get ids `usr_seed_N` (see db/accounts.ts). */
const isSeedAccount = (accountId: string) => accountId.startsWith("usr_seed_");

/** Loads the store and the account's billing, upgrading older entries and seeding on first read. */
function load(accountId: string) {
  const all = read();
  const stored = all[accountId] ?? {};
  const billing: AccountBilling = {
    address: stored.address ?? null,
    purchases: stored.purchases ?? [],
    paymentMethods: stored.paymentMethods ?? [],
    autoRecharge: stored.autoRecharge ?? emptyAutoRecharge(),
    invoices: stored.invoices ?? [],
    seeded: stored.seeded ?? false,
  };

  if (!billing.seeded) {
    if (isSeedAccount(accountId)) {
      const now = Date.now();
      billing.paymentMethods.push(
        ...SEED_CARDS.map((card) => ({
          id: shortId("pm"),
          brand: card.brand,
          last4: card.last4,
          expMonth: card.expMonth,
          expYear: card.expYear,
          createdAt: new Date(now - card.addedDaysAgo * DAY_MS).toISOString(),
        })),
      );
      billing.invoices.push(
        ...SEED_INVOICES.map((invoice) => ({
          id: shortId("inv"),
          ...invoice,
          source: "purchase" as const,
          seeded: true,
        })),
      );
    }
    billing.seeded = true;
    all[accountId] = billing;
    write(all);
  }
  return { all, billing };
}

function save(all: BillingByAccount, accountId: string, billing: AccountBilling) {
  all[accountId] = billing;
  write(all);
}

const publicMethod = ({ declines: _declines, ...method }: StoredPaymentMethod): PaymentMethod =>
  method;
const publicInvoice = ({ seeded: _seeded, ...invoice }: StoredInvoice): Invoice => invoice;

function nextInvoiceNumber(invoices: StoredInvoice[]) {
  const highest = invoices.reduce(
    (max, invoice) => Math.max(max, Number(invoice.number.replace(/\D/g, "")) || 0),
    0,
  );
  return `Inv-${String(highest + 1).padStart(4, "0")}`;
}

export function getBillingAddress(accountId: string): BillingAddress | null {
  return load(accountId).billing.address;
}

/** Lifetime credit purchases in USD (the spend Usage Tiers are based on). */
export function totalPurchasedBy(accountId: string) {
  return load(accountId).billing.purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
}

/**
 * Records a charge as an invoice. A completed one also counts as a purchase and remembers the
 * billing address for next time.
 */
export function recordCharge(
  accountId: string,
  charge: {
    amount: number;
    status: InvoiceStatus;
    source: Invoice["source"];
    address?: BillingAddress | null;
  },
): { invoice: Invoice; purchase: CreditPurchase | null } {
  const { all, billing } = load(accountId);
  const createdAt = new Date().toISOString();
  const invoice: StoredInvoice = {
    id: shortId("inv"),
    number: nextInvoiceNumber(billing.invoices),
    createdAt,
    amount: charge.amount,
    status: charge.status,
    source: charge.source,
  };
  billing.invoices.unshift(invoice);

  let purchase: CreditPurchase | null = null;
  if (charge.status === "completed") {
    purchase = { id: shortId("pur"), amount: charge.amount, createdAt };
    billing.purchases.push(purchase);
    if (charge.address) billing.address = charge.address;
  }
  save(all, accountId, billing);
  return { invoice: publicInvoice(invoice), purchase };
}

/* ---- Saved cards ---- */

/** Newest first. */
export function listPaymentMethodsFor(accountId: string): PaymentMethod[] {
  return [...load(accountId).billing.paymentMethods]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicMethod);
}

/** Saves a card; `null` when the same card (brand, last 4, expiry) is already saved. */
export function addPaymentMethodFor(
  accountId: string,
  card: { brand: CardBrand; last4: string; expMonth: number; expYear: number; declines: boolean },
): PaymentMethod | null {
  const { all, billing } = load(accountId);
  const duplicate = billing.paymentMethods.some(
    (method) =>
      method.brand === card.brand &&
      method.last4 === card.last4 &&
      method.expMonth === card.expMonth &&
      method.expYear === card.expYear,
  );
  if (duplicate) return null;

  const method: StoredPaymentMethod = {
    id: shortId("pm"),
    brand: card.brand,
    last4: card.last4,
    expMonth: card.expMonth,
    expYear: card.expYear,
    createdAt: new Date().toISOString(),
    ...(card.declines && { declines: true }),
  };
  billing.paymentMethods.push(method);
  save(all, accountId, billing);
  return publicMethod(method);
}

/** Removes a card. Removing the Auto Recharge card turns Auto Recharge off. `false` when missing. */
export function removePaymentMethodFor(accountId: string, paymentMethodId: string) {
  const { all, billing } = load(accountId);
  const index = billing.paymentMethods.findIndex((method) => method.id === paymentMethodId);
  if (index === -1) return false;
  billing.paymentMethods.splice(index, 1);
  if (billing.autoRecharge.paymentMethodId === paymentMethodId) {
    billing.autoRecharge = { ...billing.autoRecharge, enabled: false, paymentMethodId: null };
  }
  save(all, accountId, billing);
  return true;
}

/* ---- Auto Recharge ---- */

export function getAutoRechargeFor(accountId: string): AutoRechargeSettings {
  return load(accountId).billing.autoRecharge;
}

export type AutoRechargeUpdate =
  { status: "ok"; settings: AutoRechargeSettings } | { status: "unknown-card" };

/** Saves the settings. Turning off keeps the last values so turning on again is prefilled. */
export function updateAutoRechargeFor(
  accountId: string,
  input: { enabled: boolean; threshold?: number; amount?: number; paymentMethodId?: string },
): AutoRechargeUpdate {
  const { all, billing } = load(accountId);
  if (
    input.paymentMethodId !== undefined &&
    !billing.paymentMethods.some((method) => method.id === input.paymentMethodId)
  ) {
    return { status: "unknown-card" };
  }
  billing.autoRecharge = {
    enabled: input.enabled,
    threshold: input.threshold ?? billing.autoRecharge.threshold,
    amount: input.amount ?? billing.autoRecharge.amount,
    paymentMethodId: input.paymentMethodId ?? billing.autoRecharge.paymentMethodId,
  };
  save(all, accountId, billing);
  return { status: "ok", settings: billing.autoRecharge };
}

/**
 * Runs after every charge to the balance: when Auto Recharge is on and the balance has fallen below
 * the threshold, buys the set amount with the chosen card. A declined card leaves a Failed invoice.
 */
export async function runAutoRechargeFor(accountId: string) {
  const account = await findAccountById(accountId);
  const { billing } = load(accountId);
  const { enabled, threshold, amount, paymentMethodId } = billing.autoRecharge;
  if (!account || !enabled || threshold === null || amount === null || !paymentMethodId) return;
  if (account.creditBalance >= threshold) return;

  const card = billing.paymentMethods.find((method) => method.id === paymentMethodId);
  if (!card) return;
  if (card.declines) {
    recordCharge(accountId, { amount, status: "failed", source: "auto-recharge" });
    return;
  }
  await addCreditsTo(accountId, amount);
  recordCharge(accountId, { amount, status: "completed", source: "auto-recharge" });
}

/* ---- Invoices ---- */

/** Newest first. */
export function listInvoicesFor(
  accountId: string,
  page: number,
  pageSize: number,
): PaginatedResponse<Invoice> {
  const invoices = [...load(accountId).billing.invoices].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    data: invoices.slice((current - 1) * pageSize, current * pageSize).map(publicInvoice),
    page: current,
    pageSize,
    total: invoices.length,
    totalPages,
  };
}

export function getInvoiceFor(accountId: string, invoiceId: string): Invoice | null {
  const invoice = load(accountId).billing.invoices.find((item) => item.id === invoiceId);
  return invoice ? publicInvoice(invoice) : null;
}
