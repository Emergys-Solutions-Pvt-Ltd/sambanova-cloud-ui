import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

/**
 * The ring is two 4px shadows, one outside and one inside the 48px circle: Figma centres an 8px stroke on
 * the edge, so the outer size is 56px while the layout box stays 48px.
 */
const tones = {
  warning:
    "bg-featured-warning text-featured-warning ring-4 ring-(--sn-featured-warning-ring) inset-ring-4 inset-ring-(--sn-featured-warning-ring)",
  danger:
    "bg-featured-danger text-featured-danger ring-4 ring-(--sn-featured-danger-ring) inset-ring-4 inset-ring-(--sn-featured-danger-ring)",
} as const;

interface FeaturedIconProps {
  icon: IconName;
  /** "warning" is Figma's orange (Disable Key); "danger" is the red variant for deletions. */
  tone?: keyof typeof tones;
  className?: string;
}

/** Round tinted icon with a soft ring (Figma: Featured icon, 48px, 24px glyph with a 2px stroke) used at the top of confirmation dialogs. */
export function FeaturedIcon({ icon, tone = "warning", className }: FeaturedIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        tones[tone],
        className,
      )}
    >
      <Icon name={icon} size="lg" strokeWidth={2} />
    </span>
  );
}
