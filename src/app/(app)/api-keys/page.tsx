import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <>
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API keys to securely access the Sambanova API."
        actions={
          <>
            <Button variant="tertiary" leftIcon="refresh">
              Refresh
            </Button>
            <Button leftIcon="plus">Create API Key</Button>
          </>
        }
      />
      <PageContent>
        <ComingSoon>Key table with search, status filter and pagination.</ComingSoon>
      </PageContent>
    </>
  );
}
