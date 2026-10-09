import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageContent>
      {/* The Figma dashboard has no title bar: it opens with the hero banner. */}
      <h1 className="sr-only">Dashboard</h1>
      <ComingSoon>Hero banner, onboarding steps, quickstart and recommended models.</ComingSoon>
    </PageContent>
  );
}
