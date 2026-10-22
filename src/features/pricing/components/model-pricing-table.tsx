"use client";

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
import { formatCompactNumber, formatUsdPrice } from "@/lib/format";
import { type ModelPriceRow } from "@/types/domain";

const COLUMNS = 5;
/** Placeholder rows while the first page loads: today's eight models. */
const SKELETON_ROWS = 8;

interface ModelPricingTableProps {
  /** `undefined` while the first page loads. */
  result: PaginatedResponse<ModelPriceRow> | undefined;
  onPageChange: (page: number) => void;
  /** Dims the rows while another page loads. */
  loadingMore?: boolean;
}

/** Model prices with their range summary and pagination (Figma: Plans & Pricing). */
export function ModelPricingTable({ result, onPageChange, loadingMore }: ModelPricingTableProps) {
  const rows = result?.data ?? [];

  return (
    <TableCard
      footer={<PaginationFooter result={result} onPageChange={onPageChange} summaryTone="bright" />}
    >
      {/* Fixed layout: Model has Figma's 281px, the four price columns share the rest. */}
      <Table
        caption="Model pricing"
        aria-busy={loadingMore || !result || undefined}
        className="min-w-250 table-fixed"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell tone="bright" className="w-70.25">
              Model
            </TableHeaderCell>
            <TableHeaderCell tone="bright">Context Window</TableHeaderCell>
            <TableHeaderCell tone="bright">Cached Input Tokens</TableHeaderCell>
            <TableHeaderCell tone="bright">Input (per 1M token)</TableHeaderCell>
            <TableHeaderCell tone="bright">Output (per 1M token)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className={loadingMore ? "opacity-60 transition-opacity" : undefined}>
          {!result &&
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: COLUMNS }, (_, cell) => (
                  <TableCell key={cell} tone="bright">
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {result && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS} tone="muted" className="h-24 text-center">
                No model prices are available.
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell tone="bright">
                <span className="block truncate" title={row.name}>
                  {row.name}
                </span>
              </TableCell>
              <TableCell tone="bright">{formatCompactNumber(row.contextWindow)}</TableCell>
              <TableCell tone="bright">
                {row.cachedInputPrice === null ? "N/A" : formatUsdPrice(row.cachedInputPrice)}
              </TableCell>
              <TableCell tone="bright">{formatUsdPrice(row.inputPrice)}</TableCell>
              <TableCell tone="bright">{formatUsdPrice(row.outputPrice)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}
