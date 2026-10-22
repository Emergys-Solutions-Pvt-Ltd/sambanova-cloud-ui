/** Card number, expiry and security-code helpers shared by the form and the mock payment API. */

import { type CardBrand } from "@/types/domain";

export type { CardBrand };

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Groups digits as 4-4-4-4 (Amex: 4-6-5) while typing, up to 19 digits. */
export function formatCardNumber(raw: string) {
  const digits = digitsOnly(raw);
  if (/^3[47]/.test(digits)) {
    const amex = digits.slice(0, 15);
    return [amex.slice(0, 4), amex.slice(4, 10), amex.slice(10)].filter(Boolean).join(" ");
  }
  return (
    digitsOnly(raw)
      .slice(0, 19)
      .match(/.{1,4}/g) ?? []
  ).join(" ");
}

/** Luhn checksum; catches mistyped numbers such as 1234 1234 1234 1234. */
export function isValidCardNumber(value: string) {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** "1" → "1", "125" → "12/5", "1226" → "12/26". Backspacing over the slash just drops it. */
export function formatExpiry(raw: string) {
  const digits = digitsOnly(raw).slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export type ExpiryCheck = "valid" | "invalid" | "expired";

/** MM/YY, month 01-12, and not before the current month. */
export function checkExpiry(value: string, now = new Date()): ExpiryCheck {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return "invalid";

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth) ? "expired" : "valid";
}

export const isValidSecurityCode = (value: string) => /^\d{3,4}$/.test(value);

/** Brands the Billing UI accepts (Figma: the four logos in the card-number field). */
export const CARD_BRAND_NAMES: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
};

/** Brand from the leading digits (IIN ranges), or `null` while unknown or unsupported. */
export function detectCardBrand(value: string): CardBrand | null {
  const digits = digitsOnly(value);
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "mastercard";
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return "discover";
  return null;
}

/** "12/29" → { month: 12, year: 2029 }; `null` when the format is wrong. */
export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  return match ? { month: Number(match[1]), year: 2000 + Number(match[2]) } : null;
}

/** { 9, 2028 } → "09/28" (Figma: card expiry in My Cards). */
export const formatCardExpiry = (month: number, year: number) =>
  `${String(month).padStart(2, "0")}/${String(year % 100).padStart(2, "0")}`;
