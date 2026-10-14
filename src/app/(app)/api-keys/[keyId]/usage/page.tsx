import type { Metadata } from "next";
import { Suspense } from "react";

import { ApiKeyUsageView } from "@/features/api-keys";

export const metadata: Metadata = { title: "API Key Usage" };

async function ApiKeyUsage({ params }: Pick<PageProps<"/api-keys/[keyId]/usage">, "params">) {
  const { keyId } = await params;
  return <ApiKeyUsageView keyId={keyId} />;
}

export default function ApiKeyUsagePage({ params }: PageProps<"/api-keys/[keyId]/usage">) {
  // The key ID comes from the URL (a runtime param) and the date range and log page live in the
  // query string (?range=&from=&to=&page=), so both are read inside a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ApiKeyUsage params={params} />
    </Suspense>
  );
}
