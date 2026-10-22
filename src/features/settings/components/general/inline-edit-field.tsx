"use client";

import { type FocusEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { isApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

export interface InlineEditFieldProps {
  /** Field name for labels and messages, e.g. "Project name". */
  label: string;
  value: string;
  /** Shown in place of an empty value. */
  emptyText?: string;
  canEdit: boolean;
  maxLength: number;
  /** Returns an error message, or `null` when the trimmed value is fine. */
  validate: (value: string) => string | null;
  /** Saves the trimmed value; a rejected promise keeps the field open with the API's message. */
  onSave: (value: string) => Promise<unknown>;
  /** Width of the input (Figma: 314px for the name). */
  inputClassName?: string;
}

/**
 * A value with a pencil button that turns it into an input (Figma: Project Settings › General
 * `1387:70647`). Enter, blur or the pencil save; Escape cancels; errors show under the input.
 */
export function InlineEditField({
  label,
  value,
  emptyText,
  canEdit,
  maxLength,
  validate,
  onSave,
  inputClassName,
}: InlineEditFieldProps) {
  const errorId = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const start = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const stop = (restoreFocus: boolean) => {
    setEditing(false);
    setError(null);
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus());
  };

  const commit = async (restoreFocus: boolean) => {
    if (saving) return;
    const next = draft.trim();
    if (next === value) {
      stop(restoreFocus);
      return;
    }
    const problem = validate(next);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
      stop(restoreFocus);
    } catch (cause) {
      setError(isApiError(cause) ? cause.message : `Could not save the ${label.toLowerCase()}.`);
      inputRef.current?.focus();
    } finally {
      setSaving(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      void commit(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      stop(true);
    }
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    // The pencil saves on its own click; leaving to anything else saves too.
    if (event.relatedTarget === buttonRef.current) return;
    void commit(false);
  };

  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
      {editing ? (
        <div className={cn("flex min-w-0 flex-col gap-1.5", inputClassName)}>
          <input
            ref={inputRef}
            type="text"
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={draft}
            maxLength={maxLength}
            readOnly={saving}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className={cn(
              "-my-1.25 h-9.25 w-full rounded-md border bg-field-strong px-4 text-body font-medium text-primary outline-none",
              "transition-colors duration-(--sn-duration-fast) ease-standard",
              error ? "border-error-border" : "border-strong focus:border-focus",
            )}
          />
          {error && (
            <p id={errorId} role="alert" className="mt-1.25 text-caption text-error">
              {error}
            </p>
          )}
        </div>
      ) : (
        <p
          className={cn(
            "min-w-0 py-1.25 text-body leading-[1.2] font-medium break-words",
            value ? "text-secondary" : "text-muted",
          )}
        >
          {value || emptyText}
        </p>
      )}
      {canEdit && (
        <IconButton
          ref={buttonRef}
          icon="pencil-line"
          size="field-lg"
          aria-label={editing ? `Save ${label.toLowerCase()}` : `Edit ${label.toLowerCase()}`}
          disabled={saving}
          onMouseDown={(event) => {
            // Keep focus in the input so its blur doesn't save before the click does.
            if (editing) event.preventDefault();
          }}
          onClick={() => (editing ? void commit(true) : start())}
          className="-my-1.25"
        />
      )}
    </div>
  );
}
