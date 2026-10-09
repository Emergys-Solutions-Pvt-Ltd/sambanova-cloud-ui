import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "brand";
export type BadgeSize = "sm" | "md";

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
}

export function Badge({ variant = "neutral", size = "md", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border leading-none whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
