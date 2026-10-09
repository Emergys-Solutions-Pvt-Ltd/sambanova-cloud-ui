"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { IconButton } from "./icon-button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogSize = "sm" | "lg";

/** sm is about 462px (login), lg about 858px (Compare Models); both are capped to the viewport. */
const sizes: Record<DialogSize, string> = { sm: "max-w-115.5", lg: "max-w-214.5" };

interface DialogContentProps extends Omit<
  ComponentPropsWithRef<typeof DialogPrimitive.Content>,
  "title"
> {
  /** Visible heading; also the dialog's accessible name. */
  title: ReactNode;
  /** Optional supporting text shown under the title. */
  description?: ReactNode;
  size?: DialogSize;
}

/** Centered modal: overlay, focus trap, Escape and outside-click to close, scrolls inside when tall. */
export function DialogContent({
  title,
  description,
  size = "lg",
  className,
  children,
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-overlay bg-overlay",
          "data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in",
        )}
      />
      <DialogPrimitive.Content
        // Without a description there is nothing to point aria-describedby at.
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "rounded-xl border border-default bg-surface text-primary shadow-lg outline-none",
          "data-[state=open]:animate-pop-in",
          sizes[size],
          className,
        )}
        {...rest}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogPrimitive.Title className="text-heading-md font-medium">
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
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
