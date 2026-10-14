import { Icon, type IconName } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCompactNumber, formatNumber, formatUsdPrecise } from "@/lib/format";
import { type ApiKeyUsageStats } from "@/types/domain";

const cards: {
  label: string;
  icon: IconName;
  value: (stats: ApiKeyUsageStats) => string;
}[] = [
  {
    label: "Total Requests",
    icon: "activity",
    value: (stats) => formatNumber(stats.totalRequests),
  },
  {
    label: "Input Tokens",
    icon: "database",
    value: (stats) => formatCompactNumber(stats.inputTokens),
  },
  {
    label: "Output Tokens",
    icon: "trending-up",
    value: (stats) => formatCompactNumber(stats.outputTokens),
  },
  {
    label: "Estimated Spend",
    icon: "coin",
    value: (stats) => formatUsdPrecise(stats.estimatedSpend),
  },
];

interface UsageStatCardsProps {
  /** `undefined` while the first numbers load. */
  stats: ApiKeyUsageStats | undefined;
  /** Dims the numbers while a new date range loads. */
  refreshing?: boolean;
}

/** Total requests, input tokens, output tokens and estimated spend for the chosen range (Figma: stat cards). */
export function UsageStatCards({ stats, refreshing }: UsageStatCardsProps) {
  return (
    <dl
      aria-busy={!stats || refreshing || undefined}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ label, icon, value }) => (
        <div
          key={label}
          className="flex flex-col gap-2.5 rounded-lg border border-default bg-stat-card p-3.75"
        >
          <dt className="flex items-center justify-between gap-2 text-body text-muted">
            <span>{label}</span>
            <Icon name={icon} size={22} className="text-stat-icon" />
          </dt>
          <dd
            className={cn(
              "text-heading-xl font-bold text-primary transition-opacity duration-(--sn-duration-fast)",
              refreshing && "opacity-60",
            )}
          >
            {stats ? value(stats) : <Skeleton className="my-1 h-6 w-24" />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
