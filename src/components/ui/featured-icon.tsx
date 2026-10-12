import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

interface FeaturedIconProps {
  icon: IconName;
  className?: string;
}

/** Round tinted icon with a soft ring (Figma: Featured icon, 48px) used at the top of confirmation dialogs. */
export function FeaturedIcon({ icon, className }: FeaturedIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full border-8 border-featured-warning bg-featured-warning text-featured-warning",
        className,
      )}
    >
      <Icon name={icon} size="lg" />
    </span>
  );
}
