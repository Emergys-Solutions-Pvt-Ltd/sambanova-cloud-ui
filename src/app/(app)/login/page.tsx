import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Log in" };

/** The login dialog (mounted in the app shell) opens over the dashboard on this route. */
export default function LoginPage() {
  return <DashboardView />;
}
