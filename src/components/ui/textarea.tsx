"use client";

import { type ComponentPropsWithRef, type FormEvent, useId } from "react";

import { cn } from "@/lib/cn";

export type TextareaProps = ComponentPropsWithRef<"textarea"> & { "aria-label"?: string };

const bareClasses =
  "w-full resize-none bg-transparent text-primary outline-none placeholder:text-muted field-sizing-content scrollbar-thin";

/** Grows the box with its content where `field-sizing: content` is unsupported (Firefox, Safari < 18.4). */
function growFallback(event: FormEvent<HTMLTextAreaElement>) {
  if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) return;
  const element = event.currentTarget;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

/**
 * Bare, auto-growing textarea with no chrome (Figma: Playground composer and prompt edit).
 * The parent draws the surface; cap the growth with `max-h-*` and it scrolls inside after that.
 */
export function Textarea({ className, onInput, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(bareClasses, className)}
      onInput={(event) => {
        growFallback(event);
        onInput?.(event);
      }}
      {...rest}
    />
  );
}

const borders = { input: "border-input", field: "border-field" } as const;

export interface TextareaFieldProps extends TextareaProps {
  /** Visible label above the box. Omit when an outer `FormField` already labels it. */
  label?: string;
  /** Border colour: `input` (dialog fields) or `field` (darker form stroke). Default `input`. */
  bordered?: keyof typeof borders;
}

/**
 * Bordered textarea on the input surface (Figma: System Prompt dialog). Set the height and
 * padding through `className`; the field sets neither.
 */
export function TextareaField({
  label,
  bordered = "input",
  id,
  className,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const field = (
    <textarea
      id={fieldId}
      className={cn(
        bareClasses,
        "rounded-md border bg-input text-body transition-colors duration-(--sn-duration-fast) ease-standard focus:border-focus",
        borders[bordered],
        className,
      )}
      {...rest}
    />
  );
  if (!label) return field;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-label text-primary">
        {label}
      </label>
      {field}
    </div>
  );
}
