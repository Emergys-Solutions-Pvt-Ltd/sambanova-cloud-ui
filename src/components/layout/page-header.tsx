import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Control before the title, e.g. the round back button of a detail screen. */
  leading?: ReactNode;
  /** Right-aligned controls, e.g. "Refresh" and "Create API Key". Wraps below on narrow screens. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page title bar from Figma (e.g. "API Keys" with its subtitle and actions).
 * Renders the page's single <h1>. From `sm` up the bar is 85px tall, set by the 37px action
 * row (24px padding above, 23px below plus the 1px bottom border, like Figma's inside stroke);
 * the two-line title block is centred on it and overhangs by a few pixels, as in Figma.
 */
export function PageHeader({ title, subtitle, leading, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn("border-b border-header px-4 py-4 sm:px-6 sm:pt-6 sm:pb-5.75", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:h-9.25 sm:flex-nowrap">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-heading-lg leading-tight">{title}</h1>
            {subtitle && <p className="text-caption leading-snug text-secondary">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

/** Standard padding for the area under <PageHeader />. */
export function PageContent({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  return <div className={cn("px-4 py-6 sm:px-6", className)} {...rest} />;
}
