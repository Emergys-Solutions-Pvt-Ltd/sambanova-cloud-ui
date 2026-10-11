import { type ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * App area: sidebar, project selector, account menu, page frame and the login dialog.
 * Access control for protected routes runs in src/proxy.ts.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
