"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "@/lib/api";

import { Button } from "./button";
import { Dialog, DialogClose, DialogContent } from "./dialog";
import { TextField } from "./input";

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label above the field (Figma: "Project Name", "Name", "Key Name"). */
  label: string;
  placeholder?: string;
  /** Hard limit; when set, a live "n/max" counter is shown inside the field. */
  maxLength?: number;
  /** Text of the submit button ("Create Project", "Create API Key", "Save"). */
  submitLabel: string;
  /** Starting value, e.g. the current name when renaming. */
  initialName?: string;
  /** Keep the submit button disabled until the name differs from `initialName` (rename dialogs). */
  requireChange?: boolean;
  /** Rules for the trimmed name. The submit button stays disabled until they pass. */
  schema: z.ZodType<string, string>;
  /**
   * Called with the trimmed name. Close the dialog (and show a toast) when it succeeds. Throw an
   * ApiError to show a problem: 409 and 422 appear under the field, anything else above the buttons.
   */
  onSubmit: (name: string) => Promise<unknown>;
}

function NameForm({
  label,
  placeholder,
  maxLength,
  submitLabel,
  initialName = "",
  requireChange,
  schema,
  onSubmit,
}: Omit<NameDialogProps, "open" | "onOpenChange" | "title" | "description">) {
  const resolver = useMemo(() => zodResolver(z.object({ name: schema })), [schema]);
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<{ name: string }>({
    resolver,
    mode: "onTouched",
    defaultValues: { name: initialName },
  });
  const name = useWatch({ control, name: "name" });

  const submit = handleSubmit(async (values) => {
    clearErrors("root");
    try {
      await onSubmit(values.name);
    } catch (error) {
      const message = isApiError(error) ? error.message : "Something went wrong. Try again.";
      // 409 (taken) and 422 (invalid) belong to the field; anything else is a form-level problem.
      if (isApiError(error) && (error.status === 409 || error.status === 422)) {
        setError("name", { message });
      } else {
        setError("root", { message });
      }
    }
  });

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-7.5">
      <TextField
        label={label}
        labelClassName="font-normal"
        fieldSize="lg"
        bordered
        autoFocus
        autoComplete="off"
        placeholder={placeholder}
        maxLength={maxLength}
        error={errors.name?.message}
        trailing={
          maxLength ? (
            <span aria-hidden="true" className="shrink-0 text-body text-muted">
              {name.length}/{maxLength}
            </span>
          ) : undefined
        }
        {...register("name")}
      />

      {errors.root?.message && (
        <p
          role="alert"
          className="-mt-3.5 rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isValid || (requireChange && name.trim() === initialName.trim())}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Modal with one validated name field and Cancel / submit buttons (Figma: Create New Project,
 * Create API key, Edit API key). The form resets every time the dialog opens.
 */
export function NameDialog({ open, onOpenChange, title, description, ...form }: NameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        // Figma: the Create New Project description is gray-400; the Create / Edit API key bar headers have none.
        variant={description ? "muted" : "default"}
        title={title}
        description={description}
      >
        <NameForm {...form} />
      </DialogContent>
    </Dialog>
  );
}
