import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <PagePlaceholder title="API Keys" description="Create and manage API keys for this project." />
  );
}
