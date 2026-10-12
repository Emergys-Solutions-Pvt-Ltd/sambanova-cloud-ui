"use client";

import { ComingSoon } from "@/components/layout/coming-soon";
import { PageContent, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { emptyStates } from "@/config/assets";
import { externalLinks } from "@/config/links";
import { useAuthGate } from "@/features/auth";
import { cn } from "@/lib/cn";
import { useCreateApiKeyDialogStore } from "@/stores/create-api-key-dialog-store";

import { useApiKeys } from "../hooks/use-api-keys";

/** API Keys screen (Figma: API Keys zero state). The key table for non-empty lists is built later. */
export function ApiKeysView() {
  const keys = useApiKeys();
  const { guardAction } = useAuthGate();
  const openCreate = useCreateApiKeyDialogStore((state) => state.openDialog);
  const createKey = guardAction(openCreate);

  const refreshing = keys.isFetching;
  const empty = keys.data?.length === 0;

  return (
    <>
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API keys to securely access the Sambanova API."
        actions={
          <>
            <Button
              variant="tertiary"
              onClick={() => void keys.refetch()}
              disabled={refreshing || !keys.data}
              aria-busy={refreshing || undefined}
              className="pr-2 pl-3"
            >
              <Icon
                name="refresh"
                size={18}
                className={cn(refreshing && "animate-spin motion-reduce:animate-none")}
              />
              Refresh
            </Button>
            <Button variant="primary" leftIcon="plus" onClick={createKey}>
              Create API Key
            </Button>
          </>
        }
      />

      <PageContent className="flex flex-col items-center gap-16 pt-12 sm:gap-34.25 sm:pt-29">
        {keys.error ? (
          <ErrorState
            className="w-full"
            message="Couldn’t load API keys."
            onRetry={() => void keys.refetch()}
          />
        ) : keys.isPending ? (
          <div
            aria-busy="true"
            aria-label="Loading API keys"
            className="flex flex-col items-center gap-8"
          >
            <Skeleton className="h-33 w-52.5" />
            <Skeleton className="h-16 w-97.5" />
          </div>
        ) : empty ? (
          <EmptyState
            image={emptyStates.apiKeys}
            title="No API keys yet"
            description="Create your first API key to start building with Sambanova’s high-performance inference API."
            action={
              <Button variant="primary" leftIcon="plus" onClick={createKey} className="px-4">
                Create your first API Key
              </Button>
            }
          />
        ) : (
          <ComingSoon>Key table with search, status filter and pagination.</ComingSoon>
        )}

        <Callout
          className="w-full"
          icon="document"
          title="Need help in getting started?"
          description="Check our documentation to integrate the Sambanova API in your application."
          action={
            <Button
              href={externalLinks.documentation}
              external
              variant="secondary"
              radius="md"
              aria-label="View Documentation (opens in a new tab)"
            >
              View Documentation
              <Icon name="external-link" size="md" />
            </Button>
          }
        />
      </PageContent>
    </>
  );
}
