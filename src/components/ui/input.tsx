import { type ComponentPropsWithRef, type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

export interface TextFieldProps extends Omit<ComponentPropsWithRef<"input">, "id"> {
  label: string;
  /** Validation message; also marks the input invalid for assistive tech. */
  error?: string;
  /** Control placed inside the field at the end, e.g. a show/hide password button. */
  trailing?: ReactNode;
  className?: string;
}

/** Labelled text input (Figma: Input Field, 42px, translucent fill, r8). Works with react-hook-form's `register`. */
export function TextField({
  label,
  error,
  trailing,
  className,
  type = "text",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-label font-medium text-primary">
        {label}
      </label>
      <div
        className={cn(
          "flex h-10.5 items-center gap-2.5 rounded-md border bg-input px-4 transition-colors",
          "duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
          error ? "border-error-border" : "border-transparent",
        )}
      >
        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted"
          {...rest}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
