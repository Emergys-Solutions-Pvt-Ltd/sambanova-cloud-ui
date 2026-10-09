"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

/** Surface shared with DropdownMenuContent: Figma "Dropdown Menu" (r12, raised, large shadow). */
export const menuSurface =
  "z-dropdown rounded-lg border border-subtle bg-menu p-1 text-primary shadow-lg " +
  "data-[state=open]:animate-pop-in";

export function PopoverContent({
  className,
  sideOffset = 8,
  align = "start",
  ...rest
}: ComponentPropsWithRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(menuSurface, "outline-none", className)}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
}
