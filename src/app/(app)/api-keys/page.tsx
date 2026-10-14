import type { Metadata } from "next";
import { Suspense } from "react";

import { ApiKeysView } from "@/features/api-keys";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  // The table state lives in the URL (?q=&status=&page=), which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ApiKeysView />
    </Suspense>
  );
}
