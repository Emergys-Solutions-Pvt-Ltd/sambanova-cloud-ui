"use client";

import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { menuSurface } from "./popover";

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = MenuPrimitive.RadioItem;

export type DropdownMenuSurface = "menu" | "flat" | "compact";

/**
 * menu = Figma "Dropdown Menu" (bordered, min 224px); flat = borderless raised card without a
 * minimum width (Playground header ⋮); compact = tight column with 10px gaps (History item ⋮).
 */
const surfaceClasses: Record<DropdownMenuSurface, string> = {
  menu: cn(menuSurface, "min-w-56 outline-none"),
  flat: "z-dropdown rounded-lg bg-surface-raised p-1 text-primary shadow-lg data-[state=open]:animate-pop-in outline-none",
  compact:
    "z-dropdown flex flex-col gap-2.5 rounded-lg bg-surface-raised p-2.5 text-primary shadow-lg " +
    "data-[state=open]:animate-pop-in outline-none",
};

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "start",
  surface = "menu",
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Content> & { surface?: DropdownMenuSurface }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(surfaceClasses[surface], className)}
        {...rest}
      />
    </MenuPrimitive.Portal>
  );
}

/** Non-interactive heading row (e.g. the signed-in email). */
export function DropdownMenuLabel({
  className,
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      className={cn("px-4 py-2 text-caption text-menu-label", className)}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn("my-1 h-px bg-menu-line", className)} {...rest} />;
}

/** Row geometry from Figma: 36px high, r10, 16px left / 8px right padding, 8px gap. */
export const menuItemClasses =
  "flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-item py-2 pr-2 pl-4 " +
  "text-body text-secondary outline-none select-none " +
  "data-[highlighted]:bg-hover data-[highlighted]:text-primary " +
  "data-[disabled]:pointer-events-none data-[disabled]:text-disabled";

/** Playground ⋮ row: 36px min, r10, 16px sides, option-hover fill, content-coloured text. */
export const flatMenuItemClasses =
  "flex min-h-9 w-full cursor-pointer items-start gap-2 rounded-item px-4 py-2 text-body leading-5 text-content " +
  "outline-none select-none data-[highlighted]:bg-option-hover " +
  "data-[disabled]:pointer-events-none data-[disabled]:text-disabled";

/** History item ⋮ row: 22px high, caption text, hover box bleeding 4px past the text. */
export const compactMenuItemClasses =
  "-mx-1 flex h-5.5 cursor-pointer items-center gap-2.5 rounded-xs px-1 text-caption leading-5.5 font-normal " +
  "text-content outline-none select-none data-[highlighted]:bg-option-hover";

const itemClasses: Record<DropdownMenuSurface, string> = {
  menu: menuItemClasses,
  flat: flatMenuItemClasses,
  compact: compactMenuItemClasses,
};

export function DropdownMenuItem({
  className,
  variant = "menu",
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Item> & { variant?: DropdownMenuSurface }) {
  return <MenuPrimitive.Item className={cn(itemClasses[variant], className)} {...rest} />;
}
