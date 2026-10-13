import { formatDayWithYear, formatShortDay, isSameDay, parseISODate } from "@/lib/date-range";
import { type ApiKeyUsageSeriesPoint } from "@/types/domain";

/** A run of consecutive days plotted as one point of a chart. */
export interface UsageBucket {
  start: Date;
  end: Date;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

/** Whole-day bucket sizes, so a long range groups into days, weeks and so on rather than odd sizes. */
const BUCKET_DAYS = [1, 2, 3, 7, 14, 30, 60, 90, 180, 365];

/**
 * Groups the daily points so a chart shows at most `maxPoints` points: one per day while they fit,
 * then 2, 3, 7, 14 ... days per point (Last 30 days with 11 points gives one point every 3 days).
 * Tokens are summed; the last point may cover fewer days.
 */
export function bucketUsage(points: ApiKeyUsageSeriesPoint[], maxPoints: number): UsageBucket[] {
  const needed = Math.ceil(points.length / maxPoints);
  const size = BUCKET_DAYS.find((days) => days >= needed) ?? needed;

  const buckets: UsageBucket[] = [];
  for (let index = 0; index < points.length; index += size) {
    const group = points.slice(index, index + size);
    const first = group[0];
    const last = group[group.length - 1];
    const start = parseISODate(first?.date);
    const end = parseISODate(last?.date);
    if (!first || !last || !start || !end) continue;

    buckets.push({
      start,
      end,
      inputTokens: group.reduce((sum, point) => sum + point.inputTokens, 0),
      outputTokens: group.reduce((sum, point) => sum + point.outputTokens, 0),
      cachedTokens: group.reduce((sum, point) => sum + point.cachedTokens, 0),
    });
  }
  return buckets;
}

/** Axis label of a point: the day it starts on ("Jun 25"). */
export const bucketLabel = (bucket: UsageBucket) => formatShortDay(bucket.start);

/** Tooltip heading: "Jul 16, 2026" for one day, "Jul 13 - Jul 15, 2026" for a run of days. */
export function bucketTitle({ start, end }: UsageBucket) {
  if (isSameDay(start, end)) return formatDayWithYear(start);
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatShortDay(start)} – ${formatShortDay(end)}, ${end.getFullYear()}`;
  }
  return `${formatDayWithYear(start)} – ${formatDayWithYear(end)}`;
}
