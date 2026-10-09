import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <PagePlaceholder title="Projects" description="All projects you have access to." />;
}
