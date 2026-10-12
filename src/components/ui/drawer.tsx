"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type DrawerSide = "left" | "right";

/** Left: the navigation sheet (sidebar width). Right: a details panel (Figma: Request Details, 420px). */
const sides: Record<DrawerSide, string> = {
  left:
    "left-0 w-(--sn-sidebar-width) max-w-[85vw] border-r bg-sidebar " +
    "data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in",
  right:
    "right-0 w-105 max-w-full border-l bg-drawer " +
    "data-[state=closed]:animate-drawer-out-right data-[state=open]:animate-drawer-in-right",
};

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Accessible name, announced when the drawer opens, shown to screen readers only. Leave it out
   * when the content renders its own visible `<DrawerTitle>`.
   */
  title?: string;
  side?: DrawerSide;
  /** Element to focus after the drawer closes (the control that opened it). */
  returnFocusTo?: HTMLElement | null;
  children: ReactNode;
  className?: string;
}

/**
 * Side sheet: overlay, focus trap, Escape and outside-click to close, and focus returns to the
 * trigger. Built on Radix Dialog for the behaviour only.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  side = "left",
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
            "fixed inset-y-0 z-drawer flex h-dvh flex-col border-default shadow-lg outline-none",
            sides[side],
            className,
          )}
        >
          {title && <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DrawerClose = DialogPrimitive.Close;
export const DrawerTitle = DialogPrimitive.Title;
