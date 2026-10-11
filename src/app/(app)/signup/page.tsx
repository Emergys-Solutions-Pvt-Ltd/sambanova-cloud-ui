import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Sign up" };

/** The sign-up dialog (mounted in the app shell) opens over the dashboard on this route. */
export default function SignupPage() {
  return <DashboardView />;
}
