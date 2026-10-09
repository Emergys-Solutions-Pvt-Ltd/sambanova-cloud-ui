import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

const variants: Record<IconButtonVariant, string> = {
  ghost: "text-secondary hover:bg-hover hover:text-primary",
  outline:
    "border border-button-outline text-secondary hover:bg-button-secondary-hover hover:text-primary",
  solid: "bg-button-primary text-button-primary-fg hover:bg-button-primary-hover",
};

const sizes: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-9", icon: 20 },
  lg: { box: "size-11", icon: 20 },
};

export interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  icon: IconName;
  /** Required: icon-only controls have no visible text. */
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const { box, icon: iconSize } = sizes[size];
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm",
        "transition-colors duration-(--sn-duration-fast) ease-standard disabled:cursor-not-allowed disabled:text-disabled",
        box,
        variants[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
