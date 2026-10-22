"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableMessageRow,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui/table";
import { formatOrdinalDate, formatUsdPrecise } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { type Invoice } from "@/types/domain";

import { useDownloadInvoice, useInvoices } from "../hooks/use-billing";

export const INVOICES_PAGE_SIZE = 10;
const COLUMNS = 5;

const statusBadge: Record<Invoice["status"], { label: string; variant: "success" | "error" }> = {
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "error" },
};

/** Invoices table (Figma: Billing › Invoices). Pagination appears once there is more than one page. */
export function InvoicesTable() {
  const [page, setPage] = useState(1);
  const invoices = useInvoices({ page, pageSize: INVOICES_PAGE_SIZE });
  const download = useDownloadInvoice();
  const result = invoices.data;

  const onDownload = (invoice: Invoice) =>
    download.mutate(
      { id: invoice.id, number: invoice.number },
      { onError: () => toast.danger(`Could not download ${invoice.number}. Try again.`) },
    );

  return (
    <section aria-labelledby="invoices-title" className="flex flex-col gap-4">
      <h2 id="invoices-title" className="text-heading-sm leading-[1.2] font-bold text-content">
        Invoices
      </h2>
      <TableCard
        radius="md"
        footer={
          result && result.totalPages > 1 ? (
            <PaginationFooter
              result={result}
              onPageChange={setPage}
              label="Invoice pages"
              summaryTone="muted"
            />
          ) : undefined
        }
      >
        <Table caption="Invoices" minWidth="sm" className="table-fixed">
          <colgroup>
            <col className="w-37.25" />
            <col />
            <col />
            <col />
            <col className="w-24" />
          </colgroup>
          <TableHead>
            <tr>
              <TableHeaderCell>Invoice ID</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-center">Action</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {invoices.isPending ? (
              <TableSkeletonRows rows={5} columns={COLUMNS} />
            ) : invoices.isError ? (
              <TableMessageRow colSpan={COLUMNS}>
                Couldn’t load invoices.{" "}
                <button
                  type="button"
                  onClick={() => void invoices.refetch()}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Try again
                </button>
              </TableMessageRow>
            ) : result && result.data.length > 0 ? (
              result.data.map((invoice) => {
                const status = statusBadge[invoice.status];
                return (
                  <TableRow key={invoice.id}>
                    <TableCell tone="muted">{invoice.number}</TableCell>
                    <TableCell tone="muted" className="font-semibold whitespace-nowrap">
                      <time dateTime={invoice.createdAt}>
                        {formatOrdinalDate(invoice.createdAt)}
                      </time>
                    </TableCell>
                    <TableCell tone="muted">{formatUsdPrecise(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} shape="rounded" size="status">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <IconButton
                        icon="download"
                        variant="contrast"
                        size="xs"
                        aria-label={`Download ${invoice.number}`}
                        disabled={download.isPending && download.variables?.id === invoice.id}
                        onClick={() => onDownload(invoice)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableMessageRow colSpan={COLUMNS}>
                No invoices yet. Each credit purchase adds one here.
              </TableMessageRow>
            )}
          </TableBody>
        </Table>
      </TableCard>
    </section>
  );
}
