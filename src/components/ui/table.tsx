import { type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Skeleton } from "./skeleton";

interface TableCardProps {
  children: ReactNode;
  /** Bar under the table, e.g. "Showing 1-10 of 1000" and the pagination. */
  footer?: ReactNode;
  /** Corner radius: r12 by default, r8 for the Project Settings › Limits table. */
  radius?: "md" | "lg";
  className?: string;
}

/** Bordered card around a table with an optional footer; scrolls sideways on narrow screens. */
export function TableCard({ children, footer, radius = "lg", className }: TableCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-default",
        radius === "lg" ? "rounded-lg" : "rounded-md",
        className,
      )}
    >
      <div className="scrollbar-thin overflow-x-auto">{children}</div>
      {footer && <div className="border-t border-default">{footer}</div>}
    </div>
  );
}

const minWidths = {
  /** 600px: few short columns (Billing › Invoices). */
  sm: "min-w-150",
  /** 760px: the default. */
  md: "min-w-190",
  /** 960px: tables with long values such as emails (Members, Invitations) and the Usage and Pricing tables. */
  lg: "min-w-240",
  /** 1144px: the request log, whose columns have Figma's fixed widths. */
  xl: "min-w-286",
} as const;

interface TableProps extends ComponentPropsWithRef<"table"> {
  /** Screen-reader name of the table. */
  caption: string;
  /** Width below which the card scrolls sideways instead of squeezing the columns. */
  minWidth?: keyof typeof minWidths;
}

/** Semantic table with Figma's header band and row dividers (last row has none). */
export function Table({ caption, minWidth = "md", className, children, ...rest }: TableProps) {
  return (
    <table
      className={cn("w-full border-collapse text-body", minWidths[minWidth], className)}
      {...rest}
    >
      <caption className="sr-only">{caption}</caption>
      {children}
    </table>
  );
}

export function TableHead({ className, ...rest }: ComponentPropsWithRef<"thead">) {
  return <thead className={cn("bg-table-head", className)} {...rest} />;
}

export function TableBody({ className, ...rest }: ComponentPropsWithRef<"tbody">) {
  return <tbody className={cn("[&>tr:last-child>td]:border-b-0", className)} {...rest} />;
}

export function TableRow(props: ComponentPropsWithRef<"tr">) {
  return <tr {...props} />;
}

/** One class per alignment: `cn()` does not resolve a base `text-left` against a passed `text-center`. */
const headerAlignments = { left: "text-left", center: "text-center", right: "text-right" } as const;

/**
 * Text colours of the Figma table looks, one class each (for the same reason as the alignments).
 * Headings: "default" is gray-200 (API Keys, request log, Usage, Project Settings), "bright" is
 * white (Pricing). Cells: "secondary" is gray-300 (the default), "muted" is gray-400 (Billing ›
 * Invoices, and the message of an empty table), "bright" is near-white (Pricing).
 */
export type TableHeaderTone = "default" | "bright";
export type TableCellTone = "secondary" | "muted" | "bright";
const headerTones: Record<TableHeaderTone, string> = {
  default: "text-table-header",
  bright: "text-primary",
};
const cellTones: Record<TableCellTone, string> = {
  secondary: "text-secondary",
  muted: "text-muted",
  bright: "text-primary",
};

interface TableHeaderCellProps extends ComponentPropsWithRef<"th"> {
  /** Text alignment of the heading (Figma centres "Actions" and right-aligns token counts). Default left. */
  align?: keyof typeof headerAlignments;
  tone?: TableHeaderTone;
}

export function TableHeaderCell({
  align = "left",
  tone = "default",
  className,
  ...rest
}: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        "h-12.5 px-4 py-0 text-body font-semibold whitespace-nowrap",
        headerTones[tone],
        headerAlignments[align],
        className,
      )}
      {...rest}
    />
  );
}

interface TableCellProps extends ComponentPropsWithRef<"td"> {
  tone?: TableCellTone;
}

export function TableCell({ tone = "secondary", className, ...rest }: TableCellProps) {
  return (
    <td
      className={cn(
        "h-13.5 border-b border-default px-4 py-0 text-body",
        cellTones[tone],
        className,
      )}
      {...rest}
    />
  );
}

/** Full-width row for empty and no-results messages. */
export function TableMessageRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-27 px-4 text-center text-body text-muted">
        {children}
      </td>
    </tr>
  );
}

/** Placeholder rows while the first page loads. */
export function TableSkeletonRows({ rows = 5, columns }: { rows?: number; columns: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden="true">
      {Array.from({ length: columns }, (_, column) => (
        <TableCell key={column}>
          <Skeleton className="h-4 w-3/5" />
        </TableCell>
      ))}
    </tr>
  ));
}
