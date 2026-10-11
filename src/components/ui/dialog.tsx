"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { IconButton } from "./icon-button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type DialogSize = "sm" | "md" | "lg" | "xl";

/**
 * Width and height cap per size, both limited to the viewport: sm 464px (login), md 624px (create
 * project), lg about 858px (Compare Models), xl 633px with a 620px cap so long forms scroll (Add Credits).
 */
const viewportHeight = "max-h-[calc(100dvh-2rem)]";
const sizes: Record<DialogSize, string> = {
  sm: `max-w-116 ${viewportHeight}`,
  md: `max-w-156 ${viewportHeight}`,
  lg: `max-w-214.5 ${viewportHeight}`,
  xl: "max-w-158.25 max-h-[min(calc(var(--spacing)*155),calc(100dvh-2rem))]",
};

const overlayClasses = cn(
  "fixed inset-0 z-overlay bg-overlay",
  "data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in",
);

interface DialogContentProps extends Omit<
  ComponentPropsWithRef<typeof DialogPrimitive.Content>,
  "title"
> {
  /** Visible heading; also the dialog's accessible name. */
  title: ReactNode;
  /** Optional supporting text shown under the title. */
  description?: ReactNode;
  size?: DialogSize;
  /** Pinned below the scrolling body (action buttons), so they stay visible in long forms. */
  footer?: ReactNode;
}

/** Centered modal: overlay, focus trap, Escape and outside-click to close, scrolls inside when tall. */
export function DialogContent({
  title,
  description,
  size = "lg",
  footer,
  className,
  children,
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        // Without a description there is nothing to point aria-describedby at.
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "rounded-lg border border-default bg-surface text-primary shadow-lg outline-none",
          "data-[state=open]:animate-pop-in",
          sizes[size],
          className,
        )}
        {...rest}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogPrimitive.Title className="text-heading-sm font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-body-sm text-secondary">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton icon="close" aria-label="Close" size="sm" />
          </DialogPrimitive.Close>
        </div>
        <div
          className={cn(
            "min-h-0 flex-1 scrollbar-thin overflow-y-auto px-6",
            footer ? "mb-5" : "pb-6",
          )}
        >
          {children}
        </div>
        {footer && <div className="flex justify-end gap-4 px-6 pb-6">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

type DialogPanelProps = Omit<ComponentPropsWithRef<typeof DialogPrimitive.Content>, "title"> & {
  size?: DialogSize;
};

/**
 * Bare modal surface for dialogs with their own header (Figma: login card, r20).
 * Render a `DialogTitle` inside so the dialog has an accessible name.
 */
export function DialogPanel({ size = "sm", className, children, ...rest }: DialogPanelProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
          "rounded-2xl border border-default bg-surface text-primary shadow-lg outline-none",
          "data-[state=open]:animate-pop-in",
          sizes[size],
          className,
        )}
        {...rest}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
