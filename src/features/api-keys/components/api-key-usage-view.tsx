"use client";

import { useId, useState } from "react";

import { PageContent, PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ErrorState } from "@/components/ui/error-state";
import { routes } from "@/config/routes";
import { isApiError } from "@/lib/api";
import { type ApiKeyRequestLog } from "@/types/domain";

import { useApiKey, useApiKeyRequests, useApiKeyUsage } from "../hooks/use-api-key-usage";
import { API_KEY_REQUESTS_PAGE_SIZE, useApiKeyUsageState } from "../hooks/use-api-key-usage-state";
import { ApiKeyRequestsTable } from "./api-key-requests-table";
import { ApiKeySummaryCard } from "./api-key-summary-card";
import { RequestDetailsDrawer } from "./request-details-drawer";
import { UsageStatCards } from "./usage-stat-cards";

/**
 * View API Key Usage (Figma: View API Key Usage): the key, its totals and its request log for the
 * chosen dates. The date range and log page live in the URL. The token charts (Input & Output,
 * Cached, Prompt Input) are built later and go between the stat cards and the log.
 */
export function ApiKeyUsageView({ keyId }: { keyId: string }) {
  const logsHeadingId = useId();
  const { today, selection, rangeParams, page, setSelection, setPage } = useApiKeyUsageState();
  const apiKey = useApiKey(keyId);
  const usage = useApiKeyUsage(keyId, rangeParams);
  const requests = useApiKeyRequests(keyId, {
    ...rangeParams,
    page,
    pageSize: API_KEY_REQUESTS_PAGE_SIZE,
  });
  const [selected, setSelected] = useState<ApiKeyRequestLog | null>(null);

  const missing = isApiError(apiKey.error) && apiKey.error.status === 404;

  return (
    <>
      <PageHeader
        title="API Key Usage"
        leading={<BackButton href={routes.apiKeys} label="Back to API keys" />}
        actions={
          !missing && (
            <>
              <DateRangePicker
                aria-label="Date range"
                today={today}
                selection={selection}
                onSelectionChange={setSelection}
                className="sm:w-60.75"
              />
              {/* No export flow is designed yet: the button is shown but does nothing. */}
              <Button variant="primary" leftIcon="download">
                Export
              </Button>
            </>
          )
        }
      />

      <PageContent className="flex flex-col gap-6">
        {missing ? (
          <div className="flex flex-col items-start gap-4">
            <ErrorState message="This API key doesn’t exist or was deleted." className="w-full" />
            <Button href={routes.apiKeys} variant="secondary">
              Back to API keys
            </Button>
          </div>
        ) : apiKey.error && !apiKey.data ? (
          <ErrorState message="Couldn’t load this API key." onRetry={() => void apiKey.refetch()} />
        ) : (
          <>
            <ApiKeySummaryCard apiKey={apiKey.data} />

            {usage.error && !usage.data ? (
              <ErrorState
                message="Couldn’t load the usage totals."
                onRetry={() => void usage.refetch()}
              />
            ) : (
              <UsageStatCards stats={usage.data} refreshing={usage.isPlaceholderData} />
            )}

            {/* Charts: Input & Output Tokens, Cached Tokens and Prompt Input Tokens come here later. */}

            <section aria-labelledby={logsHeadingId} className="flex flex-col gap-4">
              <h2 id={logsHeadingId} className="text-heading-sm leading-tight">
                API Request Logs
              </h2>
              {requests.error && !requests.data ? (
                <ErrorState
                  message="Couldn’t load the request logs."
                  onRetry={() => void requests.refetch()}
                />
              ) : (
                <ApiKeyRequestsTable
                  result={requests.data}
                  onPageChange={setPage}
                  onView={setSelected}
                  loadingMore={requests.isPlaceholderData}
                />
              )}
            </section>
          </>
        )}
      </PageContent>

      <RequestDetailsDrawer log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
