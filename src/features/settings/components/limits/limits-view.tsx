"use client";

import { Fragment } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableMessageRow,
  TableSkeletonRows,
} from "@/components/ui/table";
import { usePartners } from "@/features/dashboard";
import { cn } from "@/lib/cn";
import { formatCompactNumber, formatUsd } from "@/lib/format";
import { type ProjectLimits } from "@/types/domain";

import { useLimits } from "../../hooks/use-limits";
import { useSettingsProject } from "../../hooks/use-settings-project";

const strong = "font-bold text-primary";

/** "explore our trusted cloud partners: Infercom, ArgyllData, and SCX." (links from the partners API). */
function PartnerLinks() {
  const partners = usePartners().data ?? [];
  if (partners.length === 0) return <>explore our trusted cloud partners.</>;

  return (
    <>
      explore our trusted cloud partners:{" "}
      {partners.map((partner, index) => (
        <Fragment key={partner.id}>
          {index > 0 &&
            (index === partners.length - 1 ? (partners.length > 2 ? ", and " : " and ") : ", ")}
          <a
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(strong, "underline underline-offset-2 hover:text-link-hover")}
          >
            {partner.name}
          </a>
        </Fragment>
      ))}
      .
    </>
  );
}

/** "Usage Tiers" card (Figma `1387:66486`): one segment per tier, filled up to the current tier. */
function UsageTiers({ limits }: { limits: ProjectLimits }) {
  const next = limits.tiers.find((tier) => tier.level === limits.currentTier + 1);
  const remaining = next ? Math.max(0, next.threshold - limits.spend) : 0;

  return (
    <section
      aria-labelledby="usage-tiers-title"
      className="flex flex-col gap-7 rounded-lg border border-default bg-surface p-6"
    >
      <h2 id="usage-tiers-title" className="text-heading-sm leading-[1.2] font-bold text-primary">
        Usage Tiers
      </h2>

      <ol className="flex gap-2" aria-label="Usage tiers">
        {limits.tiers.map((tier) => {
          const current = tier.level === limits.currentTier;
          const reached = tier.level <= limits.currentTier;
          return (
            <li
              key={tier.level}
              aria-current={current ? "step" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center gap-3"
            >
              <div className="flex flex-col items-center gap-1 leading-[1.2] whitespace-nowrap">
                <span
                  className={cn(
                    "text-body",
                    current ? "font-bold text-tier-active" : "font-semibold text-muted",
                  )}
                >
                  Tier {tier.level}
                </span>
                <span className="text-caption font-normal text-muted">
                  {formatUsd(tier.threshold)}
                </span>
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  "h-2.5 w-full rounded-[2px] border",
                  reached
                    ? "border-tier-active-border bg-tier-active"
                    : "border-tier-idle-border bg-tier-idle",
                )}
              />
            </li>
          );
        })}
      </ol>

      <p className="border-t border-default pt-4 text-body-sm leading-normal text-muted">
        {next ? (
          <>
            Spend <span className={strong}>{formatUsd(remaining)}</span> more to unlock{" "}
            <span className={strong}>Tier {next.level}</span>.{" "}
          </>
        ) : (
          <>
            You’re on the highest tier, <span className={strong}>Tier {limits.currentTier}</span>
            .{" "}
          </>
        )}
        For dedicated infrastructure, custom deployments, and enterprise-scale AI workloads,{" "}
        <PartnerLinks />
      </p>
    </section>
  );
}

/** "Rate limits" table (Figma `1387:66518`): per-model requests and tokens per minute. */
function RateLimits({ limits, loading }: { limits: ProjectLimits | undefined; loading: boolean }) {
  return (
    <section aria-labelledby="rate-limits-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="rate-limits-title" className="text-heading-sm leading-[1.2] font-bold text-primary">
          Rate limits
        </h2>
        <p className="text-body text-secondary">
          Rate limits are applied per model and determine the maximum API throughput available to
          your project.
        </p>
      </div>

      <TableCard radius="md" className="bg-surface">
        <Table caption="Rate limits" aria-busy={loading}>
          <TableHead>
            <tr>
              <TableHeaderCell>Model</TableHeaderCell>
              <TableHeaderCell>Requests per Minute</TableHeaderCell>
              <TableHeaderCell>Input Tokens per Minute</TableHeaderCell>
              <TableHeaderCell>Output Tokens per Minute</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={4} />
            ) : limits && limits.rateLimits.length > 0 ? (
              limits.rateLimits.map((limit) => (
                <tr key={limit.modelId}>
                  <TableCell className="text-muted">{limit.modelName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCompactNumber(limit.requestsPerMinute)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-primary">
                    {formatCompactNumber(limit.inputTokensPerMinute)}{" "}
                    <span className="text-muted">excluding cache reads</span>
                  </TableCell>
                  <TableCell>{formatCompactNumber(limit.outputTokensPerMinute)}</TableCell>
                </tr>
              ))
            ) : (
              <TableMessageRow colSpan={4}>
                No rate limits are set for this project.
              </TableMessageRow>
            )}
          </TableBody>
        </Table>
      </TableCard>
    </section>
  );
}

function TiersSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading usage tiers"
      className="flex flex-col gap-7 rounded-lg border border-default p-6"
    >
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 flex-1" />
        ))}
      </div>
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/** Project Settings › Limits (Figma `1387:66468`). */
export function LimitsView() {
  const { projectId, loading } = useSettingsProject();
  const limits = useLimits(projectId);
  const pending = loading || limits.isPending;

  if (limits.isError) {
    return (
      <ErrorState
        message="We couldn’t load this project’s limits."
        onRetry={() => void limits.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {pending || !limits.data ? <TiersSkeleton /> : <UsageTiers limits={limits.data} />}
      <RateLimits limits={limits.data} loading={pending} />
    </div>
  );
}
