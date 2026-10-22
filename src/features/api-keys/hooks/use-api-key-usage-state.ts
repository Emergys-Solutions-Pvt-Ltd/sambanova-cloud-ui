"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  compareDays,
  DATE_RANGE_PRESETS,
  DEFAULT_DATE_RANGE_PRESET,
  type DateRangePresetId,
  type DateRangeSelection,
  orderedRange,
  parseISODate,
  resolveSelection,
  startOfDay,
  toISODate,
} from "@/lib/date-range";
import { type UsageRangeParams } from "@/types/domain";

/** Figma's log table shows 7 rows ("Showing 1-7 of 120"). */
export const API_KEY_REQUESTS_PAGE_SIZE = 7;

const presetIds = new Set<string>(DATE_RANGE_PRESETS.map((preset) => preset.id));

const parsePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

/** Reads `?range=` (a shortcut) or `?from=&to=` (two days); anything unusable falls back to the default. */
function parseSelection(searchParams: URLSearchParams, today: Date): DateRangeSelection {
  const preset = searchParams.get("range");
  if (preset && presetIds.has(preset)) {
    return { kind: "preset", preset: preset as DateRangePresetId };
  }

  const from = parseISODate(searchParams.get("from"));
  const to = parseISODate(searchParams.get("to"));
  if (from && to) {
    const range = orderedRange(from, to);
    // Nothing exists after today, so a range reaching into the future ends today.
    if (compareDays(range.from, today) <= 0) {
      return {
        kind: "custom",
        range: compareDays(range.to, today) > 0 ? { from: range.from, to: today } : range,
      };
    }
  }
  return { kind: "preset", preset: DEFAULT_DATE_RANGE_PRESET };
}

/**
 * Writes a selection into `params` as `?range=` (a shortcut) or `?from=&to=`; the default shortcut
 * is left out. Pass the current params to keep the rest of the query; the result is `params`.
 */
export function applySelection(params: URLSearchParams, value: DateRangeSelection) {
  params.delete("range");
  params.delete("from");
  params.delete("to");
  if (value.kind === "preset") {
    if (value.preset !== DEFAULT_DATE_RANGE_PRESET) params.set("range", value.preset);
  } else {
    params.set("from", toISODate(value.range.from));
    params.set("to", toISODate(value.range.to));
  }
  return params;
}

/**
 * The usage page's date range and log page live in the URL (`?range=last-7-days` or
 * `?from=2026-06-01&to=2026-06-20`, plus `&page=2`), so they survive a reload and the back button.
 * Defaults are left out, and changing the range returns to page 1.
 */
export function useApiKeyUsageState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [today] = useState(() => startOfDay(new Date()));

  const selection = parseSelection(new URLSearchParams(searchParams.toString()), today);
  const range = resolveSelection(selection, today);
  const rangeParams: UsageRangeParams = { from: toISODate(range.from), to: toISODate(range.to) };
  const page = parsePage(searchParams.get("page"));

  const replace = useCallback(
    (next: URLSearchParams) => {
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setSelection = useCallback(
    (value: DateRangeSelection) => {
      const next = applySelection(new URLSearchParams(searchParams.toString()), value);
      next.delete("page");
      replace(next);
    },
    [replace, searchParams],
  );

  const setPage = useCallback(
    (value: number) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value > 1) next.set("page", String(value));
      else next.delete("page");
      replace(next);
    },
    [replace, searchParams],
  );

  return { today, selection, rangeParams, page, setSelection, setPage };
}
