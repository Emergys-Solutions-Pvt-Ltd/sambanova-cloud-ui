import { Icon, type IconName } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCompactNumber, formatNumber, formatUsdPrecise } from "@/lib/format";
import { type ApiKeyUsageStats } from "@/types/domain";

/**
 * The two Figma versions of the cards. "key" (View API Key Usage) has the purple gradient, lavender
 * icons and the full request count; "project" (Usage) has that fill turned off, accent-purple icons
 * and the request count as "2.45M".
 */
export type UsageStatVariant = "key" | "project";

const variantStyles: Record<
  UsageStatVariant,
  { card: string; icon: string; compactRequests: boolean }
> = {
  key: { card: "bg-stat-card", icon: "text-stat-icon", compactRequests: false },
  project: { card: "", icon: "text-accent", compactRequests: true },
};

const cards: {
  label: string;
  icon: IconName;
  value: (stats: ApiKeyUsageStats, compactRequests: boolean) => string;
}[] = [
  {
    label: "Total Requests",
    icon: "activity",
    value: (stats, compactRequests) =>
      compactRequests
        ? formatCompactNumber(stats.totalRequests, 2)
        : formatNumber(stats.totalRequests),
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
  /** Which Figma version to draw. Default "key". */
  variant?: UsageStatVariant;
}

/** Total requests, input tokens, output tokens and estimated spend for the chosen range (Figma: stat cards). */
export function UsageStatCards({ stats, refreshing, variant = "key" }: UsageStatCardsProps) {
  const style = variantStyles[variant];

  return (
    <dl
      aria-busy={!stats || refreshing || undefined}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ label, icon, value }) => (
        <div
          key={label}
          className={cn(
            "flex flex-col gap-2.5 rounded-lg border border-default p-3.75",
            style.card,
          )}
        >
          <dt className="flex items-center justify-between gap-2 text-body text-muted">
            <span>{label}</span>
            <Icon name={icon} size={22} className={style.icon} />
          </dt>
          {/* Figma's value line is 29px, so the card is 93px high with its 15px padding and 1px border. */}
          <dd
            className={cn(
              "text-heading-xl leading-7.25 font-bold text-primary transition-opacity duration-(--sn-duration-fast)",
              refreshing && "opacity-60",
            )}
          >
            {stats ? (
              value(stats, style.compactRequests)
            ) : (
              <Skeleton className="my-0.625 h-6 w-24" />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
