import { SESSION_COOKIE_NAME } from "@/config/auth";

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * The mock API runs in the browser, so it sets the session cookie through
 * `document.cookie` (a real backend sends `Set-Cookie`, HttpOnly). Either way the
 * browser then sends it with every request, which is all the app and
 * `src/proxy.ts` rely on.
 */
export function readSessionToken(): string | null {
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(SESSION_COOKIE_NAME.length + 1)) : null;
}

export function writeSessionCookie(token: string) {
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
