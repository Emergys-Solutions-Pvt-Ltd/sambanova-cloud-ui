import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { MembersView } from "@/features/settings";

export const metadata: Metadata = { title: "Members · Project Settings" };

export default function SettingsMembersPage() {
  return (
    <PageContent className="pt-8.25">
      <MembersView />
    </PageContent>
  );
}
