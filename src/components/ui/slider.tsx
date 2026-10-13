"use client";

import { type CSSProperties } from "react";

import { cn } from "@/lib/cn";

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max: number;
  step?: number;
  /** Required: the slider shows no visible label of its own. */
  "aria-label": string;
  /** Text under the left end of the track, e.g. "0". */
  minLabel?: string;
  /** Text under the right end of the track, e.g. "8,192". */
  maxLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-thumb slider with an always-visible value bubble (Figma: Tuning Parameters "Max Tokens").
 * A native range input, so arrows, Page Up / Down and Home / End work without extra code; the
 * `range-slider` utility draws the 4px brand track and the 12px knob. The top padding reserves
 * room for the bubble, so the block is 63px tall like Figma.
 */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max,
  step = 1,
  "aria-label": ariaLabel,
  minLabel,
  maxLabel,
  id,
  disabled,
  className,
}: SliderProps) {
  const span = max - min;
  const fraction = span > 0 ? Math.min(1, Math.max(0, (value - min) / span)) : 0;
  const display = value.toLocaleString("en-US");

  return (
    <div className={cn("flex w-full flex-col pt-5.5", className)}>
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuetext={display}
          onChange={(event) => onValueChange(Number(event.target.value))}
          className="range-slider block w-full disabled:cursor-not-allowed disabled:opacity-40"
          style={{ "--range-fill": `${fraction * 100}%` } as CSSProperties}
        />
        <span
          aria-hidden="true"
          // The knob is 12px wide, so its centre travels from 6px to (100% - 6px).
          style={{ left: `calc(6px + (100% - 12px) * ${fraction})` }}
          className={cn(
            "pointer-events-none absolute bottom-[calc(100%+3px)] min-w-5 -translate-x-1/2",
            "rounded-xs bg-slider-bubble px-1 text-center text-tiny leading-4 whitespace-nowrap text-on-brand",
            "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2",
            "after:border-x-[3px] after:border-t-[3px] after:border-x-transparent after:border-t-slider-bubble",
          )}
        >
          {display}
        </span>
      </div>
      {(minLabel !== undefined || maxLabel !== undefined) && (
        <div
          aria-hidden="true"
          className="mt-2 flex justify-between text-caption leading-tight font-normal text-content"
        >
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
