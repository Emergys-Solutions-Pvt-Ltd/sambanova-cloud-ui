/**
 * Calendar-day helpers for the date range picker and the API key usage filters. Days are local
 * dates (midnight), never timestamps, so "Jun 25" means the same day wherever the code runs.
 */

/** An inclusive range of days; `from` is never after `to`. */
export interface DateRange {
  from: Date;
  to: Date;
}

export type DateRangePresetId =
  "week-to-date" | "month-to-date" | "last-7-days" | "last-14-days" | "last-30-days";

/** Shortcuts from the Figma Datepicker, in the order they are listed. */
export const DATE_RANGE_PRESETS: readonly { id: DateRangePresetId; label: string }[] = [
  { id: "week-to-date", label: "Week to date" },
  { id: "month-to-date", label: "Month to date" },
  { id: "last-7-days", label: "Last 7 days" },
  { id: "last-14-days", label: "Last 14 days" },
  { id: "last-30-days", label: "Last 30 days" },
];

export const DEFAULT_DATE_RANGE_PRESET: DateRangePresetId = "last-30-days";

/** What the user picked: a shortcut (stays relative to today) or two explicit days. */
export type DateRangeSelection =
  { kind: "preset"; preset: DateRangePresetId } | { kind: "custom"; range: DateRange };

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** First day of the month `months` away from `date`'s month. */
export const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Negative when `a` is before `b`, ignoring the time of day. */
export const compareDays = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();

/** The two days in order, so a range picked "backwards" still has `from <= to`. */
export function orderedRange(a: Date, b: Date): DateRange {
  return compareDays(a, b) <= 0
    ? { from: startOfDay(a), to: startOfDay(b) }
    : { from: startOfDay(b), to: startOfDay(a) };
}

export const isWithinRange = (day: Date, { from, to }: DateRange) =>
  compareDays(day, from) >= 0 && compareDays(day, to) <= 0;

/** Number of days in the range, both ends included. */
export const countDays = ({ from, to }: DateRange) =>
  Math.round(compareDays(to, from) / 86_400_000) + 1;

export function presetRange(preset: DateRangePresetId, today: Date): DateRange {
  const to = startOfDay(today);
  switch (preset) {
    case "week-to-date":
      // Weeks start on Sunday, like the calendar.
      return { from: addDays(to, -to.getDay()), to };
    case "month-to-date":
      return { from: startOfMonth(to), to };
    case "last-7-days":
      return { from: addDays(to, -6), to };
    case "last-14-days":
      return { from: addDays(to, -13), to };
    case "last-30-days":
      return { from: addDays(to, -29), to };
  }
}

export function resolveSelection(selection: DateRangeSelection, today: Date): DateRange {
  return selection.kind === "preset" ? presetRange(selection.preset, today) : selection.range;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** "2026-06-25" (local date). */
export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Parses "2026-06-25" into a local date; anything else (including "2026-02-31") gives `null`. */
export function parseISODate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

const labelFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "Jul 16, 2026". */
export const formatDayWithYear = (day: Date) => labelFormat.format(day);

const shortDayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** "Jun 25" (chart axis labels). */
export const formatShortDay = (day: Date) => shortDayFormat.format(day);

/** "Jun 25, 2026 – Jul 24, 2026", or just "Jun 25, 2026" for a single day. */
export function formatRangeLabel({ from, to }: DateRange) {
  if (isSameDay(from, to)) return labelFormat.format(from);
  return `${labelFormat.format(from)} – ${labelFormat.format(to)}`;
}

/** Label of the picker button: the shortcut's name, or the two dates. */
export function formatSelectionLabel(selection: DateRangeSelection) {
  if (selection.kind === "custom") return formatRangeLabel(selection.range);
  return DATE_RANGE_PRESETS.find((item) => item.id === selection.preset)?.label ?? "";
}

const monthTitleFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

/** "June 2026". */
export const formatMonthTitle = (month: Date) => monthTitleFormat.format(month);

const dayLabelFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

/** "June 25, 2026", for screen readers. */
export const formatDayLabel = (day: Date) => dayLabelFormat.format(day);

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * The weeks of a month, Sunday first. Days of the neighbouring months are `null` so the grid
 * keeps its shape without showing them.
 */
export function buildMonthGrid(month: Date): (Date | null)[][] {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}
