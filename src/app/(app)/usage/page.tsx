import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Usage" };

export default function UsagePage() {
  return <PagePlaceholder title="Usage" description="Token usage and spend for this project." />;
}
