import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { ProjectGeneralView } from "@/features/settings";

export const metadata: Metadata = { title: "General · Project Settings" };

export default function SettingsGeneralPage() {
  return (
    <PageContent className="pt-8.5">
      <ProjectGeneralView />
    </PageContent>
  );
}
