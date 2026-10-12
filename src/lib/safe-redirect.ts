/**
 * Accepts a post-login destination only if it is an in-app path, so a crafted
 * `?returnTo=https://evil.example` or `//evil.example` can't bounce users off-site.
 */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}
