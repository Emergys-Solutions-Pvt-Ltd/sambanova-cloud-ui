"use client";

import Image from "next/image";
import { useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { billingArt, cardBrandLogos } from "@/config/assets";
import { cn } from "@/lib/cn";
import { type PaymentMethod } from "@/types/domain";

import { cardExpiry, cardLabel } from "../lib/cards";
import { CardStack } from "./card-stack";

export type CardAction = "turn-off" | "switch" | "use" | "remove";

/** One blurred purple streak (Figma: Group 1171276687 / 88), rotated around its own centre. */
function Glow({ side }: { side: "left" | "right" }) {
  const art = side === "right" ? billingArt.glowRight : billingArt.glowLeft;
  return (
    <div
      className={cn(
        "absolute flex h-[351.498px] w-[291.829px] items-center justify-center",
        // Offsets from the panel centre (Figma: 105.9 / -29.68 from the left of a 363px panel).
        side === "right"
          ? "top-[-68.38px] left-[calc(50%-75.6px)]"
          : "top-[-106.99px] left-[calc(50%-211.18px)]",
      )}
    >
      <div
        className={cn(
          "relative h-[308.587px] w-[229.647px] flex-none",
          side === "right" ? "rotate-[12.69deg]" : "-scale-y-100 rotate-[167.31deg]",
        )}
      >
        <Image
          src={art.src}
          alt=""
          width={art.width}
          height={art.height}
          unoptimized
          className="absolute top-[-76.5px] left-[-48.78px] max-w-none"
        />
      </div>
    </div>
  );
}

interface CardRowProps {
  card: PaymentMethod;
  autopay: boolean;
  autoRechargeOn: boolean;
  onAction: (card: PaymentMethod, action: CardAction) => void;
}

function CardRow({ card, autopay, autoRechargeOn, onAction }: CardRowProps) {
  const logo = cardBrandLogos[card.brand];
  // Run the action after the menu has closed and returned focus, so a dialog can take it.
  const pending = useRef<CardAction | null>(null);
  const primary: { action: CardAction; label: string } = autopay
    ? { action: "turn-off", label: "Turn off Auto Recharge" }
    : autoRechargeOn
      ? { action: "switch", label: "Switch Auto Recharge" }
      : { action: "use", label: "Use for Auto Recharge" };

  return (
    <li className="flex h-12 items-center gap-3 rounded-md bg-card-row p-2.5">
      <span className="flex h-6.75 w-9 shrink-0 items-center">
        <Image
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          unoptimized
          className="rounded-xs"
        />
      </span>
      <div className="flex h-9.75 min-w-0 flex-1 flex-col justify-between">
        <p className="truncate text-body-sm leading-[1.5] text-emphasis">{cardLabel(card)}</p>
        <p className="text-caption leading-[1.5] font-normal text-muted">
          <span className="sr-only">Expires </span>
          {cardExpiry(card)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {autopay && (
          <span className="rounded-full bg-autopay px-2 py-0.5 text-tiny font-medium text-autopay backdrop-blur-[5.8px]">
            Autopay
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              icon="dots-vertical"
              variant="contrast"
              size="code"
              aria-label={`Actions for ${cardLabel(card)}`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            surface="flat"
            align="end"
            sideOffset={4}
            className="w-47.75"
            onCloseAutoFocus={(event) => {
              const action = pending.current;
              pending.current = null;
              if (!action) return;
              // "Turn off" has no dialog; the others restore focus to ⋮ when they close.
              if (action === "turn-off") event.preventDefault();
              onAction(card, action);
            }}
          >
            <DropdownMenuItem variant="flat" onSelect={() => (pending.current = primary.action)}>
              {primary.label}
            </DropdownMenuItem>
            <DropdownMenuSeparator tone="soft" />
            <DropdownMenuItem
              variant="flat"
              destructive
              onSelect={() => (pending.current = "remove")}
            >
              Remove card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

interface MyCardsPanelProps {
  /** Saved cards in display order (Auto Recharge card first); `undefined` while loading. */
  cards: PaymentMethod[] | undefined;
  /** The cards couldn't be loaded; shows a retry instead of the list. */
  onRetry?: () => void;
  autopayId: string | null;
  autoRechargeOn: boolean;
  onAddCard: () => void;
  onAction: (card: PaymentMethod, action: CardAction) => void;
  className?: string;
}

/**
 * My Cards (Figma `1882:65298`): stacked card art over a purple gradient and the saved-card list.
 * It is card art, so it stays dark in the light theme.
 */
export function MyCardsPanel({
  cards,
  onRetry,
  autopayId,
  autoRechargeOn,
  onAddCard,
  onAction,
  className,
}: MyCardsPanelProps) {
  return (
    <section
      data-theme="dark"
      aria-labelledby="my-cards-title"
      className={cn(
        "relative isolate min-h-156.75 overflow-clip rounded-lg bg-cards-panel pb-5 text-primary",
        className,
      )}
    >
      <div className="relative h-81.75">
        <CardStack cards={cards ?? []} />
        <div aria-hidden="true" className="pointer-events-none">
          <Glow side="right" />
          <Glow side="left" />
        </div>
        <div className="absolute top-[19.45px] right-4.25 left-[19.14px] flex items-center justify-between">
          <h2 id="my-cards-title" className="text-heading-sm leading-[1.2] font-bold text-emphasis">
            My Cards
          </h2>
          <button
            type="button"
            onClick={onAddCard}
            aria-label="Add a card"
            className="flex size-7.5 items-center justify-center rounded-full bg-cards-add text-primary transition-opacity duration-(--sn-duration-fast) ease-standard hover:opacity-80"
          >
            <Icon name="plus" size={21.43} strokeWidth={1} />
          </button>
        </div>
      </div>

      <div className="relative px-4.25">
        {onRetry ? (
          <p role="alert" className="px-2 text-center text-body-sm text-muted">
            Couldn’t load your cards.{" "}
            <button
              type="button"
              onClick={onRetry}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </p>
        ) : cards === undefined ? (
          <div aria-busy="true" aria-label="Loading cards" className="flex flex-col gap-3.75">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 rounded-md" />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <ul aria-label="Saved cards" className="flex flex-col gap-3.75">
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                autopay={card.id === autopayId}
                autoRechargeOn={autoRechargeOn}
                onAction={onAction}
              />
            ))}
          </ul>
        ) : (
          <p className="px-2 text-center text-body-sm text-muted">
            No saved cards yet. Add one to use it for Auto Recharge.
          </p>
        )}
      </div>
    </section>
  );
}
