import { type NextRequest, NextResponse } from "next/server";

import { protectedRoutePrefixes, routes } from "@/config/routes";

/**
 * STUB: always "signed in" until Auth0 is integrated. Replace with a real
 * session check (e.g. the Auth0 SDK's session cookie) without changing the
 * redirect flow below.
 */
function hasSession(_request: NextRequest) {
  return true;
}

const isProtected = (pathname: string) =>
  protectedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtected(pathname) && !hasSession(request)) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
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
