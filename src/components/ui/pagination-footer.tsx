import { cn } from "@/lib/cn";

import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";

/** Colour of the words "Showing" and "of"; the numbers are always gray-300. */
type SummaryTone = "secondary" | "muted";

const summaryTones: Record<SummaryTone, string> = {
  secondary: "text-secondary",
  muted: "text-muted",
};

/** "Showing **1-10** of **1000**" */
function RangeSummary({
  page,
  pageSize,
  total,
  tone,
}: {
  page: number;
  pageSize: number;
  total: number;
  tone: SummaryTone;
}) {
  const className = cn("text-body", summaryTones[tone]);
  if (total === 0) return <p className={className}>Showing 0 of 0</p>;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <p className={className}>
      Showing <strong className="font-semibold text-secondary">{`${start}-${end}`}</strong> of{" "}
      <strong className="font-semibold text-secondary">{total}</strong>
    </p>
  );
}

interface PaginationFooterProps {
  /** `undefined` while the first page loads. */
  result: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPageChange: (page: number) => void;
  /** Accessible name of the page buttons, e.g. "Members pages". */
  label?: string;
  /** "secondary" = one colour throughout (Figma: API Keys); "muted" = gray-400 words (Project Settings). */
  summaryTone?: SummaryTone;
}

/** Footer of a paginated table card: the range summary on the left, the page buttons on the right. */
export function PaginationFooter({
  result,
  onPageChange,
  label,
  summaryTone = "secondary",
}: PaginationFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4">
      {result ? (
        <>
          <RangeSummary
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            tone={summaryTone}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={onPageChange}
            label={label}
          />
        </>
      ) : (
        <Skeleton className="h-6 w-36" />
      )}
    </div>
  );
}
