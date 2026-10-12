/** Card number, expiry and security-code helpers shared by the form and the mock payment API. */

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
