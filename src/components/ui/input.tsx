import { type ComponentPropsWithRef, type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

const fieldSizes = { sm: "h-9.25", md: "h-10.5", lg: "h-11.25" } as const;
const borders = { field: "border-field", input: "border-input" } as const;

interface FormFieldProps {
  label: string;
  /** Id of the control the label belongs to. */
  htmlFor: string;
  /** Validation message, shown under the control (the control links to it with `aria-describedby`). */
  error?: string;
  errorId?: string;
  labelClassName?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + error message. Wrap any control (TextField uses it; use it for a Select too). */
export function FormField({
  label,
  htmlFor,
  error,
  errorId,
  labelClassName,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className={cn("text-label font-medium text-primary", labelClassName)}
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-label text-error italic">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextFieldProps extends Omit<ComponentPropsWithRef<"input">, "id"> {
  label: string;
  /** Validation message; also marks the input invalid for assistive tech. */
  error?: string;
  /** Control placed inside the field at the end, e.g. a show/hide password button. */
  trailing?: ReactNode;
  /** "sm" = 37px (dense forms), "md" = 42px (auth form), "lg" = 45px (modal forms). */
  fieldSize?: "sm" | "md" | "lg";
  /** Solid field with a visible border (modal forms) instead of the borderless translucent one. "input" uses the softer input stroke. */
  bordered?: boolean | "field" | "input";
  labelClassName?: string;
  className?: string;
}

/** Labelled text input (Figma: Input Field, 42px, translucent fill, r8). Works with react-hook-form's `register`. */
export function TextField({
  label,
  error,
  trailing,
  fieldSize = "md",
  bordered,
  labelClassName,
  className,
  type = "text",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      errorId={errorId}
      labelClassName={labelClassName}
      className={className}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md border bg-input px-4 transition-colors",
          "duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
          fieldSizes[fieldSize],
          error
            ? "border-error-border"
            : bordered
              ? borders[bordered === true ? "field" : bordered]
              : "border-transparent",
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
    </FormField>
  );
}
