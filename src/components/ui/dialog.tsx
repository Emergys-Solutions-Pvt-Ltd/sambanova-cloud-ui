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

type DialogSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Width and height cap per size, both limited to the viewport: sm 464px (login), md 624px (create
 * project), lg about 858px (Compare Models), xl 633px with a 620px cap so long forms scroll (Add Credits).
 */
const viewportHeight = "max-h-[calc(100dvh-2rem)]";
const sizes: Record<DialogSize, string> = {
  xs: `max-w-110.25 ${viewportHeight}`,
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
  /** default = app modals; subtle = Playground dialogs (subtle border, muted description, 24px header gap). */
  variant?: DialogVariant;
  /** Body starts 16px under the header bar instead of 24px (Figma: Modal body of Compare Models). Bar header only. */
  tightBody?: boolean;
}

type DialogVariant = "default" | "subtle";

/** Per-variant shell classes; kept as separate maps so no variant overrides another through `className`. */
const variantClasses: Record<
  DialogVariant,
  { border: string; header: string; heading: string; description: string }
> = {
  default: {
    border: "border-default",
    header: "pb-4",
    heading: "gap-1",
    description: "text-body-sm text-secondary",
  },
  subtle: {
    border: "border-subtle",
    header: "pb-6",
    heading: "gap-0.5",
    description: "text-body-sm leading-tight text-muted",
  },
};

/** Centered modal: overlay, focus trap, Escape and outside-click to close, scrolls inside when tall. */
export function DialogContent({
  title,
  description,
  size = "lg",
  footer,
  variant = "default",
  tightBody,
  className,
  children,
  ...rest
}: DialogContentProps) {
  const styles = variantClasses[variant];
  // Without a description the default header is a 64px bar with the title centred (Figma: Create
  // API key). The subtle (Playground) dialogs keep their own header whatever they contain.
  const barHeader = !description && variant === "default";
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        // Without a description there is nothing to point aria-describedby at.
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "rounded-lg border bg-surface text-primary shadow-lg outline-none",
          styles.border,
          "data-[state=open]:animate-pop-in",
          sizes[size],
          className,
        )}
        {...rest}
      >
        <div
          className={cn(
            "flex justify-between gap-4 px-6",
            barHeader ? "h-16 shrink-0 items-center" : cn("items-start pt-6", styles.header),
          )}
        >
          <div className={cn("flex min-w-0 flex-col", styles.heading)}>
            <DialogPrimitive.Title className="text-heading-sm font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className={styles.description}>
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            {variant === "subtle" ? (
              // -m-2 keeps the 20px glyph on the 24px header corner; IconButton never sets margin.
              <IconButton
                icon="close"
                aria-label="Close"
                variant="subtle"
                size="md"
                className="-m-2"
              />
            ) : (
              <IconButton icon="close" aria-label="Close" size="sm" />
            )}
          </DialogPrimitive.Close>
        </div>
        <div
          className={cn(
            "min-h-0 flex-1 scrollbar-thin overflow-y-auto px-6",
            barHeader ? (tightBody ? "pt-4" : "pt-6") : "",
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
  /** "2xl" = 20px (login card), "lg" = 12px (confirmation dialogs). */
  radius?: "lg" | "2xl";
};

/**
 * Bare modal surface for dialogs with their own header (Figma: login card, r20).
 * Render a `DialogTitle` inside so the dialog has an accessible name.
 */
export function DialogPanel({
  size = "sm",
  radius = "2xl",
  className,
  children,
  ...rest
}: DialogPanelProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
          radius === "2xl" ? "rounded-2xl" : "rounded-lg",
          "border border-default bg-surface text-primary shadow-lg outline-none",
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
