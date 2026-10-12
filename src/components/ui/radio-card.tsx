"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export interface RadioCardOption {
  value: string;
  label: string;
}

interface RadioCardGroupProps {
  /** Accessible name of the group (not shown). */
  legend: string;
  options: readonly RadioCardOption[];
  /** The selected value, or `null` when none is selected. */
  value: string | null;
  onValueChange: (value: string) => void;
  className?: string;
}

/** Ring with a centre dot (Figma: Radio Button). Follows `currentColor`. */
function RadioMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 19.2 19.2"
      fill="none"
      className={cn("size-4 overflow-visible", className)}
    >
      <circle cx="9.6" cy="9.6" r="8.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.6" cy="9.6" r="3.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Choice cards with a radio mark (Figma: Add Credits amounts). Built on native radio inputs, so
 * arrow keys, Tab and screen-reader semantics come from the browser.
 */
export function RadioCardGroup({
  legend,
  options,
  value,
  onValueChange,
  className,
}: RadioCardGroupProps) {
  const name = useId();

  return (
    <fieldset className={cn("grid grid-cols-3 gap-4", className)}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex h-13.5 items-center justify-between rounded-lg border border-field bg-input pr-4.5 pl-5",
            "text-heading-md transition-colors duration-(--sn-duration-fast) ease-standard",
            "has-checked:border-selected has-focus-visible:border-focus",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            className="peer sr-only"
          />
          {option.label}
          <RadioMark className="text-radio-off peer-checked:text-primary" />
        </label>
      ))}
    </fieldset>
  );
}
