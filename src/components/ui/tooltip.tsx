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
  className?: string;
}

/** Inverse surface (light on dark, dark on light), like Figma's white tooltip. */
export function Tooltip({ content, children, side = "right", className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={10}
          className={cn(
            "z-tooltip rounded-md bg-inverse px-3 py-1.5 text-caption text-inverse shadow-md",
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
