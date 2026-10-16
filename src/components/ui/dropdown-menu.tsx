"use client";

import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { accountMenuSurface, menuSurface } from "./popover";

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = MenuPrimitive.RadioItem;

/** Figma "Dropdown Menu" row icons are drawn at 18px (the 20px icon set scaled, strokes 1.125). */
export const MENU_ICON_SIZE = 18;

export type DropdownMenuSurface = "menu" | "flat" | "compact" | "account";

/**
 * menu = Figma "Dropdown Menu" (bordered, min 224px); flat = borderless raised card without a
 * minimum width (Playground header ⋮); compact = tight column with 10px gaps (History item ⋮);
 * account = sidebar account menu (Figma 11661:24414): menu fill (neutral-800), no stroke, 4px
 * padding, 2px gaps, rows inset with radius 10.
 */
const surfaceClasses: Record<DropdownMenuSurface, string> = {
  menu: cn(menuSurface, "min-w-56 outline-none"),
  account: accountMenuSurface,
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

/** Account menu heading: 30px row, text 15px from the left and 16px from the right (Figma Label). */
const accountLabelClasses =
  "block h-7.5 truncate pr-4 pl-3.75 text-caption leading-7.5 font-medium text-menu-label";

/** Non-interactive heading row (e.g. the signed-in email). */
export function DropdownMenuLabel({
  className,
  variant = "menu",
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Label> & { variant?: DropdownMenuSurface }) {
  return (
    <MenuPrimitive.Label
      className={cn(
        variant === "account" ? accountLabelClasses : "px-4 py-2 text-caption text-menu-label",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Account menu divider (Figma Line 4): takes no height of its own, so the 2px gaps around it stay,
 * and its 1px line is drawn 1px above its position. The project dropdown's divider is the softer
 * gray-700 version (Figma Line 3).
 */
const accountSeparatorBase =
  "relative h-0 w-full after:absolute after:inset-x-0 after:-top-px after:h-px";
const accountSeparatorClasses = `${accountSeparatorBase} after:bg-menu-line`;
export const accountSeparatorSoftClasses = `${accountSeparatorBase} after:bg-menu-line-soft`;

export function DropdownMenuSeparator({
  className,
  variant = "menu",
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Separator> & { variant?: DropdownMenuSurface }) {
  return (
    <MenuPrimitive.Separator
      className={cn(
        variant === "account" ? accountSeparatorClasses : "my-1 h-px bg-menu-line",
        className,
      )}
      {...rest}
    />
  );
}

/** Option row of the Figma "Dropdown Menu": 36px high, edge to edge, 16px sides, 14px Medium. */
export const dropdownRowClasses =
  "flex min-h-9 w-full cursor-pointer items-center gap-2 px-4 py-2 " +
  "text-body leading-5 font-medium text-menu-item outline-none select-none " +
  "data-[highlighted]:bg-hover data-[highlighted]:text-primary " +
  "data-[disabled]:pointer-events-none data-[disabled]:text-disabled";

/** Group heading of the project dropdown (Figma Label): 28px row, text 8px from the top, 15px left, 12px Medium capitals. */
export const accountGroupLabelClasses =
  "block h-7 truncate pt-2 pr-4 pl-3.75 text-caption leading-5 font-medium text-menu-label uppercase";

/** Group heading of the Figma "Dropdown Menu": 28px row, 12px Medium capitals. */
export const dropdownLabelClasses =
  "px-4 py-1 text-caption leading-5 font-medium text-menu-label uppercase";

/** Compare Models picker rows (inset, r10): 36px high, 16px left / 8px right padding, 8px gap. */
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

/** Account menu row (Figma Option, inset r10): 36px high, 16px left / 8px right padding, 8px gap, 14px Regular. */
export const accountMenuItemClasses =
  "flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-item py-2 pr-2 pl-4 " +
  "text-body leading-5 font-normal text-menu-item outline-none select-none " +
  "data-[highlighted]:bg-hover data-[highlighted]:text-primary " +
  "data-[disabled]:pointer-events-none data-[disabled]:text-disabled";

const itemClasses: Record<DropdownMenuSurface, string> = {
  menu: dropdownRowClasses,
  flat: flatMenuItemClasses,
  compact: compactMenuItemClasses,
  account: accountMenuItemClasses,
};

export function DropdownMenuItem({
  className,
  variant = "menu",
  destructive,
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Item> & {
  variant?: DropdownMenuSurface;
  /** Red text for irreversible actions (Figma: "Delete Key"). Works with every variant. */
  destructive?: boolean;
}) {
  const classes = destructive
    ? itemClasses[variant]
        // menu and account rows are text-menu-item, flat and compact rows text-content
        .replace("text-menu-item", "text-error")
        .replace("text-content", "text-error")
        .replace("data-[highlighted]:text-primary", "data-[highlighted]:text-error")
    : itemClasses[variant];
  return <MenuPrimitive.Item className={cn(classes, className)} {...rest} />;
}
