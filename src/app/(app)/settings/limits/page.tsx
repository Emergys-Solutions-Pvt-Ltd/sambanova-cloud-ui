import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { LimitsView } from "@/features/settings";

export const metadata: Metadata = { title: "Limits · Project Settings" };

export default function SettingsLimitsPage() {
  return (
    <PageContent className="pt-8.5">
      <LimitsView />
    </PageContent>
  );
}
