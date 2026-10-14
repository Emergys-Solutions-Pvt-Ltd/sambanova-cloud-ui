"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import {
  addDays,
  addMonths,
  buildMonthGrid,
  compareDays,
  type DateRange,
  formatDayLabel,
  formatMonthTitle,
  isSameDay,
  isWithinRange,
  orderedRange,
  startOfMonth,
  toISODate,
  WEEKDAY_LABELS,
} from "@/lib/date-range";

import { Icon } from "./icon/icon";

const FULL_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** The left month so that the right month is never after `lastMonth`. */
const clampView = (start: Date, lastMonth: Date) =>
  compareDays(addMonths(start, 1), lastMonth) > 0 ? addMonths(lastMonth, -1) : start;

/** Same day of another month, or the month's last day when it is shorter. */
function shiftMonthKeepingDay(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

interface MonthViewProps {
  month: Date;
  shown: DateRange;
  maxDate: Date;
  /** The one day in the calendar that can be reached with Tab. */
  tabDay: Date;
  onPick: (day: Date) => void;
  onHover: (day: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  className?: string;
}

function MonthView({
  month,
  shown,
  maxDate,
  tabDay,
  onPick,
  onHover,
  onPrevious,
  onNext,
  canGoNext,
  className,
}: MonthViewProps) {
  const titleId = useId();
  const weeks = buildMonthGrid(month);

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex w-67 flex-col items-center gap-2", className)}
    >
      <header className="flex w-full items-start justify-between py-0.5">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPrevious}
          className="-mx-0.5 -my-0.5 flex size-6 items-center justify-center rounded-xs text-primary"
        >
          <Icon name="arrow-left-wide" size={20} />
        </button>
        <h3 id={titleId} aria-live="polite" className="w-31.5 text-center text-caption font-bold">
          {formatMonthTitle(month)}
        </h3>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canGoNext}
          onClick={onNext}
          className="-mx-0.5 -my-0.5 flex size-6 items-center justify-center rounded-xs text-primary disabled:text-disabled"
        >
          <Icon name="arrow-right-wide" size={20} />
        </button>
      </header>

      <table aria-labelledby={titleId} className="w-63 border-collapse">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((label, index) => (
              <th
                key={label}
                scope="col"
                abbr={FULL_WEEKDAYS[index]}
                className="h-8.5 w-9 p-0 text-caption font-semibold text-muted"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td key={dayIndex} className="h-8.5 p-0 text-center align-middle">
                  {day && (
                    <DayButton
                      day={day}
                      shown={shown}
                      disabled={compareDays(day, maxDate) > 0}
                      tabbable={isSameDay(day, tabDay)}
                      onPick={onPick}
                      onHover={onHover}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

interface DayButtonProps {
  day: Date;
  shown: DateRange;
  disabled: boolean;
  tabbable: boolean;
  onPick: (day: Date) => void;
  onHover: (day: Date) => void;
}

function DayButton({ day, shown, disabled, tabbable, onPick, onHover }: DayButtonProps) {
  const start = isSameDay(day, shown.from);
  const end = isSameDay(day, shown.to);
  const endpoint = start || end;

  return (
    <button
      type="button"
      data-day={toISODate(day)}
      aria-label={formatDayLabel(day)}
      aria-pressed={endpoint}
      disabled={disabled}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onPick(day)}
      onMouseEnter={() => onHover(day)}
      onFocus={() => onHover(day)}
      className={cn(
        "flex h-8 w-9 items-center justify-center text-caption font-bold",
        "transition-colors duration-(--sn-duration-fast) ease-standard disabled:text-disabled",
        endpoint
          ? "bg-button-primary text-button-primary-fg enabled:hover:bg-button-primary-hover"
          : isWithinRange(day, shown)
            ? "bg-date-range text-primary"
            : "text-primary enabled:hover:bg-hover",
        start && "rounded-l-md",
        end && "rounded-r-md",
      )}
    >
      {day.getDate()}
    </button>
  );
}

interface RangeCalendarProps {
  /** The committed range, highlighted until the user starts picking a new one. */
  value: DateRange;
  /** Called once both ends are chosen (the second click, in either order). */
  onSelect: (range: DateRange) => void;
  /** Last day that can be picked, usually today. Later days are shown but disabled. */
  maxDate: Date;
  className?: string;
}

/**
 * Two-month range calendar (Figma: Datepicker Dropdown). The first click sets the start, the
 * second sets the end and reports the range; days between are highlighted as the pointer moves.
 * Arrow keys, Home/End and PageUp/PageDown move between days. Below `md` only the later month is shown.
 */
export function RangeCalendar({ value, onSelect, maxDate, className }: RangeCalendarProps) {
  const lastMonth = startOfMonth(maxDate);
  const [viewStart, setViewStart] = useState(() => clampView(addMonths(value.to, -1), lastMonth));
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [focusDay, setFocusDay] = useState(value.to);
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  const rightMonth = addMonths(viewStart, 1);
  const shown = anchor ? orderedRange(anchor, hovered ?? anchor) : value;
  const focusVisible =
    compareDays(startOfMonth(focusDay), viewStart) >= 0 &&
    compareDays(startOfMonth(focusDay), rightMonth) <= 0;
  const tabDay = focusVisible ? focusDay : rightMonth;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${toISODate(focusDay)}"]`)
      ?.focus();
  }, [focusDay, viewStart]);

  const shift = (months: number) =>
    setViewStart((current) => clampView(addMonths(current, months), lastMonth));

  const pick = (day: Date) => {
    setFocusDay(day);
    setHovered(null);
    if (!anchor) {
      setAnchor(day);
      return;
    }
    setAnchor(null);
    onSelect(orderedRange(anchor, day));
  };

  const moveFocus = (day: Date) => {
    const target = compareDays(day, maxDate) > 0 ? maxDate : day;
    const month = startOfMonth(target);
    shouldFocus.current = true;
    setFocusDay(target);
    if (compareDays(month, viewStart) < 0) setViewStart(month);
    else if (compareDays(month, rightMonth) > 0)
      setViewStart(clampView(addMonths(month, -1), lastMonth));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest("[data-day]")) return;
    const steps: Record<string, Date> = {
      ArrowLeft: addDays(focusDay, -1),
      ArrowRight: addDays(focusDay, 1),
      ArrowUp: addDays(focusDay, -7),
      ArrowDown: addDays(focusDay, 7),
      Home: addDays(focusDay, -focusDay.getDay()),
      End: addDays(focusDay, 6 - focusDay.getDay()),
      PageUp: shiftMonthKeepingDay(focusDay, -1),
      PageDown: shiftMonthKeepingDay(focusDay, 1),
    };
    const next = steps[event.key];
    if (!next) return;
    event.preventDefault();
    moveFocus(next);
  };

  const canGoNext = compareDays(rightMonth, lastMonth) < 0;

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} className={cn("flex gap-8", className)}>
      <MonthView
        month={viewStart}
        shown={shown}
        maxDate={maxDate}
        tabDay={tabDay}
        onPick={pick}
        onHover={(day) => anchor && setHovered(day)}
        onPrevious={() => shift(-1)}
        onNext={() => shift(1)}
        canGoNext={canGoNext}
        className="hidden md:flex"
      />
      <MonthView
        month={rightMonth}
        shown={shown}
        maxDate={maxDate}
        tabDay={tabDay}
        onPick={pick}
        onHover={(day) => anchor && setHovered(day)}
        onPrevious={() => shift(-1)}
        onNext={() => shift(1)}
        canGoNext={canGoNext}
      />
      <p role="status" className="sr-only">
        {anchor ? `Start date ${formatDayLabel(anchor)}. Choose an end date.` : ""}
      </p>
    </div>
  );
}
