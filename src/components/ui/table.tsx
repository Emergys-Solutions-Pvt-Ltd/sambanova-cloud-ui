import { type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface TableCardProps {
  children: ReactNode;
  /** Bar under the table, e.g. "Showing 1-10 of 1000" and the pagination. */
  footer?: ReactNode;
  className?: string;
}

/** Bordered card around a table (r12) with an optional footer; scrolls sideways on narrow screens. */
export function TableCard({ children, footer, className }: TableCardProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-default", className)}>
      <div className="scrollbar-thin overflow-x-auto">{children}</div>
      {footer && <div className="border-t border-default">{footer}</div>}
    </div>
  );
}

interface TableProps extends ComponentPropsWithRef<"table"> {
  /** Screen-reader name of the table. */
  caption: string;
}

/** Semantic table with Figma's header band and row dividers (last row has none). */
export function Table({ caption, className, children, ...rest }: TableProps) {
  return (
    <table className={cn("w-full min-w-190 border-collapse text-body", className)} {...rest}>
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
 * Text colours of the two Figma table looks. "default" is API Keys, request log and Usage (gray
 * heading, softer body); "bright" is Pricing (white heading, near-white body). One class each, for
 * the same reason as the alignments.
 */
export type TableHeaderTone = "default" | "bright";
/** Cells also have "muted", for the message of an empty table. */
export type TableCellTone = TableHeaderTone | "muted";
const headerTones: Record<TableHeaderTone, string> = {
  default: "text-table-header",
  bright: "text-primary",
};
const cellTones: Record<TableCellTone, string> = {
  default: "text-secondary",
  bright: "text-primary",
  muted: "text-muted",
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

export function TableCell({ tone = "default", className, ...rest }: TableCellProps) {
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
