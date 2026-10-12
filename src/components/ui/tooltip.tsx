"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Mount once near the root (AppShell does). */
export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  content: ReactNode;
  /** The element that triggers the tooltip; must accept a ref and DOM props. */
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** "rich" is the larger text card (r12, 14px medium, up to 318px) used for explanations. */
  variant?: "label" | "rich";
  className?: string;
}

/** Inverse surface (light on dark, dark on light), like Figma's white tooltip. */
export function Tooltip({
  content,
  children,
  side = "right",
  variant = "label",
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={10}
          className={cn(
            "z-tooltip bg-inverse text-inverse shadow-md",
            variant === "rich"
              ? "max-w-79.5 rounded-lg px-3 py-3 text-label font-medium"
              : "rounded-md px-3 py-1.5 text-caption",
            "data-[state=delayed-open]:animate-pop-in data-[state=instant-open]:animate-pop-in",
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
