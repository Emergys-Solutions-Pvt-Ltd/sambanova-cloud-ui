import { type CardBrand, type InvoiceStatus } from "@/types/domain";

/**
 * Billing seed for the accounts in fixtures/auth.ts (Figma: Project Settings › Billing
 * `1387:67354`). New sign-ups start with no cards and no invoices, so they see the zero state.
 */

/**
 * Saved cards in Figma's list order, which the list shows newest first. Figma gives Mastercard and
 * Discover the same 9985; Discover gets 1117.
 */
export const SEED_CARDS: {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  addedDaysAgo: number;
}[] = [
  { brand: "visa", last4: "2839", expMonth: 9, expYear: 2028, addedDaysAgo: 30 },
  { brand: "mastercard", last4: "9985", expMonth: 4, expYear: 2032, addedDaysAgo: 60 },
  { brand: "discover", last4: "1117", expMonth: 4, expYear: 2032, addedDaysAgo: 90 },
  { brand: "amex", last4: "5732", expMonth: 4, expYear: 2032, addedDaysAgo: 120 },
];

/** Figma's five invoices in Figma's order; Figma dates them all Jun 12th, 2026, so dates are spread out. */
export const SEED_INVOICES: {
  number: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
}[] = [
  { number: "Inv-0212", amount: 120, status: "completed", createdAt: "2026-09-28T10:12:00Z" },
  { number: "Inv-0112", amount: 420, status: "completed", createdAt: "2026-08-30T15:40:00Z" },
  { number: "Inv-0231", amount: 320, status: "failed", createdAt: "2026-08-12T09:05:00Z" },
  { number: "Inv-0213", amount: 55, status: "completed", createdAt: "2026-07-20T18:22:00Z" },
  { number: "Inv-0123", amount: 50, status: "completed", createdAt: "2026-06-12T11:30:00Z" },
];

/** Limits shared by Add Credits and Auto Recharge (whole US dollars). */
export const CREDIT_AMOUNT_MIN = 5;
export const CREDIT_AMOUNT_MAX = 1000;
export const RECHARGE_THRESHOLD_MIN = 1;
export const RECHARGE_THRESHOLD_MAX = 1000;

/** Test card the mock payment provider always declines. */
export const DECLINED_TEST_CARD = "4000000000000002";
