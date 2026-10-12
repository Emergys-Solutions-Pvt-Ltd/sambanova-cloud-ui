import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

const tones = {
  warning: "border-featured-warning bg-featured-warning text-featured-warning",
  danger: "border-featured-danger bg-featured-danger text-featured-danger",
} as const;

interface FeaturedIconProps {
  icon: IconName;
  /** "warning" is Figma's orange (Disable Key); "danger" is the red variant for deletions. */
  tone?: keyof typeof tones;
  className?: string;
}

/** Round tinted icon with a soft ring (Figma: Featured icon, 48px) used at the top of confirmation dialogs. */
export function FeaturedIcon({ icon, tone = "warning", className }: FeaturedIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full border-8",
        tones[tone],
        className,
      )}
    >
      <Icon name={icon} size="lg" />
    </span>
  );
}
