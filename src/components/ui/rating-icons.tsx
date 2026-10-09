import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type RatingKind = "bulb" | "bolt";

interface RatingIconsProps {
  kind: RatingKind;
  value: number;
  max?: number;
  /** Spoken name, e.g. "Reasoning". */
  label: string;
  className?: string;
}

/** Same 18px grid as the Figma icons. Filled shapes use currentColor; empty ones are outlines. */
function Bulb({ filled }: { filled: boolean }) {
  return filled ? (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M6.3 10.8C5.54 10.23 4.99 9.44 4.7 8.54C4.42 7.64 4.43 6.67 4.73 5.78C5.03 4.88 5.6 4.1 6.37 3.55C7.14 3 8.06 2.7 9 2.7C9.94 2.7 10.87 3 11.63 3.55C12.4 4.1 12.97 4.88 13.27 5.78C13.57 6.67 13.58 7.64 13.3 8.54C13.01 9.44 12.46 10.23 11.7 10.8C11.35 11.15 11.08 11.57 10.93 12.04C10.77 12.51 10.73 13.01 10.8 13.5C10.8 13.98 10.61 14.43 10.27 14.77C9.94 15.11 9.48 15.3 9 15.3C8.52 15.3 8.06 15.11 7.73 14.77C7.39 14.43 7.2 13.98 7.2 13.5C7.27 13.01 7.23 12.51 7.07 12.04C6.92 11.57 6.65 11.15 6.3 10.8Z" />
      {/* The base line is knocked out of the filled bulb in Figma. */}
      <path
        d="M6.21 11.54H11.61"
        fill="none"
        stroke="var(--sn-bg-input)"
        strokeWidth="1.16"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 18 18"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.13"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.45 10.7C5.74 10.17 5.21 9.42 4.94 8.57C4.68 7.72 4.69 6.8 4.97 5.96C5.25 5.11 5.79 4.37 6.51 3.85C7.24 3.33 8.11 3.05 9 3.05C9.89 3.05 10.76 3.33 11.49 3.85C12.21 4.37 12.75 5.11 13.03 5.96C13.31 6.8 13.32 7.72 13.06 8.57C12.79 9.42 12.26 10.17 11.55 10.7C11.22 11.03 10.97 11.43 10.82 11.87C10.67 12.32 10.63 12.79 10.7 13.25C10.7 13.7 10.52 14.13 10.2 14.45C9.88 14.77 9.45 14.95 9 14.95C8.55 14.95 8.12 14.77 7.8 14.45C7.48 14.13 7.3 13.7 7.3 13.25C7.37 12.79 7.33 12.32 7.18 11.87C7.03 11.43 6.78 11.03 6.45 10.7Z" />
      <path d="M7.04 11.55H10.95" />
    </svg>
  );
}

function Bolt({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="18"
      height="18"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.13"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.75 2.25V7.5H14.25L8.25 15.75V10.5H3.75L9.75 2.25Z" />
    </svg>
  );
}

const shapes: Record<RatingKind, (props: { filled: boolean }) => ReactNode> = {
  bulb: Bulb,
  bolt: Bolt,
};

/** Row of 0–max icons for model ratings (Reasoning: bulbs, Speed: bolts). */
export function RatingIcons({ kind, value, max = 5, label, className }: RatingIconsProps) {
  const Shape = shapes[kind];
  return (
    <span
      role="img"
      aria-label={`${label}: ${value} of ${max}`}
      className={cn("flex items-center text-secondary", className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <Shape key={index} filled={index < value} />
      ))}
    </span>
  );
}
