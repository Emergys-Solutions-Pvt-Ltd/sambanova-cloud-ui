"use client";

import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { type PaginatedResponse } from "@/lib/api";
import { type ApiKey } from "@/types/domain";

import { ApiKeyActionsMenu } from "./api-key-actions-menu";

/** Figma shows keys as "sdk_live" + dots + the last four characters. */
export const maskedKeyId = (key: ApiKey) => `sdk_live...........${key.lastFour}`;

function StatusBadge({ status }: { status: ApiKey["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "error"} shape="rounded">
      {status === "active" ? "Active" : "Disabled"}
    </Badge>
  );
}

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

interface ApiKeysTableProps {
  /** `undefined` while the first page loads. */
  result: PaginatedResponse<ApiKey> | undefined;
  /** True when a search or status filter is active (changes the empty message). */
  filtered: boolean;
  onPageChange: (page: number) => void;
  /** Dims the rows while the next page loads. */
  loadingMore?: boolean;
}

/** The API keys table with its range summary and pagination (Figma: API Keys). */
export function ApiKeysTable({ result, filtered, onPageChange, loadingMore }: ApiKeysTableProps) {
  const rows = result?.data ?? [];

  return (
    <TableCard
      footer={
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
      }
    >
      <Table caption="API keys" aria-busy={loadingMore || !result || undefined}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Key Name</TableHeaderCell>
            <TableHeaderCell>Key ID</TableHeaderCell>
            <TableHeaderCell>Created On</TableHeaderCell>
            <TableHeaderCell>Last Used</TableHeaderCell>
            <TableHeaderCell className="w-23.25">Status</TableHeaderCell>
            <TableHeaderCell className="w-33.75 text-center">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className={loadingMore ? "opacity-60 transition-opacity" : undefined}>
          {!result &&
            Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }, (_, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {result && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted">
                {filtered ? "No API keys match your search or filter." : "No API keys yet."}
              </TableCell>
            </TableRow>
          )}

          {rows.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-normal">{key.name}</TableCell>
              <TableCell>{maskedKeyId(key)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDateTime(key.createdAt)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : "Never"}
              </TableCell>
              <TableCell>
                <StatusBadge status={key.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <ApiKeyActionsMenu apiKey={key} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}
