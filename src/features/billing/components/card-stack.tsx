import Image from "next/image";

import { billingArt, cardBrandLogos } from "@/config/assets";
import { cn } from "@/lib/cn";
import { type PaymentMethod } from "@/types/domain";

import { cardExpiry } from "../lib/cards";

/** Brand mark printed on the card: white VISA wordmark, Mastercard circles, or the logo tile. */
function CardMark({ card }: { card: PaymentMethod }) {
  if (card.brand === "visa") {
    const mark = billingArt.cardVisa;
    return <Image src={mark.src} alt="" width={mark.width} height={mark.height} unoptimized />;
  }
  if (card.brand === "mastercard") {
    const mark = billingArt.cardMastercard;
    return <Image src={mark.src} alt="" width={mark.width} height={mark.height} unoptimized />;
  }
  // Figma only draws Visa and Mastercard on the card; the others use their list logo.
  const logo = cardBrandLogos[card.brand];
  const height = 17;
  return (
    <Image
      src={logo.src}
      alt=""
      width={(logo.width * height) / logo.height}
      height={height}
      unoptimized
      className="rounded-xs"
    />
  );
}

/**
 * One 265 × 150 card (Figma: front card of "Group 1171276689"). The cards behind are the same art
 * scaled down, which is exactly how Figma sizes their wordmark, chip and number row.
 */
function CardFace({ card }: { card: PaymentMethod | null }) {
  const { card: body, cardChip: chip } = billingArt;
  return (
    <div className="relative h-[149.898px] w-[265px]">
      <Image
        src={body.src}
        alt=""
        width={body.width}
        height={body.height}
        unoptimized
        className="absolute top-0 left-0 max-w-none"
      />
      {card && (
        <div className="absolute top-3 left-4 flex">
          <CardMark card={card} />
        </div>
      )}
      <Image
        src={chip.src}
        alt=""
        width={chip.width}
        height={chip.height}
        unoptimized
        className="absolute top-[62.84px] left-[13.5px]"
      />
      <div className="absolute top-[119.77px] left-1/2 flex w-[234.555px] -translate-x-1/2 items-center justify-between whitespace-nowrap">
        {/* Figma's number text starts with a space; 4px keeps that inset. */}
        <span className="pl-1 text-body text-muted">
          **** **** **** {card ? card.last4 : "****"}
        </span>
        {card && <span className="text-card-art text-secondary">{cardExpiry(card)}</span>}
      </div>
    </div>
  );
}

/** Front to back: top offset, scale and blur of each layer (Figma: 265 / 238.2 / 201.8 wide). */
const layers = [
  { top: "top-[136.82px]", scale: "", effect: "" },
  { top: "top-[100.03px]", scale: "scale-[0.8988]", effect: "blur-[0.5px]" },
  { top: "top-[70.82px]", scale: "scale-[0.7617]", effect: "blur-[0.5px] backdrop-blur-[12.1px]" },
] as const;

/**
 * Up to three saved cards stacked as card art, the first in front (Figma: My Cards). With no
 * cards a single blank card is shown.
 */
export function CardStack({ cards }: { cards: PaymentMethod[] }) {
  const shown: (PaymentMethod | null)[] = cards.length > 0 ? cards.slice(0, 3) : [null];
  return (
    <div aria-hidden="true">
      {shown
        .map((card, index) => ({ card, layer: layers[index]! }))
        .reverse()
        .map(({ card, layer }, index) => (
          <div
            key={card?.id ?? index}
            className={cn(
              "absolute left-1/2 origin-top -translate-x-1/2",
              layer.top,
              layer.scale,
              layer.effect,
              !card && "opacity-40",
            )}
          >
            <CardFace card={card} />
          </div>
        ))}
    </div>
  );
}
