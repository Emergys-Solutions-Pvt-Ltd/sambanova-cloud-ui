import { type FieldPath, type FieldValues, type UseFormSetError } from "react-hook-form";

import { isApiError } from "@/lib/api";

/**
 * Puts an API failure where the user can see it: on the field the API named,
 * or as one form-level message otherwise.
 */
export function showApiError<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  fieldMap: Partial<Record<string, FieldPath<TValues>>>,
) {
  if (!isApiError(error)) {
    setError("root", { message: "Something went wrong. Please try again." });
    return;
  }

  const details = error.details as { field?: string } | undefined;
  const field =
    (details?.field && fieldMap[details.field]) ||
    (error.code === "EMAIL_TAKEN" ? fieldMap.email : undefined);

  if (field) setError(field, { message: error.message });
  else setError("root", { message: error.message });
}
