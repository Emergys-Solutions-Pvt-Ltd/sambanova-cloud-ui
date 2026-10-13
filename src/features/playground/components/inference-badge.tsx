import Image from "next/image";

import { Icon } from "@/components/ui/icon/icon";
import { playgroundArt } from "@/config/assets";
import { cn } from "@/lib/cn";

/**
 * "Blazing-fast Inference" pill next to the Playground title (Figma: Badge `1401:148617`,
 * light `1520:47577`): gradient fill, themed border, a blurred purple glow clipped at the
 * left edge, filled bolt and caption label.
 */
export function InferenceBadge({ className }: { className?: string }) {
  const glow = playgroundArt.badgeGlow;

  return (
    <span
      className={cn(
        "relative inline-flex h-6 shrink-0 items-center gap-1 overflow-hidden rounded-full border border-inference-badge bg-inference-badge px-2.5 py-0.5",
        className,
      )}
    >
      {/* Ellipse 187: box from Figma, image overflows it by the blur margin baked into the SVG. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-14.57%_93.43%_-14.57%_-7.48%]"
      >
        <span className="absolute inset-[-21.29%_-30.31%]">
          <Image src={glow.src} alt="" fill unoptimized />
        </span>
      </span>
      <Icon name="bolt" size={16} fill="currentColor" className="relative text-inference-badge" />
      <span className="relative text-caption whitespace-nowrap text-inference-badge">
        Blazing-fast Inference
      </span>
    </span>
  );
}
