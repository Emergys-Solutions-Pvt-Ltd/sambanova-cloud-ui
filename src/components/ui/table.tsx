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
  /** 960px: tables with long values such as emails (Members, Invitations). */
  lg: "min-w-240",
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

export function TableHeaderCell({ className, ...rest }: ComponentPropsWithRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "h-12.5 px-4 py-0 text-left text-body font-semibold whitespace-nowrap text-table-header",
        className,
      )}
      {...rest}
    />
  );
}

/** secondary = gray-300 cell text (default); muted = gray-400 (Figma: Billing › Invoices). */
export function TableCell({
  className,
  tone = "secondary",
  ...rest
}: ComponentPropsWithRef<"td"> & { tone?: "secondary" | "muted" }) {
  return (
    <td
      className={cn(
        "h-13.5 border-b border-default px-4 py-0 text-body",
        tone === "secondary" ? "text-secondary" : "text-muted",
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
