import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Manage Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Manage Projects"
        subtitle="Projects help you organize your work, manage API keys, control access, and set limits."
        actions={<Button leftIcon="plus">Create Project</Button>}
      />
      <PageContent>
        <ComingSoon>
          Project list, rename and delete. The “Create Project” dialog opens from here.
        </ComingSoon>
      </PageContent>
    </>
  );
}
