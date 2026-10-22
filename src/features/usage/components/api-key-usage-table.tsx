"use client";

import { IconLink } from "@/components/ui/icon-button";
import { PaginationFooter } from "@/components/ui/pagination-footer";
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
import { routes } from "@/config/routes";
import { type PaginatedResponse } from "@/lib/api";
import {
  formatCompactNumber,
  formatDateTime,
  formatRelativeTime,
  formatUsdPrecise,
} from "@/lib/format";
import { type ApiKeyUsageRow } from "@/types/domain";

const COLUMNS = 6;

interface ApiKeyUsageTableProps {
  /** `undefined` while the first page loads. */
  result: PaginatedResponse<ApiKeyUsageRow> | undefined;
  /** Rows shown as placeholders while the first page loads. */
  pageSize: number;
  /** The chosen dates as a query string ("range=last-7-days"), so a key's page opens on the same dates. */
  rangeQuery: string;
  onPageChange: (page: number) => void;
  /** Dims the rows while another page or date range loads. */
  loadingMore?: boolean;
}

/** "API Key Usage" table: each key with its requests and spend in the range (Figma: Usage). */
export function ApiKeyUsageTable({
  result,
  pageSize,
  rangeQuery,
  onPageChange,
  loadingMore,
}: ApiKeyUsageTableProps) {
  const rows = result?.data ?? [];

  return (
    <TableCard
      footer={<PaginationFooter result={result} onPageChange={onPageChange} summaryTone="muted" />}
    >
      {/* Fixed layout: Spend, Created On and Actions have the widths from Figma, the rest share what is left. */}
      <Table
        caption="API key usage"
        aria-busy={loadingMore || !result || undefined}
        className="min-w-250 table-fixed"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Key Name</TableHeaderCell>
            <TableHeaderCell>Requests</TableHeaderCell>
            <TableHeaderCell className="w-41.75">Spend</TableHeaderCell>
            <TableHeaderCell className="w-59.25">Created On</TableHeaderCell>
            <TableHeaderCell>Last Used</TableHeaderCell>
            <TableHeaderCell align="center" className="w-33.75">
              Actions
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className={loadingMore ? "opacity-60 transition-opacity" : undefined}>
          {!result &&
            Array.from({ length: pageSize }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: COLUMNS }, (_, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {result && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center text-muted">
                No API keys yet.
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <span className="block truncate" title={row.name}>
                  {row.name}
                </span>
              </TableCell>
              <TableCell>{formatCompactNumber(row.totalRequests)}</TableCell>
              <TableCell>{formatUsdPrecise(row.estimatedSpend)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDateTime(row.createdAt)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {row.lastUsedAt ? formatRelativeTime(row.lastUsedAt) : "Never"}
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <IconLink
                    href={`${routes.apiKeys}/${encodeURIComponent(row.id)}/usage${rangeQuery ? `?${rangeQuery}` : ""}`}
                    icon="eye"
                    size="xs"
                    variant="contrast"
                    aria-label={`View usage of ${row.name}`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}
