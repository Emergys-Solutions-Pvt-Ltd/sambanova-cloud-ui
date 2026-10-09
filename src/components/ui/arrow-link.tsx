import Link from "next/link";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

export interface ArrowLinkProps extends ComponentPropsWithRef<typeof Link> {
  /** "md" = 16px (promo cards), "sm" = 13px (partner and model cards). */
  size?: "md" | "sm";
}

/** Text link with a trailing arrow ("Register Now →", "Explore SCX →"). */
export function ArrowLink({ size = "md", className, children, ...rest }: ArrowLinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-1 rounded-xs font-medium text-link hover:text-link-hover",
        size === "md" ? "text-body-lg" : "text-body-sm",
        className,
      )}
      {...rest}
    >
      {children}
      <Icon
        name="arrow-right"
        size="md"
        className="transition-transform duration-(--sn-duration-base) ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}
