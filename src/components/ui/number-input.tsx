"use client";

import { type KeyboardEvent, useState } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

interface NumberInputBaseProps {
  min: number;
  max: number;
  step?: number;
  /**
   * compact = 101 × 48 (Figma: Tuning Parameters "Max Tokens"); form = full-width 45px modal field
   * with the Select `form` stroke (Figma: Enable Auto Recharge).
   */
  variant?: "compact" | "form";
  placeholder?: string;
  /** Shown before the number once there is one, e.g. "$". */
  prefix?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
  className?: string;
}

/** A required value (the field never empties), or with `allowEmpty` a value that starts unset. */
export type NumberInputProps = NumberInputBaseProps &
  (
    | { value: number; onValueChange: (value: number) => void; allowEmpty?: false }
    | {
        value: number | null;
        onValueChange: (value: number | null) => void;
        allowEmpty: true;
      }
  );

const variants = {
  compact: "h-12 w-25.25 pr-2 pl-4",
  form: "h-11.25 w-full pr-3 pl-4",
} as const;

/**
 * Integer field with a chevron stepper. `role="spinbutton"`: Arrow Up / Down ± step, Page Up / Down
 * ± 10 % of the range, Home / End jump to the limits. Typing updates the value live while it is in
 * range; the text is clamped on blur and Enter (an empty `allowEmpty` field becomes `null`). A zero
 * value renders muted, like Figma's pristine Max Tokens.
 */
export function NumberInput(props: NumberInputProps) {
  const {
    value,
    min,
    max,
    step = 1,
    variant = "compact",
    placeholder,
    prefix,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    id,
    disabled,
    invalid,
    onBlur,
    className,
  } = props;
  // Text being typed; null shows `value`. Lets the field be empty or out of range mid-edit.
  const [draft, setDraft] = useState<string | null>(null);

  // Both branches of the union accept a number; only `allowEmpty` fields are ever given null.
  const emit = props.onValueChange as (value: number | null) => void;
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const set = (next: number) => {
    setDraft(null);
    emit(clamp(next));
  };
  const commit = () => {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(null);
      if (props.allowEmpty) emit(null);
      return;
    }
    set(parsed);
  };

  // Stepping from an empty field starts at the lower limit.
  const stepBy = (delta: number) => set(value === null ? min : value + delta);
  const pageStep = Math.max(step, Math.round(((max - min) * 0.1) / step) * step);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => stepBy(step),
      ArrowDown: () => stepBy(-step),
      PageUp: () => stepBy(pageStep),
      PageDown: () => stepBy(-pageStep),
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

  const shown = draft ?? (value === null ? "" : String(value));
  const muted = draft === null && value === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border bg-input",
        variants[variant],
        invalid ? "border-error-border" : "border-field",
        "transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
        disabled && "opacity-40",
        className,
      )}
    >
      {prefix && shown !== "" && (
        <span aria-hidden="true" className="text-body text-primary">
          {prefix}
        </span>
      )}
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
        aria-valuenow={value ?? undefined}
        aria-invalid={invalid ? true : undefined}
        placeholder={placeholder}
        disabled={disabled}
        value={shown}
        onChange={(event) => {
          const text = event.target.value.replace(min < 0 ? /[^\d-]/g : /\D/g, "");
          setDraft(text);
          const parsed = Number.parseInt(text, 10);
          if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) emit(parsed);
          else if (text === "" && props.allowEmpty) emit(null);
        }}
        onBlur={() => {
          commit();
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted disabled:cursor-not-allowed",
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
            onClick={() => stepBy(delta)}
            className="grid place-items-center text-muted transition-colors duration-(--sn-duration-fast) ease-standard hover:text-primary disabled:cursor-not-allowed"
          >
            <Icon name={icon} size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}
