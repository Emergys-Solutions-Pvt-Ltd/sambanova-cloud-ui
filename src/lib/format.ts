const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usdWithCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** "$20" for whole amounts, "$20.50" otherwise (matches the Figma credit badge). */
export function formatUsd(amount: number) {
  return Number.isInteger(amount) ? usd.format(amount) : usdWithCents.format(amount);
}

/** "John Michaels" → "JM". Falls back to "?" for empty names. */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? "") : "";
  return (first + last).toUpperCase();
}
