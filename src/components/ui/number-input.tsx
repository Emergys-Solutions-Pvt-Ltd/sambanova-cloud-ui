"use client";

import { type KeyboardEvent, useState } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

export interface NumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 101 × 48 integer field with a chevron stepper (Figma: Tuning Parameters "Max Tokens").
 * `role="spinbutton"`: Arrow Up / Down ± step, Page Up / Down ± 10 % of the range, Home / End
 * jump to the limits. Typing updates the value live while it is in range; the text is clamped
 * on blur and Enter. A zero value renders muted, like Figma's pristine state.
 */
export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  id,
  disabled,
  className,
}: NumberInputProps) {
  // Text being typed; null shows `value`. Lets the field be empty or out of range mid-edit.
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const set = (next: number) => {
    setDraft(null);
    onValueChange(clamp(next));
  };
  const commit = () => {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    set(Number.isNaN(parsed) ? value : parsed);
  };

  const pageStep = Math.max(step, Math.round(((max - min) * 0.1) / step) * step);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => set(value + step),
      ArrowDown: () => set(value - step),
      PageUp: () => set(value + pageStep),
      PageDown: () => set(value - pageStep),
      Home: () => set(min),
      End: () => set(max),
      Enter: commit,
    };
    const action = keys[event.key];
    if (!action) return;
    // Enter inside a dialog form should only commit, not submit.
    event.preventDefault();
    action();
  };

  const shown = draft ?? String(value);
  const muted = draft === null && value === 0;

  return (
    <div
      className={cn(
        "flex h-12 w-25.25 items-center gap-1 rounded-md border border-field bg-input pr-2 pl-4",
        "transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
        disabled && "opacity-40",
        className,
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        disabled={disabled}
        value={shown}
        onChange={(event) => {
          const text = event.target.value.replace(min < 0 ? /[^\d-]/g : /\D/g, "");
          setDraft(text);
          const parsed = Number.parseInt(text, 10);
          if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) onValueChange(parsed);
        }}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full min-w-0 flex-1 bg-transparent text-body outline-none disabled:cursor-not-allowed",
          muted ? "text-muted" : "text-primary",
        )}
      />
      <div aria-hidden="true" className="flex shrink-0 flex-col">
        {(
          [
            { icon: "chevron-up", delta: step },
            { icon: "chevron-down", delta: -step },
          ] as const
        ).map(({ icon, delta }) => (
          <button
            key={icon}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            // Keep focus (and any draft) in the input while stepping with the mouse.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => set(value + delta)}
            className="grid place-items-center text-muted transition-colors duration-(--sn-duration-fast) ease-standard hover:text-primary disabled:cursor-not-allowed"
          >
            <Icon name={icon} size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}
