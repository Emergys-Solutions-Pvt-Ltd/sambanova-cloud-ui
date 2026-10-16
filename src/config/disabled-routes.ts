import { env } from "./env";

/**
 * Routes switched off through `NEXT_PUBLIC_DISABLED_ROUTES` (see `.env.example`). The value is
 * inlined at build time, so restart `next dev` (or rebuild / redeploy) after changing it.
 *
 * A listed route also disables everything beneath it: "/settings" covers "/settings/billing".
 * The proxy answers a disabled route with the 404 page. Links and buttons that lead there (the
 * sidebar, hero actions, "Explore in Playground") are left as designed: following one just opens
 * that URL, which shows the 404 page.
 */
export const disabledRoutes: readonly string[] = env.disabledRoutes;

/** True when `href` (a path, optionally with a query or hash) is a disabled route or sits under one. */
export function isRouteDisabled(href: string, list: readonly string[] = disabledRoutes) {
  if (list.length === 0) return false;
  const path = href.replace(/[?#].*$/, "").replace(/\/+$/, "");
  return list.some((route) => path === route || path.startsWith(`${route}/`));
}
