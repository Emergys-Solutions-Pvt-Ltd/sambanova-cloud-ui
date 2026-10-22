"use client";

import { useId } from "react";

import { PageContent, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ErrorState } from "@/components/ui/error-state";
import {
  applySelection,
  UsageCharts,
  UsageStatCards,
  useApiKeyUsageState,
} from "@/features/api-keys";
import { formatSelectionLabel } from "@/lib/date-range";

import { useProjectKeyUsage, useProjectUsage, useProjectUsageSeries } from "../hooks/use-usage";
import { ApiKeyUsageTable } from "./api-key-usage-table";

/** Figma's table shows 10 rows ("Showing 1-10 of 1000"). */
const KEYS_PAGE_SIZE = 10;

/**
 * Usage screen (Figma: Usage): the whole project's requests, tokens and spend for the chosen dates,
 * the Input & Output Tokens chart and a table of what each key used. The date range and table page
 * live in the URL, in the same format as a key's own usage page.
 */
export function UsageView() {
  const keysHeadingId = useId();
  const { today, selection, rangeParams, page, setSelection, setPage } = useApiKeyUsageState();
  const usage = useProjectUsage(rangeParams);
  const series = useProjectUsageSeries(rangeParams);
  const keys = useProjectKeyUsage({ ...rangeParams, page, pageSize: KEYS_PAGE_SIZE });

  return (
    <>
      <PageHeader
        title="Usage"
        actions={
          <>
            <DateRangePicker
              aria-label="Date range"
              today={today}
              selection={selection}
              onSelectionChange={setSelection}
              className="sm:w-60.75"
            />
            {/* No export flow is designed yet: the button is shown but does nothing. */}
            <Button variant="primary" leftIcon="download" iconSize={18}>
              Export
            </Button>
          </>
        }
      />

      <PageContent className="flex flex-col gap-6">
        {usage.error && !usage.data ? (
          <ErrorState
            message="Couldn’t load the usage totals."
            onRetry={() => void usage.refetch()}
          />
        ) : (
          <UsageStatCards
            stats={usage.data}
            refreshing={usage.isPlaceholderData}
            variant="project"
          />
        )}

        {series.error && !series.data ? (
          <ErrorState
            message="Couldn’t load the usage chart."
            onRetry={() => void series.refetch()}
          />
        ) : (
          <UsageCharts
            points={series.data?.points}
            rangeLabel={formatSelectionLabel(selection)}
            refreshing={series.isPlaceholderData}
            showCacheCharts={false}
          />
        )}

        {/* Figma's table card has its 1px stroke outside the box, so it takes 1px of the 16px gap above it. */}
        <section aria-labelledby={keysHeadingId} className="flex flex-col gap-3.75">
          {/* Figma's heading line is 22px (18px text), so the table below sits on a whole pixel. */}
          <h2 id={keysHeadingId} className="text-heading-sm leading-5.5">
            API Key Usage
          </h2>
          {keys.error && !keys.data ? (
            <ErrorState
              message="Couldn’t load the API key usage."
              onRetry={() => void keys.refetch()}
            />
          ) : (
            <ApiKeyUsageTable
              result={keys.data}
              pageSize={KEYS_PAGE_SIZE}
              rangeQuery={applySelection(new URLSearchParams(), selection).toString()}
              onPageChange={setPage}
              loadingMore={keys.isPlaceholderData}
            />
          )}
        </section>
      </PageContent>
    </>
  );
}
