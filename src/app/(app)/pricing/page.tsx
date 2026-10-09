import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return <PagePlaceholder title="Pricing" description="Plans and per-model pricing." />;
}
