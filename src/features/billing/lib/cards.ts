import { CARD_BRAND_NAMES, formatCardExpiry } from "@/lib/card";
import { type AutoRechargeSettings, type PaymentMethod } from "@/types/domain";

/** "Visa ending in 2839" (Figma: My Cards list, Auto Recharge payment method). */
export const cardLabel = (card: PaymentMethod) =>
  `${CARD_BRAND_NAMES[card.brand]} ending in ${card.last4}`;

/** "09/28" */
export const cardExpiry = (card: PaymentMethod) => formatCardExpiry(card.expMonth, card.expYear);

/** The card Auto Recharge charges, while Auto Recharge is on. */
export function autopayCardId(settings: AutoRechargeSettings | undefined) {
  return settings?.enabled ? settings.paymentMethodId : null;
}

/**
 * Cards in display order: the Auto Recharge card first, then newest first (the list arrives
 * newest first). The first three make the stacked card art, front to back.
 */
export function orderCards(cards: PaymentMethod[], autopayId: string | null) {
  const autopay = cards.find((card) => card.id === autopayId);
  return autopay ? [autopay, ...cards.filter((card) => card !== autopay)] : cards;
}
