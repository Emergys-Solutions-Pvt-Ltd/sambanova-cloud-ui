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

/** Flat dropdown on the page surface (Figma: Compare Models picker): r8, page color; z-popover so it clears modal dialogs. */
export const dropdownSurface =
  "z-popover rounded-md border border-default bg-surface p-1 text-primary shadow-lg " +
  "data-[state=open]:animate-pop-in";

type PopoverSurface = "menu" | "dropdown";

export function PopoverContent({
  className,
  sideOffset = 8,
  align = "start",
  surface = "menu",
  ...rest
}: ComponentPropsWithRef<typeof PopoverPrimitive.Content> & { surface?: PopoverSurface }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          surface === "menu" ? menuSurface : dropdownSurface,
          "outline-none",
          className,
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
}
