import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { RolesView } from "@/features/settings";

export const metadata: Metadata = { title: "Roles · Project Settings" };

export default function SettingsRolesPage() {
  return (
    <PageContent className="pt-8.25">
      <RolesView />
    </PageContent>
  );
}
