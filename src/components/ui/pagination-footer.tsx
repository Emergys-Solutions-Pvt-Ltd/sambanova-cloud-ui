import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";

/** "Showing **1-10** of **1000**" */
function RangeSummary({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  if (total === 0) return <p className="text-body text-secondary">Showing 0 of 0</p>;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <p className="text-body text-secondary">
      Showing <strong className="font-semibold">{`${start}-${end}`}</strong> of{" "}
      <strong className="font-semibold">{total}</strong>
    </p>
  );
}

interface PaginationFooterProps {
  /** `undefined` while the first page loads. */
  result: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPageChange: (page: number) => void;
}

/** Footer of a paginated table card: the range summary on the left, the page buttons on the right. */
export function PaginationFooter({ result, onPageChange }: PaginationFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4">
      {result ? (
        <>
          <RangeSummary page={result.page} pageSize={result.pageSize} total={result.total} />
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
