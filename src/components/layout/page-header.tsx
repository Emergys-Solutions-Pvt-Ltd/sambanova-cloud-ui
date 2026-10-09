import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Right-aligned controls, e.g. "Refresh" and "Create API Key". Wraps below on narrow screens. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page title bar from Figma (e.g. "API Keys" with its subtitle and actions).
 * Renders the page's single <h1>.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-default px-4 py-4.5 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-heading-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-body-sm leading-snug text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

/** Standard padding for the area under <PageHeader />. */
export function PageContent({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  return <div className={cn("px-4 py-6 sm:px-6", className)} {...rest} />;
}
