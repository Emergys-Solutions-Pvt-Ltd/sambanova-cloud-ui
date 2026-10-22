import { z } from "zod";

/**
 * Typed, validated access to public environment variables.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` values that are read as literal
 * `process.env.NEXT_PUBLIC_X` expressions, so each one is listed explicitly
 * here instead of passing `process.env` wholesale.
 */

/**
 * Comma-separated route prefixes to switch off, e.g. "/playground, /api-keys/".
 * Entries are trimmed, given a leading slash and stripped of a trailing slash, query or hash;
 * blanks and duplicates are dropped (a lone "/" is ignored: it would disable the whole app).
 */
const routeList = z
  .string()
  .default("")
  .transform((value) => [
    ...new Set(
      value
        .split(",")
        .map((entry) =>
          entry
            .trim()
            .replace(/[?#].*$/, "")
            .replace(/\/+$/, ""),
        )
        .filter(Boolean)
        .map((entry) => (entry.startsWith("/") ? entry : `/${entry}`)),
    ),
  ]);

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
  NEXT_PUBLIC_QUERY_DEVTOOLS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_DISABLED_ROUTES: routeList,
  NEXT_PUBLIC_ENABLE_THEME_SWITCHER: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_QUERY_DEVTOOLS: process.env.NEXT_PUBLIC_QUERY_DEVTOOLS,
  NEXT_PUBLIC_DISABLED_ROUTES: process.env.NEXT_PUBLIC_DISABLED_ROUTES,
  NEXT_PUBLIC_ENABLE_THEME_SWITCHER: process.env.NEXT_PUBLIC_ENABLE_THEME_SWITCHER,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables. Copy .env.example to .env.local and fill it in.\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = {
  apiBaseUrl: parsed.data.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, ""),
  useMocks: parsed.data.NEXT_PUBLIC_USE_MOCKS,
  queryDevtools: parsed.data.NEXT_PUBLIC_QUERY_DEVTOOLS,
  disabledRoutes: parsed.data.NEXT_PUBLIC_DISABLED_ROUTES,
  /** Shows the System / Light / Dark switcher. Off: the app is dark and has no theme options. */
  themeSwitcher: parsed.data.NEXT_PUBLIC_ENABLE_THEME_SWITCHER,
  isDev: process.env.NODE_ENV === "development",
} as const;
