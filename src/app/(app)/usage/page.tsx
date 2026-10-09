import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Usage" };

export default function UsagePage() {
  return (
    <>
      <PageHeader title="Usage" />
      <PageContent>
        <ComingSoon>Token usage charts and the per-key breakdown.</ComingSoon>
      </PageContent>
    </>
  );
}
