import Image from "next/image";

import { ArrowLink } from "@/components/ui/arrow-link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon/icon";
import { externalLinks } from "@/config/links";

/** Fades in with the card's hover (and keyboard focus inside it): Figma "smart animate, quick". */
const reveal =
  "opacity-0 transition-opacity duration-(--sn-duration-quick) ease-standard " +
  "group-hover/promo:opacity-100 group-focus-within/promo:opacity-100 motion-reduce:transition-none";

/**
 * "Earn Free Credits" promo card (Figma: Component 110, 392 x 239). On hover the outline turns
 * into the purple / amber stroke gradient and a dotted wave fades in at the top right; both
 * layers sit outside the content so the text never moves.
 */
export function FreeCreditsCard() {
  return (
    <Card
      as="section"
      aria-labelledby="free-credits-title"
      padding="none"
      className={
        "group/promo relative flex min-h-59.75 flex-col justify-between bg-promo p-4.75 shadow-card-glow " +
        "transition-colors duration-(--sn-duration-quick) ease-standard hover:border-transparent " +
        "focus-within:border-transparent motion-reduce:transition-none"
      }
    >
      {/* The wave is cut off by the card edge; its box (with the blur-free export margin) is rotated -85.79deg. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-clip rounded-[inherit]"
      >
        <span
          className={`absolute top-[-16.22px] right-[-44px] flex h-[193.236px] w-[230.516px] items-center justify-center ${reveal}`}
        >
          <span className="relative block h-[218.053px] w-[177.699px] flex-none -rotate-[85.79deg]">
            <Image src="/illustrations/free-credits-union.svg" alt="" fill unoptimized />
          </span>
        </span>
      </span>

      <div className="relative flex flex-col gap-6">
        <span
          aria-hidden="true"
          className="relative flex size-11.5 items-center justify-center rounded-full bg-chip text-primary"
        >
          <Icon name="rocket-solid" size={21} />
          {/* Figma glass effect: a 1.5px rim light that is strongest at the bottom left. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-glass-rim p-[1.5px] ring-mask"
          />
        </span>
        <div className="flex flex-col gap-2.75">
          <h2 id="free-credits-title" className="text-heading-md leading-6 text-secondary">
            Earn Free Credits
          </h2>
          <p className="max-w-83 text-body font-medium text-muted">
            Contribute to the community and unlock free credits to power your AI journey.
          </p>
        </div>
      </div>

      {/* 19px row like Figma; the 24px link overhangs it by 2.5px on each side. */}
      <div className="relative flex h-4.75 items-center">
        <ArrowLink
          href={externalLinks.community}
          target="_blank"
          rel="noopener noreferrer"
          icon="arrow-right-wide"
          iconStrokeWidth={1.3}
        >
          Visit Community
        </ArrowLink>
      </div>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-px rounded-[inherit] bg-promo-border p-px ring-mask ${reveal}`}
      />
    </Card>
  );
}
