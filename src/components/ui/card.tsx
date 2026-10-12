import { createElement, type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

type CardRadius = "md" | "lg" | "xl";
type CardPadding = "none" | "md" | "lg";

const radii: Record<CardRadius, string> = { md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl" };
const paddings: Record<CardPadding, string> = { none: "", md: "p-4", lg: "p-5" };

export interface CardProps extends ComponentPropsWithRef<"div"> {
  /** Semantic element: `section` for titled regions, `article` for self-contained items. */
  as?: "div" | "section" | "article" | "li";
  radius?: CardRadius;
  padding?: CardPadding;
}

/** Bordered surface used for stat tiles, promo cards, partner and model cards. */
export function Card({ as = "div", radius = "lg", padding = "md", className, ...rest }: CardProps) {
  return createElement(as, {
    className: cn("border border-default bg-surface", radii[radius], paddings[padding], className),
    ...rest,
  });
}
