import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** id for the heading, so the parent <section> can use aria-labelledby. */
  id: string;
  title: string;
  description?: ReactNode;
  /** Right-aligned control, e.g. "Compare Models". */
  action?: ReactNode;
  className?: string;
}

/** Titled block heading inside a page ("Recommended Models" + subtitle + optional action). */
export function SectionHeader({ id, title, description, action, className }: SectionHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id={id} className="text-heading-sm font-bold">
          {title}
        </h2>
        {description && <p className="text-body text-secondary">{description}</p>}
      </div>
      {action}
    </header>
  );
}
