"use client";

import { useState } from "react";

import { isApiError } from "@/lib/api";

import { Button } from "./button";
import { Dialog, DialogClose, DialogDescription, DialogPanel, DialogTitle } from "./dialog";
import { FeaturedIcon } from "./featured-icon";
import { type IconName } from "./icon/icon";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: IconName;
  /** "danger" gives a red icon and a destructive confirm button (deletions). */
  tone?: "warning" | "danger";
  confirmLabel?: string;
  /**
   * Runs when the user confirms. Close the dialog (and show a toast) when it succeeds; throw an
   * ApiError to show a message above the buttons and keep the dialog open.
   */
  onConfirm: () => Promise<unknown>;
}

/** Centred confirmation modal with an icon, text, Cancel and Confirm (Figma: Disable Key). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon = "featured-alert-triangle",
  tone = "warning",
  confirmLabel = "Confirm",
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (failure) {
      setError(isApiError(failure) ? failure.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <DialogPanel size="xs" radius="lg" className="flex flex-col items-center gap-8 p-6">
        <div className="flex w-full flex-col items-center gap-5 text-center">
          <FeaturedIcon icon={icon} tone={tone} />
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-heading-sm font-bold">{title}</DialogTitle>
            <DialogDescription className="text-body text-muted">{description}</DialogDescription>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="-mt-3 w-full rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
          >
            {error}
          </p>
        )}

        <div className="flex w-full gap-4">
          <DialogClose asChild>
            <Button type="button" variant="cancel" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "primary"}
            className="flex-1"
            loading={pending}
            onClick={() => void confirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
