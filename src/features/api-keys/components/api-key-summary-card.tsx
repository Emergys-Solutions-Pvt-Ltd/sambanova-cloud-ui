import { type ReactNode } from "react";

import { Icon } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { type ApiKeyDetail } from "@/types/domain";

/** The usage card masks a key as a prefix, dots and the last four characters (Figma: sk-prod-•••••••••••••XkR9). */
const maskedSecret = (key: ApiKeyDetail) => `sk-prod-${"•".repeat(13)}${key.lastFour}`;

function KeyStatusChip({ status }: { status: ApiKeyDetail["status"] }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex h-5.5 min-w-16.5 items-center gap-1.25 rounded-full border pr-2 pl-1.75 text-micro font-medium",
        active
          ? "border-chip-live bg-chip-live text-chip-live"
          : "border-error-border bg-error-bg text-error",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function Meta({ label, children, first }: { label: string; children: ReactNode; first?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex items-baseline gap-2",
        // Thin purple divider between the three facts when they share a row (stacked below `sm`).
        !first &&
          "sm:pl-5 sm:before:absolute sm:before:top-1/2 sm:before:left-0 sm:before:h-3.5 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-meta-divider",
      )}
    >
      <dt className="text-tiny leading-tight font-bold tracking-normal whitespace-nowrap text-meta-label uppercase">
        {label}
      </dt>
      <dd className="text-body leading-tight font-medium whitespace-nowrap text-primary">
        {children}
      </dd>
    </div>
  );
}

/** The key being inspected: icon, name, masked secret, status and who created it (Figma: key card). */
export function ApiKeySummaryCard({ apiKey }: { apiKey: ApiKeyDetail | undefined }) {
  return (
    <section
      aria-label="API key"
      aria-busy={!apiKey || undefined}
      className="flex min-h-23 flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-lg border border-default bg-surface px-6 py-4.75"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-key-icon text-brand-secondary">
          <Icon name="key" size="lg" />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          {apiKey ? (
            <>
              <h2 className="truncate text-body-lg font-semibold text-primary">{apiKey.name}</h2>
              <p className="truncate text-caption font-normal text-muted">{maskedSecret(apiKey)}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-48" />
            </>
          )}
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-3">
        {apiKey ? <KeyStatusChip status={apiKey.status} /> : <Skeleton className="h-5.5 w-16.5" />}
        {apiKey ? (
          <dl className="flex flex-col items-end gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-5">
            <Meta label="Created by" first>
              {apiKey.createdBy}
            </Meta>
            <Meta label="Created on">{formatDateTime(apiKey.createdAt)}</Meta>
            <Meta label="Last used">
              {apiKey.lastUsedAt ? formatRelativeTime(apiKey.lastUsedAt) : "Never"}
            </Meta>
          </dl>
        ) : (
          <Skeleton className="h-5 w-80 max-w-full" />
        )}
      </div>
    </section>
  );
}
