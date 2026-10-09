import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Billing · Project Settings" };

export default function SettingsBillingPage() {
  return (
    <PageContent>
      <ComingSoon>Payment methods, credits and invoices.</ComingSoon>
    </PageContent>
  );
}
