import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Members · Project Settings" };

export default function SettingsMembersPage() {
  return (
    <PageContent>
      <ComingSoon>Invite and manage project members.</ComingSoon>
    </PageContent>
  );
}
