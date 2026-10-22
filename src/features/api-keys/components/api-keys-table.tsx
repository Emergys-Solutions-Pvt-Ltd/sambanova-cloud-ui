"use client";

import { Badge } from "@/components/ui/badge";
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
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { type PaginatedResponse } from "@/lib/api";
import { type ApiKey } from "@/types/domain";

import { ApiKeyActionsMenu } from "./api-key-actions-menu";

/** Figma shows keys as "sdk_live" + dots + the last four characters. */
export const maskedKeyId = (key: ApiKey) => `sdk_live...........${key.lastFour}`;

function StatusBadge({ status }: { status: ApiKey["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "error"} size="xl" shape="rounded">
      {status === "active" ? "Active" : "Disabled"}
    </Badge>
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
    <TableCard footer={<PaginationFooter result={result} onPageChange={onPageChange} />}>
      <Table caption="API keys" aria-busy={loadingMore || !result || undefined}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Key Name</TableHeaderCell>
            <TableHeaderCell>Key ID</TableHeaderCell>
            <TableHeaderCell>Created On</TableHeaderCell>
            <TableHeaderCell>Last Used</TableHeaderCell>
            <TableHeaderCell className="w-23.25">Status</TableHeaderCell>
            <TableHeaderCell align="center" className="w-33.75">
              Actions
            </TableHeaderCell>
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
              <TableCell colSpan={6} tone="muted" className="h-24 text-center">
                {filtered ? "No API keys match your search or filter." : "No API keys yet."}
              </TableCell>
            </TableRow>
          )}

          {rows.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                {/* Figma cell: name and tag are top-aligned, 16px apart (the tag is 22px high, the name line 21px). */}
                <div className="flex items-start gap-4">
                  {key.name}
                  {key.renamedAt && (
                    <Badge variant="edited" size="xl" shape="rounded">
                      Edited
                    </Badge>
                  )}
                </div>
              </TableCell>
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
