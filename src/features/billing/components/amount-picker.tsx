"use client";

import { useId, useState } from "react";

import { RadioCardGroup } from "@/components/ui/radio-card";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/format";

import { CREDIT_PRESETS } from "../schemas";

const presetOptions = CREDIT_PRESETS.map((amount) => ({
  value: String(amount),
  label: formatUsd(amount),
}));

interface AmountPickerProps {
  /** Chosen amount in whole dollars, or `null` when nothing is chosen yet. */
  value: number | null;
  onChange: (amount: number | null) => void;
  error?: string;
}

/** Preset amounts as radio cards, plus a "$ Custom Amount" field. Picking one clears the other. */
export function AmountPicker({ value, onChange, error }: AmountPickerProps) {
  const customId = useId();
  const errorId = `${customId}-error`;
  const [custom, setCustom] = useState(() =>
    value !== null && !CREDIT_PRESETS.some((preset) => preset === value) ? String(value) : "",
  );

  const selectedPreset = custom || value === null ? null : String(value);

  return (
    <div className="flex flex-col gap-4">
      <RadioCardGroup
        legend="Credit amount"
        options={presetOptions}
        value={selectedPreset}
        onValueChange={(next) => {
          setCustom("");
          onChange(Number(next));
        }}
      />

      <label
        htmlFor={customId}
        className={cn(
          "flex h-13.5 items-center gap-2 rounded-lg border bg-input px-5 text-heading-sm",
          "transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-selected",
          error ? "border-error-border" : custom ? "border-selected" : "border-field",
        )}
      >
        <span aria-hidden="true" className={custom ? "text-primary" : "text-muted"}>
          $
        </span>
        <input
          id={customId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Custom Amount"
          aria-label="Custom amount in US dollars"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={custom}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
            setCustom(digits);
            onChange(digits ? Number(digits) : null);
          }}
          className="min-w-0 flex-1 bg-transparent font-semibold text-primary outline-none placeholder:text-muted"
        />
      </label>

      {error && (
        <p id={errorId} className="-mt-2 text-label text-error italic">
          {error}
        </p>
      )}
    </div>
  );
}
