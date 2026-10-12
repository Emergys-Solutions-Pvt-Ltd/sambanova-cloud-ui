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

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "start",
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(menuSurface, "min-w-56 outline-none", className)}
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

export function DropdownMenuItem({
  className,
  destructive,
  ...rest
}: ComponentPropsWithRef<typeof MenuPrimitive.Item> & {
  /** Red text for irreversible actions (Figma: "Delete Key"). */
  destructive?: boolean;
}) {
  const classes = destructive
    ? menuItemClasses
        .replace("text-secondary", "text-error")
        .replace("data-[highlighted]:text-primary", "data-[highlighted]:text-error")
    : menuItemClasses;
  return <MenuPrimitive.Item className={cn(classes, className)} {...rest} />;
}
