import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "brand";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "pill" | "rounded" | "capsule";

const variants: Record<BadgeVariant, string> = {
  success: "border-success-border bg-success-bg text-success",
  error: "border-error-border bg-error-bg text-error",
  warning: "border-warning-border bg-warning-bg text-warning",
  info: "border-info-border bg-info-bg text-info",
  neutral: "border-default bg-hover text-secondary",
  brand: "border-transparent bg-brand text-on-brand",
};

/**
 * sm = 10px credit pill in the sidebar; md = 12px status chip in tables; lg = the 22px high
 * 12/18 chip with 10px sides (Figma "Badge" in the Project Settings tables, e.g. Invoices).
 */
const sizes: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-tiny font-medium leading-none",
  md: "px-2 py-0.5 text-caption leading-none",
  lg: "px-2.5 py-0.5 text-caption",
};

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /**
   * "rounded" (6px corners, thin full-strength border) is the table status chip in Figma.
   * "capsule" is the same thin border on a fully rounded, 18px high chip (Request Details drawer).
   */
  shape?: BadgeShape;
}

const shapes: Record<BadgeShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-sm border-(length:--sn-border-thin)",
  capsule: "rounded-full border-(length:--sn-border-thin)",
};

const strongBorders: Partial<Record<BadgeVariant, string>> = {
  success: "border-toast-success-line",
  error: "border-toast-error-line",
  warning: "border-toast-warning-line",
  info: "border-toast-info-line",
  neutral: "border-(--sn-text-muted) text-muted",
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
        "inline-flex shrink-0 items-center border whitespace-nowrap",
        shapes[shape],
        variants[variant],
        shape !== "pill" && strongBorders[variant],
        shape === "capsule" ? "h-4.5 px-2.5 text-caption leading-none" : sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
