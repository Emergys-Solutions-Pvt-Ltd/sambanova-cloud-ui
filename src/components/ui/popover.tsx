"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

const menuSurfaceBase =
  "overflow-hidden rounded-lg border border-dropdown bg-dropdown pt-2 pb-1.5 text-primary shadow-lg data-[state=open]:animate-pop-in";

/**
 * Surface shared with DropdownMenuContent: Figma "Dropdown Menu" (r12, near-black fill, gray-800 stroke,
 * large shadow, 8px above the first row and 6px below the last; rows run edge to edge).
 */
export const menuSurface = `z-dropdown ${menuSurfaceBase}`;

/**
 * Sidebar menus (Figma "Dropdown Menu": account menu 11661:24414 and project dropdown 1907:196446):
 * menu fill (neutral-800), no stroke, radius 12, 4px padding, 2px gaps, large shadow. Rows inset with
 * radius 10 (see `accountMenuItemClasses`).
 */
export const accountMenuSurface =
  "z-dropdown flex flex-col gap-0.5 rounded-lg bg-menu p-1 text-primary shadow-lg " +
  "data-[state=open]:animate-pop-in outline-none";

/** Same surface layered above modal dialogs, for menus that open from inside one (e.g. a Select in a form). */
export const menuSurfaceAboveModal = `z-popover ${menuSurfaceBase}`;

/** Dropdown list of a form field (Figma: Grace Period options): input fill, field border, r8, 2px padding. */
export const fieldDropdownSurface =
  "z-popover rounded-md border border-field bg-input p-0.5 text-primary shadow-lg " +
  "data-[state=open]:animate-pop-in";

/** Flat dropdown on the page surface (Figma: Compare Models picker): r8, page color, no stroke, soft shadow; z-popover so it clears modal dialogs. */
export const dropdownSurface =
  "z-popover rounded-md bg-surface p-1 text-primary shadow-picker " +
  "data-[state=open]:animate-pop-in";

/** Content panel with its own layout (Figma: Datepicker Dropdown): input fill, r8, small shadow, 16/20px padding. */
export const panelSurface =
  "z-popover rounded-md border border-default bg-input px-4 py-5 text-primary shadow-sm " +
  "data-[state=open]:animate-pop-in";

type PopoverSurface = "menu" | "dropdown" | "panel" | "account";

const surfaces: Record<PopoverSurface, string> = {
  menu: menuSurface,
  account: accountMenuSurface,
  dropdown: dropdownSurface,
  panel: panelSurface,
};

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
        className={cn(surfaces[surface], "outline-none", className)}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
}
