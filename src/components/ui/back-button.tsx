import Link from "next/link";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

interface BackButtonProps {
  href: string;
  /** Where it goes, announced to screen readers: "Back to API keys". */
  label: string;
  className?: string;
}

/** Round white arrow beside a page title that returns to the parent screen (Figma: View API Key Usage). */
export function BackButton({ href, label, className }: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-button-primary text-button-primary-fg",
        "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-button-primary-hover",
        className,
      )}
    >
      {/* Figma draws this chevron 24px wide with a 1.5px line, i.e. 1.25 in the 20px icon grid. */}
      <Icon name="chevron-left" size="lg" strokeWidth={1.25} />
    </Link>
  );
}
