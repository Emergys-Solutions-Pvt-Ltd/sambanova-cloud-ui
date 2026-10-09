"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name, announced when the drawer opens. Not shown visually. */
  title: string;
  /** Element to focus after the drawer closes (the control that opened it). */
  returnFocusTo?: HTMLElement | null;
  children: ReactNode;
  className?: string;
}

/**
 * Left-side sheet: overlay, focus trap, Escape and outside-click to close, and
 * focus returns to the trigger. Built on Radix Dialog for the behaviour only.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  returnFocusTo,
  children,
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-overlay bg-overlay",
            "data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in",
          )}
        />
        <DialogPrimitive.Content
          // No description; the title names the region.
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            if (!returnFocusTo) return;
            event.preventDefault();
            returnFocusTo.focus();
          }}
          className={cn(
            "fixed inset-y-0 left-0 z-drawer flex h-dvh w-(--sn-sidebar-width) max-w-[85vw] flex-col",
            "border-r border-default bg-sidebar shadow-lg outline-none",
            "data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in",
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DrawerClose = DialogPrimitive.Close;
