import type { Metadata } from "next";
import { Suspense } from "react";

import { UsageView } from "@/features/usage";

export const metadata: Metadata = { title: "Usage" };

export default function UsagePage() {
  // The date range and the table page live in the URL (?range=&from=&to=&page=), which needs a
  // Suspense boundary.
  return (
    <Suspense fallback={null}>
      <UsageView />
    </Suspense>
  );
}
