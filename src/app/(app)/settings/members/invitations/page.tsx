import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { InvitationsView } from "@/features/settings";

export const metadata: Metadata = { title: "Invitations · Project Settings" };

export default function SettingsInvitationsPage() {
  return (
    <PageContent className="pt-8.25">
      <InvitationsView />
    </PageContent>
  );
}
