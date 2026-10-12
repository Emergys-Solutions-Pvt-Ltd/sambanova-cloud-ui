"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon/icon";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { isApiError } from "@/lib/api";
import { type ApiKey, type GracePeriod } from "@/types/domain";

/** Choices from the Figma Grace Period dropdown. */
const gracePeriodGroups = [
  {
    options: [
      { value: "immediately", label: "Expire old key immediately" },
      { value: "1h", label: "1 hour" },
      { value: "24h", label: "24 hours" },
      { value: "3d", label: "3 days" },
      { value: "7d", label: "7 days" },
    ],
  },
];

interface RotateApiKeyDialogProps {
  apiKey: ApiKey | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rotates the key; throw an ApiError to keep the dialog open with a message. */
  onRotate: (gracePeriod: GracePeriod) => Promise<unknown>;
}

function RotateForm({ onRotate }: Pick<RotateApiKeyDialogProps, "onRotate">) {
  const fieldId = useId();
  const [gracePeriod, setGracePeriod] = useState<GracePeriod | "">("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!gracePeriod) return;
    setPending(true);
    setError(null);
    try {
      await onRotate(gracePeriod);
    } catch (failure) {
      setError(isApiError(failure) ? failure.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-7.5"
    >
      <p className="text-body text-secondary">
        This will generate a new secret for this API key. Choose how long the old key should remain
        valid before it expires.
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={fieldId} className="text-label font-normal text-primary">
            Grace Period
          </label>
          <Tooltip
            variant="rich"
            side="top"
            content={
              <div className="flex flex-col gap-2">
                <p>You will be able to use both the old and new key during this time.</p>
                <p>For compromised keys, always rotate immediately.</p>
              </div>
            }
          >
            <button
              type="button"
              aria-label="About the grace period"
              className="flex size-4.5 items-center justify-center rounded-full text-secondary hover:text-primary"
            >
              <Icon name="info-circle" size={18} />
            </button>
          </Tooltip>
        </div>
        <Select
          id={fieldId}
          variant="field"
          aria-label="Grace period"
          placeholder="Select"
          placeholderTone="primary"
          groups={gracePeriodGroups}
          value={gracePeriod}
          onValueChange={(next) => setGracePeriod(next as GracePeriod)}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="-mt-3.5 rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={pending} disabled={!gracePeriod}>
          Rotate Key
        </Button>
      </div>
    </form>
  );
}

/** "Rotate <key name>" modal (Figma: Rotate Key). Rotate Key stays disabled until a grace period is chosen. */
export function RotateApiKeyDialog({
  apiKey,
  open,
  onOpenChange,
  onRotate,
}: RotateApiKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        title={
          <>
            Rotate <span className="font-normal">{apiKey?.name}</span>
          </>
        }
      >
        <RotateForm onRotate={onRotate} />
      </DialogContent>
    </Dialog>
  );
}
