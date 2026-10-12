import { type ReactNode, Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * App area: sidebar, project selector, account menu, page frame and the login dialog.
 * Access control for protected routes runs in src/proxy.ts.
 *
 * The shell reads the pathname (active nav item). On a route with a runtime param, such as
 * /api-keys/[keyId]/usage, the pathname is not known while prerendering, so the shell sits in a
 * Suspense boundary and streams in; routes without params render exactly as before.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
