"use client";

import { type KeyboardEvent, useRef } from "react";

import { cn } from "@/lib/cn";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

export interface PillRadioGroupProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly PillOption<T>[];
  /** Name the group with a visible label (`aria-labelledby`) or `aria-label`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Pill segmented radio group (Figma: Edit Permissions "Pill Selector"): one 79px pill per option on
 * a rounded track. Arrow keys move and select, Home/End jump; only the checked pill is a tab stop.
 */
export function PillRadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  disabled,
  className,
  ...labelling
}: PillRadioGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const select = (index: number) => {
    const option = options[index];
    if (!option) return;
    onValueChange(option.value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cn("inline-flex shrink-0 rounded-full bg-input p-0.75", className)}
      {...labelling}
    >
      {options.map((option, index) => {
        const checked = index === checkedIndex;
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "w-19.75 rounded-full py-1.5 text-caption leading-[1.2] font-medium whitespace-nowrap",
              "transition-colors duration-(--sn-duration-fast) ease-standard",
              checked ? "bg-selected text-on-brand" : "text-muted enabled:hover:text-primary",
              "disabled:cursor-not-allowed",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
