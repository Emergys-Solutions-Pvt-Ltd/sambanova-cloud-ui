import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";

/**
 * "Showing **1-10** of **1000**". "default" draws it all in the secondary text colour (Figma: API
 * Keys); "muted" dims the words and keeps the numbers secondary (Figma: Usage).
 */
function RangeSummary({
  page,
  pageSize,
  total,
  tone,
}: {
  page: number;
  pageSize: number;
  total: number;
  tone: "default" | "muted";
}) {
  const words = tone === "muted" ? "text-muted" : "text-secondary";
  if (total === 0) return <p className={`text-body ${words}`}>Showing 0 of 0</p>;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const numbers = tone === "muted" ? "font-semibold text-secondary" : "font-semibold";
  return (
    <p className={`text-body ${words}`}>
      Showing <strong className={numbers}>{`${start}-${end}`}</strong> of{" "}
      <strong className={numbers}>{total}</strong>
    </p>
  );
}

interface PaginationFooterProps {
  /** `undefined` while the first page loads. */
  result: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPageChange: (page: number) => void;
  /** Colour of the "Showing 1-10 of 1000" text. Default "default". */
  summaryTone?: "default" | "muted";
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
        <Skeleton className="h-6 w-36" />
      )}
    </div>
  );
}
