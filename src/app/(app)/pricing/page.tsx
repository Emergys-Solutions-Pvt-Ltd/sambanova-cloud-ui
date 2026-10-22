import type { Metadata } from "next";
import { Suspense } from "react";

import { PricingView } from "@/features/pricing";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  // The table page lives in the URL (?page=), which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <PricingView />
    </Suspense>
  );
}
