import { type ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Signed-in app area: sidebar, project selector, account menu and page frame.
 * Access control runs in src/proxy.ts (stubbed until Auth0).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
