import { z } from "zod";

/**
 * Typed, validated access to public environment variables.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` values that are read as literal
 * `process.env.NEXT_PUBLIC_X` expressions, so each one is listed explicitly
 * here instead of passing `process.env` wholesale.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_BASE_URL is required")
    .refine((value) => value.startsWith("/") || URL.canParse(value), {
      message: "NEXT_PUBLIC_API_BASE_URL must be an absolute URL or a path starting with /",
    }),
  NEXT_PUBLIC_USE_MOCKS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables. Copy .env.example to .env.local and fill it in.\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = {
  apiBaseUrl: parsed.data.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, ""),
  useMocks: parsed.data.NEXT_PUBLIC_USE_MOCKS,
  isDev: process.env.NODE_ENV === "development",
} as const;
