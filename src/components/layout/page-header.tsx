import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * One complete class set per variant (the font size and its line height must not be passed
 * separately). "default" is the 13px Regular subtitle on a 16px line that most Figma pages use
 * (Pricing, Projects, Project Settings); "compact" is the 12px one on a 14px line of API Keys.
 */
const subtitleVariants = {
  default: "text-body-sm leading-4 font-normal text-content",
  compact: "text-caption leading-3.5 font-normal text-content",
} as const;

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** "default" is the 13px subtitle most pages use in Figma; "compact" is the 12px one of API Keys. */
  subtitleVariant?: keyof typeof subtitleVariants;
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
 * the two-line title block is centred on it and overhangs by a few pixels, as in Figma. Its lines
 * are Figma's: the 22px title on a 26px line, an 8px gap, then the subtitle (16px line, or 14px
 * for "compact"), so the block is 50px or 48px high and the title sits at y=17.5 or 18.5.
 */
export function PageHeader({
  title,
  subtitle,
  subtitleVariant = "default",
  leading,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn("border-b border-header px-4 py-4 sm:px-6 sm:pt-6 sm:pb-5.75", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:h-9.25 sm:flex-nowrap">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-heading-lg leading-6.5">{title}</h1>
            {subtitle && <p className={subtitleVariants[subtitleVariant]}>{subtitle}</p>}
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
