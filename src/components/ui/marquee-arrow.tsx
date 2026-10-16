import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

/** Hover is read from the nearest named group ancestor (`group/card` on partner cards, `group/button` on Button). */
const hoverSlide = {
  card: "group-hover/card:translate-x-11.75",
  button: "group-hover/button:translate-x-11.75",
} as const;

export interface MarqueeArrowProps {
  /** Which named group ancestor drives the hover. */
  trigger: keyof typeof hoverSlide;
  icon?: IconName;
  className?: string;
}

/**
 * Figma slow smart-animate (partner cards, hero buttons): three arrows spaced 23.5px apart in a
 * clipped 20px box; hover slides them one step (47px) so the last one lands where the first was,
 * and they slide back when the pointer leaves.
 */
export function MarqueeArrow({ trigger, icon = "arrow-right", className }: MarqueeArrowProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block size-5 shrink-0 overflow-hidden", className)}
    >
      <span
        className={cn(
          "absolute inset-0 transition-transform duration-(--sn-duration-marquee) ease-standard motion-reduce:transition-none",
          hoverSlide[trigger],
        )}
      >
        {[0, 1, 2].map((step) => (
          <Icon
            key={step}
            name={icon}
            size="md"
            className="absolute top-0"
            style={{ left: `calc(var(--spacing) * ${-5.875 * step})` }}
          />
        ))}
      </span>
    </span>
  );
}
