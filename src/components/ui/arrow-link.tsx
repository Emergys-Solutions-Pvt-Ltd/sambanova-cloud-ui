import Link from "next/link";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";
import { MarqueeArrow } from "./marquee-arrow";

export interface ArrowLinkProps extends ComponentPropsWithRef<typeof Link> {
  /** "md" = 16px (promo cards), "sm" = 13px (partner and model cards). */
  size?: "md" | "sm";
  /**
   * "nudge" shifts the arrow 2px on hover of the link. "marquee" (Figma: partner cards) slides
   * arrows through the 20px box, driven by hover on the nearest `group/card` ancestor.
   */
  arrow?: "nudge" | "marquee";
  /** Arrow glyph. Default "arrow-right"; the webinar card's "Register Now" uses the wide-head one. */
  icon?: IconName;
  /** Overrides the glyph's stroke width (Figma draws "Register Now" at 1.3). */
  iconStrokeWidth?: number;
}

/** Text link with a trailing arrow ("Register Now →", "Explore SCX →"). */
export function ArrowLink({
  size = "md",
  arrow = "nudge",
  icon = "arrow-right",
  iconStrokeWidth,
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
        <MarqueeArrow trigger="card" icon={icon} />
      ) : (
        <Icon
          name={icon}
          size="md"
          {...(iconStrokeWidth === undefined ? {} : { strokeWidth: iconStrokeWidth })}
          className="transition-transform duration-(--sn-duration-base) ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </Link>
  );
}
