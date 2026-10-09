import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle="Compare model pricing, and choose the best option for your AI workload"
      />
      <PageContent>
        <ComingSoon />
      </PageContent>
    </>
  );
}
