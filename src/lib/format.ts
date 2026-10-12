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

const integer = new Intl.NumberFormat("en-US");

/** 1234567 → "1,234,567". */
export function formatNumber(value: number) {
  return integer.format(value);
}

/** "John Michaels" → "JM". Falls back to "?" for empty names. */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? "") : "";
  return (first + last).toUpperCase();
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** "2026-07-12T11:00:00" → "July 12, 2026". */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "2026-07-12T11:00:00" → "11:00 AM". */
export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

const dateTimeDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const dateTimeTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "2026-05-05T09:15:00" → "May 5, 2026 9:15 am". */
export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return `${dateTimeDate.format(date)} ${dateTimeTime.format(date).toLowerCase()}`;
}

/** Elapsed time as "32 min ago", "2 hrs ago", "1 day ago", "1 month ago"; "just now" under a minute. */
export function formatRelativeTime(iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, "hr");
  const days = Math.floor(hours / 24);
  if (days < 30) return plural(days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return plural(months, "month");
  return plural(Math.floor(months / 12), "year");
}

const trimZero = (value: number) => String(Number(value.toFixed(1)));

/** 2_000_000 → "2M tok", 128_000 → "128K tok". */
export function formatTokenCount(tokens: number) {
  if (tokens >= 1_000_000) return `${trimZero(tokens / 1_000_000)}M tok`;
  if (tokens >= 1_000) return `${trimZero(tokens / 1_000)}K tok`;
  return `${tokens} tok`;
}

const monthYearFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-01" → "Jan 2026". */
export function formatMonthYear(yearMonth: string) {
  return monthYearFormat.format(new Date(`${yearMonth}-01T00:00:00Z`));
}
