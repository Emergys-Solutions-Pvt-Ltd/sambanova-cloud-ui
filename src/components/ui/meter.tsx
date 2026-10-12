import { cn } from "@/lib/cn";

interface MeterProps {
  /** Spoken name, e.g. "Reasoning". */
  label: string;
  value: number;
  max?: number;
  className?: string;
}

/** Segmented 0–max rating bar (Figma: Reasoning and Speed on model cards). */
export function Meter({ label, value, max = 5, className }: MeterProps) {
  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${max}`}
      className={cn("flex items-center gap-1.25", className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "h-0.75 w-4 rounded-full",
            index < value ? "bg-meter-filled" : "bg-meter-empty",
          )}
        />
      ))}
    </span>
  );
}
