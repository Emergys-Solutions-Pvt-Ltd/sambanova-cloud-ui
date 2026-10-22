"use client";

import { PageContent, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { emptyStates } from "@/config/assets";
import { externalLinks } from "@/config/links";
import { useAuthGate } from "@/features/auth";
import { cn } from "@/lib/cn";
import { useCreateApiKeyDialogStore } from "@/stores/create-api-key-dialog-store";

import { useApiKeys } from "../hooks/use-api-keys";
import { useApiKeysTableState } from "../hooks/use-api-keys-table-state";
import { ApiKeyActionDialogs } from "./api-key-action-dialogs";
import { ApiKeysTable } from "./api-keys-table";
import { ApiKeysToolbar } from "./api-keys-toolbar";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

/**
 * API Keys screen (Figma: API Keys zero state, API Keys table, Create API key). A project with no
 * keys at all shows the zero state; otherwise the toolbar (search, status) and the paginated table.
 */
export function ApiKeysView() {
  const { params, setPage, setSearch, setStatus } = useApiKeysTableState();
  const keys = useApiKeys(params);
  const { guardAction } = useAuthGate();
  const openCreate = useCreateApiKeyDialogStore((state) => state.openDialog);
  const createKey = guardAction(openCreate);

  const filtered = Boolean(params.search) || params.status !== "all";
  const refreshing = keys.isFetching;
  // No keys in the project at all (not just none matching the search or filter).
  const zeroState = keys.data?.total === 0 && !filtered;

  return (
    <>
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API keys to securely access the Sambanova API."
        subtitleVariant="compact"
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

      {zeroState ? (
        <PageContent className="flex flex-col items-center gap-16 pt-12 sm:gap-34.25 sm:pt-29">
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
      ) : (
        <PageContent className="flex flex-col gap-6 pt-7.5">
          {keys.error && !keys.data ? (
            <ErrorState message="Couldn’t load API keys." onRetry={() => void keys.refetch()} />
          ) : (
            <>
              <ApiKeysToolbar
                search={params.search}
                status={params.status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
              />
              <ApiKeysTable
                result={keys.data}
                filtered={filtered}
                onPageChange={setPage}
                loadingMore={keys.isPlaceholderData}
              />
            </>
          )}
        </PageContent>
      )}

      <CreateApiKeyDialog />
      <ApiKeyActionDialogs />
    </>
  );
}
