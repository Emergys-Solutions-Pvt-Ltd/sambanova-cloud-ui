import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return <PagePlaceholder title="Playground" description="Test prompts and compare models." />;
}
