import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";

/**
 * Colours of "Showing **1-10** of **1000**" in the Figma footers: "default" is all secondary (API
 * Keys); "muted" dims the words and keeps the numbers secondary (Usage); "bright" dims the words
 * and makes the numbers near-white (Pricing).
 */
export type SummaryTone = "default" | "muted" | "bright";

const wordTones: Record<SummaryTone, string> = {
  default: "text-secondary",
  muted: "text-muted",
  bright: "text-muted",
};
const numberTones: Record<SummaryTone, string> = {
  default: "font-semibold",
  muted: "font-semibold text-secondary",
  bright: "font-semibold text-primary",
};

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
  if (total === 0) return <p className={`text-body ${wordTones[tone]}`}>Showing 0 of 0</p>;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <p className={`text-body ${wordTones[tone]}`}>
      Showing <strong className={numberTones[tone]}>{`${start}-${end}`}</strong> of{" "}
      <strong className={numberTones[tone]}>{total}</strong>
    </p>
  );
}

interface PaginationFooterProps {
  /** `undefined` while the first page loads. */
  result: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPageChange: (page: number) => void;
  /** Colour of the "Showing 1-10 of 1000" text. Default "default". */
  summaryTone?: SummaryTone;
}

/**
 * Footer of a paginated table card: the range summary on the left, the page buttons on the right.
 * Figma's footer is 65px with its 1px top stroke inside the 16px padding; `TableCard` draws that
 * stroke as the footer's border, so the top padding is 15px.
 */
export function PaginationFooter({
  result,
  onPageChange,
  summaryTone = "default",
}: PaginationFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-3.75 pb-4">
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
          />
        </>
      ) : (
        // As high as the 33px page buttons, so the card does not grow when the first page arrives.
        <div className="flex h-8.25 items-center">
          <Skeleton className="h-6 w-36" />
        </div>
      )}
    </div>
  );
}
