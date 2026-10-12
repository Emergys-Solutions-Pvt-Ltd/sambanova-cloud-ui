"use client";

import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Icon, type IconName } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveProject } from "@/features/projects";
import { formatNumber, formatUsd } from "@/lib/format";
import { useAddCreditsDialogStore } from "@/stores/add-credits-dialog-store";
import { selectCreditBalance, selectSessionStatus, useSessionStore } from "@/stores/session-store";
import { type UsageOverview as UsageOverviewData } from "@/types/domain";

import { useUsageOverview } from "../hooks/use-dashboard-data";

interface ProjectStat {
  label: string;
  icon: IconName;
  value: (data: UsageOverviewData) => string;
}

/** Numbers that belong to the active project. */
const projectStats: ProjectStat[] = [
  { label: "Tokens Used", icon: "coin", value: (d) => formatNumber(d.tokensUsed) },
  { label: "API Requests", icon: "api", value: (d) => formatNumber(d.apiRequests) },
  { label: "Active API Keys", icon: "key", value: (d) => formatNumber(d.activeApiKeys) },
];

function StatCard({
  label,
  icon,
  value,
  action,
}: {
  label: string;
  icon: IconName;
  /** `undefined` while loading. */
  value: string | undefined;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <li>
      <Card className="flex h-full min-h-23.25 flex-col gap-2.5">
        <dl className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-body text-muted">{label}</dt>
            <Icon name={icon} size={22} className="text-accent" />
          </div>
          <dd className="flex items-end justify-between gap-2">
            {value !== undefined ? (
              <span className="text-heading-xl font-bold">{value}</span>
            ) : (
              <Skeleton className="h-7 w-16" />
            )}
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                aria-haspopup="dialog"
                className="rounded-xs text-caption font-semibold text-primary underline underline-offset-2"
              >
                {action.label}
              </button>
            )}
          </dd>
        </dl>
      </Card>
    </li>
  );
}

/**
 * Headline numbers. Usage belongs to the active project; the credit balance belongs to the
 * signed-in user (it is the same in every project). Signed-in users only.
 */
export function UsageOverview() {
  const status = useSessionStore(selectSessionStatus);
  const creditBalance = useSessionStore(selectCreditBalance);
  const openAddCredits = useAddCreditsDialogStore((state) => state.openDialog);
  const { project } = useActiveProject();
  const query = useUsageOverview(status === "authenticated" ? project?.id : undefined);

  if (status !== "authenticated") return null;

  return (
    <section aria-labelledby="usage-overview-title" className="flex flex-col gap-4">
      <SectionHeader id="usage-overview-title" title="Usage Overview" />

      {query.error ? (
        <ErrorState
          message="Couldn’t load usage for this project."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {projectStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              icon={stat.icon}
              value={query.data ? stat.value(query.data) : undefined}
            />
          ))}
          <StatCard
            label="Credits Remaining"
            icon="credit-card"
            value={creditBalance !== null ? formatUsd(creditBalance) : undefined}
            action={{ label: "Add Credits", onClick: openAddCredits }}
          />
        </ul>
      )}
    </section>
  );
}
