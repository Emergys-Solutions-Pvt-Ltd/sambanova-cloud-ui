import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant =
  "success" | "error" | "warning" | "info" | "neutral" | "brand" | "edited";
export type BadgeSize = "sm" | "md" | "lg" | "status";
export type BadgeShape = "pill" | "rounded" | "capsule";

/**
 * Colours per variant, in two complete sets so that no element ever carries two classes for the same
 * property (`cn()` only joins names, the CSS order would decide): `pill` badges use the soft tinted
 * border; `rounded` and `capsule` badges (Figma status chips) draw their hairline at full strength in
 * the text colour (Figma: stroke = text colour, e.g. the Active badge has green-400 on green-400 text).
 */
const softColors: Record<BadgeVariant, string> = {
  success: "border-success-border bg-success-bg text-success",
  error: "border-error-border bg-error-bg text-error",
  warning: "border-warning-border bg-warning-bg text-warning",
  info: "border-info-border bg-info-bg text-info",
  neutral: "border-default bg-hover text-secondary",
  brand: "border-transparent bg-brand text-on-brand",
  /** Figma "Edited" tag (API Keys table): muted text and hairline over the 8% green tint of the success badge. */
  edited: "border-(--sn-text-muted) bg-success-bg text-muted",
};

const hairlineColors: Record<BadgeVariant, string> = {
  success: "border-current bg-success-bg text-success",
  error: "border-current bg-error-bg text-error",
  warning: "border-current bg-warning-bg text-warning",
  info: "border-current bg-info-bg text-info",
  neutral: "border-current bg-hover text-muted",
  brand: softColors.brand,
  edited: softColors.edited,
};

/**
 * sm = 10px credit pill in the sidebar; md = 12px status chip in tables; lg = 22px, 11px text
 * (Compare Models highlight); status = the 22px high chip of Figma's "Badge" (API Keys Active,
 * Disabled and Edited; Project Settings Invoices), 12px Medium text on an 18px line. Each size sets
 * its own line height, so none of them depends on a shared `leading-*` class.
 * status: Figma pads 10 / 2 with the 0.5px stroke outside (54x22 box); the 1px border counts
 * inside here, so the padding is 9 / 1.
 */
const sizes: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-tiny font-medium leading-none",
  md: "px-2 py-0.5 text-caption leading-none",
  lg: "h-5.5 px-[7.7px] text-micro font-medium leading-none",
  status: "px-2.25 py-0.25 text-caption font-medium leading-normal",
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
        shape === "pill" ? softColors[variant] : hairlineColors[variant],
        shape === "capsule" && size !== "lg"
          ? "h-4.5 px-2.5 text-caption leading-none"
          : sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
