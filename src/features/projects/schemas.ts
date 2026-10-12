import { z } from "zod";

export const PROJECT_NAME_MIN = 3;
export const PROJECT_NAME_MAX = 50;

/** Name rules shared by the form and (mirrored) by the API. `existingNames` gives instant duplicate feedback. */
export function createProjectSchema(existingNames: readonly string[]) {
  const taken = new Set(existingNames.map((name) => name.trim().toLowerCase()));

  return z.object({
    name: z
      .string()
      .trim()
      .min(PROJECT_NAME_MIN, `Project name must be at least ${PROJECT_NAME_MIN} characters.`)
      .max(PROJECT_NAME_MAX, `Project name must be ${PROJECT_NAME_MAX} characters or fewer.`)
      .refine((name) => !taken.has(name.toLowerCase()), "A project with this name already exists."),
  });
}

export type CreateProjectValues = z.infer<ReturnType<typeof createProjectSchema>>;
