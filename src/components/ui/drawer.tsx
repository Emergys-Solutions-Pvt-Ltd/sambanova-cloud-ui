"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type DrawerSide = "left" | "right";
type DrawerSize = "nav" | "panel" | "details";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Accessible name, announced when the drawer opens, shown to screen readers only. Leave it out
   * when the content renders its own visible `<DrawerTitle>`.
   */
  title?: string;
  /** Element to focus after the drawer closes (the control that opened it). */
  returnFocusTo?: HTMLElement | null;
  /** Edge the sheet slides in from. Default left. */
  side?: DrawerSide;
  /**
   * nav = sidebar-width navigation sheet; panel = 290px side panel (Figma: Playground History);
   * details = 420px details panel (Figma: API key Request Details).
   */
  size?: DrawerSize;
  children: ReactNode;
  className?: string;
}

const sides = {
  left: "left-0 border-r data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in",
  right:
    "right-0 border-l data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in",
} as const;

const sizes = {
  nav: "w-(--sn-sidebar-width) max-w-[85vw] border-default bg-sidebar",
  panel: "w-72.5 max-w-[85vw] border-field bg-panel",
  details: "w-105 max-w-full border-default bg-drawer",
} as const;

/**
 * Side sheet: overlay, focus trap, Escape and outside-click to close, and
 * focus returns to the trigger. Built on Radix Dialog for the behaviour only.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  returnFocusTo,
  side = "left",
  size = "nav",
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
            "fixed inset-y-0 z-drawer flex h-dvh flex-col shadow-lg outline-none",
            sides[side],
            sizes[size],
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
