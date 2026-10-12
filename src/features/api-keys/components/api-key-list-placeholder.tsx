import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { type ApiKey } from "@/types/domain";

/** Figma shows keys as "sdk_live" + dots + the last four characters. */
const maskedKeyId = (key: ApiKey) => `sdk_live...........${key.lastFour}`;

/**
 * TEMPORARY stand-in so created keys are visible. Replace with the key table (search, status
 * filter, pagination, row actions) from the Figma "API Keys" screen.
 */
export function ApiKeyListPlaceholder({ keys }: { keys: ApiKey[] }) {
  return (
    <section aria-labelledby="api-key-list-title" className="flex w-full flex-col gap-3">
      <h2 id="api-key-list-title" className="text-heading-xs">
        {keys.length === 1 ? "1 API key" : `${keys.length} API keys`}
      </h2>
      <Card padding="none" className="overflow-hidden">
        <ul className="divide-y divide-(--sn-border-default)">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-4"
            >
              <span className="text-body font-medium">{key.name}</span>
              <span className="flex flex-wrap items-center gap-x-6 gap-y-1 text-body-sm text-muted">
                <span>{maskedKeyId(key)}</span>
                <span>Created {formatDate(key.createdAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-caption text-muted">
        Temporary list. The key table with search, status filter and actions is built later.
      </p>
    </section>
  );
}
