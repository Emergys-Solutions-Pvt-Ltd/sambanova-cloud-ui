import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "brand";
export type BadgeSize = "sm" | "md";
export type BadgeShape = "pill" | "rounded";

const variants: Record<BadgeVariant, string> = {
  success: "border-success-border bg-success-bg text-success",
  error: "border-error-border bg-error-bg text-error",
  warning: "border-warning-border bg-warning-bg text-warning",
  info: "border-info-border bg-info-bg text-info",
  neutral: "border-default bg-hover text-secondary",
  brand: "border-transparent bg-brand text-on-brand",
};

/** sm = 10px credit pill in the sidebar; md = 12px status chip in tables. */
const sizes: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-tiny font-medium",
  md: "px-2 py-0.5 text-caption",
};

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** "rounded" (6px corners, thin full-strength border) is the table status chip in Figma. */
  shape?: BadgeShape;
}

const strongBorders: Partial<Record<BadgeVariant, string>> = {
  success: "border-toast-success-line",
  error: "border-toast-error-line",
  warning: "border-toast-warning-line",
  info: "border-toast-info-line",
};

export function Badge({
  variant = "neutral",
  size = "md",
  shape = "pill",
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border leading-none whitespace-nowrap",
        shape === "pill" ? "rounded-full" : "rounded-sm border-(length:--sn-border-thin)",
        variants[variant],
        shape === "rounded" && strongBorders[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
