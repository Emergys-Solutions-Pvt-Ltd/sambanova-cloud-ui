import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

interface CalloutProps {
  icon: IconName;
  title: string;
  description: string;
  /** Trailing control, e.g. a "View Documentation" button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Tinted help banner (Figma: "Need help in getting started?"): round icon, text and one action.
 * Figma draws the 1px border inside its 24px padding, so the padding here is 23px (the card is 90px high).
 */
export function Callout({ icon, title, description, action, className }: CalloutProps) {
  return (
    <aside
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-lg border border-callout bg-callout p-5.75",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-80 items-start gap-5">
        <span
          aria-hidden="true"
          className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-callout-icon text-callout-icon"
        >
          <Icon name={icon} size="lg" />
        </span>
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <h2 className="text-heading-xs leading-[1.2]">{title}</h2>
          <p className="text-body-sm leading-[1.2] text-muted">{description}</p>
        </div>
      </div>
      {action}
    </aside>
  );
}
