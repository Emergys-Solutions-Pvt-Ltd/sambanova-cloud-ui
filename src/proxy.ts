import { type NextRequest, NextResponse } from "next/server";

import { RETURN_TO_PARAM, SESSION_COOKIE_NAME } from "@/config/auth";
import { protectedRoutePrefixes, routes } from "@/config/routes";

/**
 * Presence of the API's session cookie. The proxy can't verify it (the API does,
 * and answers 401 on `/me` for a dead session); it only decides whether a guest
 * gets sent to login. With the real backend, swap this for its session check.
 */
function hasSession(request: NextRequest) {
  return request.cookies.has(SESSION_COOKIE_NAME);
}

const isProtected = (pathname: string) =>
  protectedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtected(pathname) && !hasSession(request)) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set(RETURN_TO_PARAM, `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, the MSW worker and image optimisation.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|mockServiceWorker.js|.*\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)",
  ],
};
