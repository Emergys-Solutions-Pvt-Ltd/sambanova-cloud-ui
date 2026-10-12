import { z } from "zod";

export const API_KEY_NAME_MIN = 3;
export const API_KEY_NAME_MAX = 50;

/** Key name rules shared by the form and (mirrored) by the API. `existingNames` gives instant duplicate feedback. */
export function apiKeyNameSchema(existingNames: readonly string[]) {
  const taken = new Set(existingNames.map((name) => name.trim().toLowerCase()));

  return z
    .string()
    .trim()
    .min(1, "Key name can’t be empty.")
    .min(API_KEY_NAME_MIN, `Key name must be at least ${API_KEY_NAME_MIN} characters.`)
    .max(API_KEY_NAME_MAX, `Key name must be ${API_KEY_NAME_MAX} characters or fewer.`)
    .refine((name) => !taken.has(name.toLowerCase()), "An API key with this name already exists.");
}
