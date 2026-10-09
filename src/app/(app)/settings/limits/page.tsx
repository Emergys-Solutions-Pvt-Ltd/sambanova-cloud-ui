import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Limits · Project Settings" };

export default function SettingsLimitsPage() {
  return (
    <PageContent>
      <ComingSoon>Rate limits for this project.</ComingSoon>
    </PageContent>
  );
}
