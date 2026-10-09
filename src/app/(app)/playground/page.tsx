import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return (
    <>
      <PageHeader title="Playground" subtitle="Test prompts and compare models." />
      <PageContent>
        <ComingSoon />
      </PageContent>
    </>
  );
}
