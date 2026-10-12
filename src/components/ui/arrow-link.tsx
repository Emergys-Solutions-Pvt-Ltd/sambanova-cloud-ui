import Link from "next/link";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

export interface ArrowLinkProps extends ComponentPropsWithRef<typeof Link> {
  /** "md" = 16px (promo cards), "sm" = 13px (partner and model cards). */
  size?: "md" | "sm";
  /**
   * "nudge" shifts the arrow 2px on hover of the link. "marquee" (Figma: partner cards) slides
   * arrows through the 20px box, driven by hover on the nearest `group/card` ancestor.
   */
  arrow?: "nudge" | "marquee";
}

/** Three arrows spaced 23.5px apart in a clipped 20px box; hover moves them one step so the last one lands in place. */
function MarqueeArrow() {
  return (
    <span aria-hidden="true" className="relative block size-5 shrink-0 overflow-hidden">
      <span className="absolute inset-0 transition-transform duration-(--sn-duration-marquee) ease-standard group-hover/card:translate-x-11.75 motion-reduce:transition-none">
        {[0, 1, 2].map((step) => (
          <Icon
            key={step}
            name="arrow-right"
            size="md"
            className="absolute top-0"
            style={{ left: `calc(var(--spacing) * ${-5.875 * step})` }}
          />
        ))}
      </span>
    </span>
  );
}

/** Text link with a trailing arrow ("Register Now →", "Explore SCX →"). */
export function ArrowLink({
  size = "md",
  arrow = "nudge",
  className,
  children,
  ...rest
}: ArrowLinkProps) {
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
      {arrow === "marquee" ? (
        <MarqueeArrow />
      ) : (
        <Icon
          name="arrow-right"
          size="md"
          className="transition-transform duration-(--sn-duration-base) ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </Link>
  );
}
