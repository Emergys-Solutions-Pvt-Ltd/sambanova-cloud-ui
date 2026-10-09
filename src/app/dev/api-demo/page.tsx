import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { ExampleListDemo } from "@/features/examples";

export const metadata: Metadata = { title: "API demo" };

export default function ApiDemoPage() {
  return (
    <PagePlaceholder
      title="API demo"
      description="MSW → Axios client → TanStack Query, end to end. Change the scenario with window.__mocks in the console."
    >
      <ExampleListDemo />
    </PagePlaceholder>
  );
}
