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

export function TableCell({ className, ...rest }: ComponentPropsWithRef<"td">) {
  return (
    <td
      className={cn("h-13.5 border-b border-default px-4 py-0 text-body text-secondary", className)}
      {...rest}
    />
  );
}
