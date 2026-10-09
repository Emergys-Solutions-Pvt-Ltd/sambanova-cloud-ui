"use client";

import Link from "next/link";

import { SectionHeader } from "@/components/layout/section-header";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Icon, type IconName } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useActiveProject } from "@/features/projects";
import { formatNumber, formatUsd } from "@/lib/format";
import { selectSessionStatus, useSessionStore } from "@/stores/session-store";
import { type UsageOverview as UsageOverviewData } from "@/types/domain";

import { useUsageOverview } from "../hooks/use-dashboard-data";

interface Stat {
  label: string;
  icon: IconName;
  value: (data: UsageOverviewData) => string;
  action?: { label: string; href: string };
}

const stats: Stat[] = [
  { label: "Tokens Used", icon: "coin", value: (d) => formatNumber(d.tokensUsed) },
  { label: "API Requests", icon: "api", value: (d) => formatNumber(d.apiRequests) },
  { label: "Active API Keys", icon: "key", value: (d) => formatNumber(d.activeApiKeys) },
  {
    label: "Credits Remaining",
    icon: "credit-card",
    value: (d) => formatUsd(d.creditsRemaining),
    action: { label: "Add Credits", href: routes.settingsBilling },
  },
];

/** Four headline numbers for the active project. Signed-in users only. */
export function UsageOverview() {
  const status = useSessionStore(selectSessionStatus);
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
          {stats.map((stat) => (
            <li key={stat.label}>
              <Card className="flex h-full min-h-23.25 flex-col gap-2.5">
                <dl className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-body text-muted">{stat.label}</dt>
                    <Icon name={stat.icon} size={22} className="text-accent" />
                  </div>
                  <dd className="flex items-end justify-between gap-2">
                    {query.data ? (
                      <span className="text-heading-xl font-bold">{stat.value(query.data)}</span>
                    ) : (
                      <Skeleton className="h-7 w-16" />
                    )}
                    {stat.action && (
                      <Link
                        href={stat.action.href}
                        className="rounded-xs text-caption font-semibold text-primary underline underline-offset-2"
                      >
                        {stat.action.label}
                      </Link>
                    )}
                  </dd>
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
