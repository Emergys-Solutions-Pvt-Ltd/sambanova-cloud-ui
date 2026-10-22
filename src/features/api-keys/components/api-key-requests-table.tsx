"use client";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
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
import { type PaginatedResponse } from "@/lib/api";
import { formatNumber, formatRequestTime, formatResponseTime } from "@/lib/format";
import { type ApiKeyRequestLog } from "@/types/domain";

/** Token counts of failed requests are missing; the table shows a dash like Figma. */
export const tokenCount = (value: number | null) => (value === null ? "-" : formatNumber(value));

export function RequestStatusBadge({
  status,
  shape = "rounded",
}: {
  status: ApiKeyRequestLog["status"];
  shape?: "rounded" | "capsule";
}) {
  return (
    <Badge variant={status === "success" ? "success" : "error"} shape={shape}>
      {status === "success" ? "Success" : "Error"}
    </Badge>
  );
}

interface ApiKeyRequestsTableProps {
  /** `undefined` while the first page loads. */
  result: PaginatedResponse<ApiKeyRequestLog> | undefined;
  onPageChange: (page: number) => void;
  /** Opens the Request Details drawer for a row (the eye action). */
  onView: (log: ApiKeyRequestLog) => void;
  /** Dims the rows while another page or date range loads. */
  loadingMore?: boolean;
}

const COLUMNS = 8;

/** "API Request Logs" table with its range summary and pagination (Figma: Req Table). */
export function ApiKeyRequestsTable({
  result,
  onPageChange,
  onView,
  loadingMore,
}: ApiKeyRequestsTableProps) {
  const rows = result?.data ?? [];

  return (
    <TableCard footer={<PaginationFooter result={result} onPageChange={onPageChange} />}>
      {/* Fixed layout: every column but Request has the width from Figma, Request takes the rest and truncates. */}
      <Table
        caption="API request logs"
        aria-busy={loadingMore || !result || undefined}
        minWidth="xl"
        className="table-fixed"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Request</TableHeaderCell>
            <TableHeaderCell className="w-48.75">Time</TableHeaderCell>
            <TableHeaderCell className="w-42.25">Model</TableHeaderCell>
            <TableHeaderCell className="w-30.25">Response Time</TableHeaderCell>
            <TableHeaderCell align="right" className="w-33">
              Input Tokens
            </TableHeaderCell>
            <TableHeaderCell align="right" className="w-33">
              Output Tokens
            </TableHeaderCell>
            <TableHeaderCell align="center" className="w-26.75">
              Status
            </TableHeaderCell>
            <TableHeaderCell align="center" className="w-37.75">
              Action
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className={loadingMore ? "opacity-60 transition-opacity" : undefined}>
          {!result &&
            Array.from({ length: 7 }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: COLUMNS }, (_, cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-4 w-full max-w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {result && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS} tone="muted" className="h-24 text-center">
                No requests were made with this key in the selected dates.
              </TableCell>
            </TableRow>
          )}

          {rows.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <span className="block truncate" title={log.request}>
                  {log.request}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatRequestTime(log.requestedAt)}
              </TableCell>
              <TableCell>
                <span className="block truncate" title={log.model}>
                  {log.model}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatResponseTime(log.responseTimeMs)}
              </TableCell>
              <TableCell className="text-right">{tokenCount(log.inputTokens)}</TableCell>
              <TableCell className="text-right">{tokenCount(log.outputTokens)}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <RequestStatusBadge status={log.status} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <IconButton
                    icon="eye"
                    size="xs"
                    variant="contrast"
                    aria-label={`View details of request ${log.id}`}
                    onClick={() => onView(log)}
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
