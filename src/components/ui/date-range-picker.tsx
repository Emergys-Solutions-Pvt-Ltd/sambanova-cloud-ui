"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import {
  DATE_RANGE_PRESETS,
  type DateRangeSelection,
  formatSelectionLabel,
  resolveSelection,
} from "@/lib/date-range";

import { Icon } from "./icon/icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { RangeCalendar } from "./range-calendar";

interface DateRangePickerProps {
  selection: DateRangeSelection;
  onSelectionChange: (selection: DateRangeSelection) => void;
  /** Today. Shortcuts count back from it and later days cannot be picked. */
  today: Date;
  /** Accessible name of the button; the current choice is appended. */
  "aria-label"?: string;
  className?: string;
}

/**
 * Date range filter (Figma: "Last 30 days" button with its Datepicker Dropdown). The button shows
 * the chosen shortcut or the two dates; the panel lists the shortcuts beside a two-month calendar.
 * Choosing a shortcut or the second day of a range applies it and closes the panel.
 */
export function DateRangePicker({
  selection,
  onSelectionChange,
  today,
  "aria-label": ariaLabel = "Date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const range = resolveSelection(selection, today);
  const label = formatSelectionLabel(selection);

  const apply = (next: DateRangeSelection) => {
    onSelectionChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${ariaLabel}: ${label}`}
          // Figma draws the 1px border inside the 16px padding, so the padding is 15px here.
          className={cn(
            "flex h-9.25 w-full items-center gap-2.5 rounded-md border border-field bg-input px-3.75 text-left text-body text-primary",
            "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <Icon name="calendar" size={18} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        surface="panel"
        align="end"
        aria-label="Choose a date range"
        className="flex max-h-(--radix-popover-content-available-height) max-w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-y-auto md:flex-row"
      >
        <ul className="flex w-33.5 shrink-0 flex-col">
          {DATE_RANGE_PRESETS.map(({ id, label: presetLabel }) => {
            const active = selection.kind === "preset" && selection.preset === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-current={active || undefined}
                  onClick={() => apply({ kind: "preset", preset: id })}
                  className={cn(
                    "flex min-h-9 w-full items-center gap-2 rounded-item py-2 pr-1 pl-4 text-left text-body text-content",
                    "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{presetLabel}</span>
                  {active && <Icon name="check" size={18} />}
                </button>
              </li>
            );
          })}
        </ul>

        <div
          aria-hidden="true"
          className="self-stretch border-l border-default max-md:border-t max-md:border-l-0"
        />

        <RangeCalendar
          value={range}
          maxDate={today}
          onSelect={(next) => apply({ kind: "custom", range: next })}
        />
      </PopoverContent>
    </Popover>
  );
}
