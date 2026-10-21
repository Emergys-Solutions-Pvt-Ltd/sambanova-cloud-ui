import type { Metadata } from "next";

import { PageContent } from "@/components/layout/page-header";
import { BillingView } from "@/features/billing";

export const metadata: Metadata = { title: "Billing · Project Settings" };

export default function SettingsBillingPage() {
  return (
    <PageContent className="pt-8.25">
      <BillingView />
    </PageContent>
  );
}
