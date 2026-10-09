type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Kept tiny on purpose; no conflict merging. */
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}
