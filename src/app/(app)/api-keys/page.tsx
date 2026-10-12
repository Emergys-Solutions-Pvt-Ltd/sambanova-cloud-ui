import type { Metadata } from "next";

import { ApiKeysView } from "@/features/api-keys";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return <ApiKeysView />;
}
