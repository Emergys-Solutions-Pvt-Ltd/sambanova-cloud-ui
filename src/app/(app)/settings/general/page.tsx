import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "General · Project Settings" };

export default function SettingsGeneralPage() {
  return (
    <PageContent>
      <ComingSoon>Project name and details.</ComingSoon>
    </PageContent>
  );
}
