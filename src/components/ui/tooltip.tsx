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
  align?: "start" | "center" | "end";
  /** Gap between trigger and tooltip in px. Default 10. */
  sideOffset?: number;
  /**
   * inverse = light on dark (app default); surface = dark raised card (Figma: Playground icon
   * buttons); rich = the larger inverse text card (r12, 14px medium, up to 318px) used for explanations.
   */
  variant?: "inverse" | "surface" | "rich";
  className?: string;
}

const variants = {
  inverse: "z-tooltip rounded-md bg-inverse px-3 py-1.5 text-caption text-inverse shadow-md",
  surface:
    "z-tooltip rounded-lg border border-tooltip bg-tooltip px-3 py-2 text-body text-content shadow-sm",
  rich: "z-tooltip max-w-79.5 rounded-lg bg-inverse px-3 py-3 text-label font-medium text-inverse shadow-md",
} as const;

/** Inverse surface (light on dark, dark on light), like Figma's white tooltip; `surface` for the Playground. */
export function Tooltip({
  content,
  children,
  side = "right",
  align,
  sideOffset = 10,
  variant = "inverse",
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            variants[variant],
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
