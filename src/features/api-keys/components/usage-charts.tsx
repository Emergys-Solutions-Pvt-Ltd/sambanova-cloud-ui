"use client";

import { useMemo } from "react";

import { ChartCard, ChartLegend } from "@/components/ui/chart-card";
import { LineChart } from "@/components/ui/line-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCompactNumber } from "@/lib/format";
import { type ApiKeyUsageSeriesPoint } from "@/types/domain";

import { bucketLabel, bucketTitle, bucketUsage } from "../lib/usage-series";

/** Figma: one dot per day on the full-width chart (30 for Last 30 days), 11 labels on the small ones. */
const WIDE_MAX_POINTS = 31;
const COMPACT_MAX_POINTS = 11;

const formatTokens = (value: number) => formatCompactNumber(value, 2);

interface UsageChartsProps {
  /** Daily tokens of the range; `undefined` while the first data loads. */
  points: ApiKeyUsageSeriesPoint[] | undefined;
  /** Text of the single-series legends: the chosen range, e.g. "Last 30 days". */
  rangeLabel: string;
  /** Dims the charts while a new range loads. */
  refreshing?: boolean;
}

/**
 * The three token charts of the usage page (Figma: BarLineChart): Input & Output Tokens, Cached
 * Tokens and Prompt Input Tokens (input that was not served from cache), for the chosen range.
 */
export function UsageCharts({ points, rangeLabel, refreshing }: UsageChartsProps) {
  const wide = useMemo(() => (points ? bucketUsage(points, WIDE_MAX_POINTS) : []), [points]);
  const compact = useMemo(() => (points ? bucketUsage(points, COMPACT_MAX_POINTS) : []), [points]);

  const wideCategories = useMemo(
    () => wide.map((bucket) => ({ label: bucketLabel(bucket), title: bucketTitle(bucket) })),
    [wide],
  );
  const compactCategories = useMemo(
    () => compact.map((bucket) => ({ label: bucketLabel(bucket), title: bucketTitle(bucket) })),
    [compact],
  );

  const loading = !points;
  const placeholder = <Skeleton className="h-58.5 w-full" />;

  return (
    <div
      aria-busy={loading || refreshing || undefined}
      className={cn(
        "flex flex-col gap-6 transition-opacity duration-(--sn-duration-fast)",
        refreshing && "opacity-60",
      )}
    >
      <ChartCard
        title="Input & Output Tokens"
        legend={
          <ChartLegend
            items={[
              { label: "Input Tokens", tone: "input" },
              { label: "Output Tokens", tone: "output" },
            ]}
          />
        }
      >
        {loading ? (
          placeholder
        ) : (
          <LineChart
            label="Input and output tokens over the selected dates"
            variant="wide"
            insetStart={50}
            insetEnd={18}
            categories={wideCategories}
            series={[
              {
                id: "input",
                label: "Input Tokens",
                tone: "input",
                values: wide.map((bucket) => bucket.inputTokens),
              },
              {
                id: "output",
                label: "Output Tokens",
                tone: "output",
                values: wide.map((bucket) => bucket.outputTokens),
              },
            ]}
            formatTick={formatTokens}
            formatValue={formatTokens}
          />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          compact
          title="Cached Tokens"
          legend={
            <ChartLegend items={[{ label: rangeLabel, tone: "cached" }]} labelTone="primary" />
          }
        >
          {loading ? (
            placeholder
          ) : (
            <LineChart
              label="Cached tokens over the selected dates"
              variant="compact"
              categories={compactCategories}
              series={[
                {
                  id: "cached",
                  label: "Cached Tokens",
                  tone: "cached",
                  values: compact.map((bucket) => bucket.cachedTokens),
                },
              ]}
              formatTick={formatTokens}
              formatValue={formatTokens}
            />
          )}
        </ChartCard>

        <ChartCard
          compact
          title="Prompt Input Tokens"
          legend={
            <ChartLegend items={[{ label: rangeLabel, tone: "prompt" }]} labelTone="primary" />
          }
        >
          {loading ? (
            placeholder
          ) : (
            <LineChart
              label="Prompt input tokens over the selected dates"
              variant="compact"
              categories={compactCategories}
              series={[
                {
                  id: "prompt",
                  label: "Prompt Input Tokens",
                  tone: "prompt",
                  values: compact.map((bucket) =>
                    Math.max(0, bucket.inputTokens - bucket.cachedTokens),
                  ),
                },
              ]}
              formatTick={formatTokens}
              formatValue={formatTokens}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
