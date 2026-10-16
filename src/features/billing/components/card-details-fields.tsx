"use client";

import Image from "next/image";
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form";

import { Icon } from "@/components/ui/icon/icon";
import { TextField } from "@/components/ui/input";
import { billingArt, cardBrandLogos } from "@/config/assets";
import {
  CARD_BRAND_NAMES,
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
} from "@/lib/card";

import { type CardDetailsValues } from "../schemas";

/** Accepted brands while the field is empty, the detected brand once typed, a crossed card on error. */
function CardNumberTrailing({ value, invalid }: { value: string; invalid: boolean }) {
  if (invalid) return <Icon name="credit-card-off" size={18} className="shrink-0 text-error" />;

  const brand = detectCardBrand(value);
  if (brand) {
    const logo = cardBrandLogos[brand];
    return (
      <Image
        src={logo.src}
        alt={CARD_BRAND_NAMES[brand]}
        width={28}
        height={19}
        unoptimized
        className="h-4.75 w-7 shrink-0 object-contain"
      />
    );
  }

  const { acceptedCards } = billingArt;
  return (
    <Image
      src={acceptedCards.src}
      alt="Visa, Mastercard, American Express and Discover accepted"
      width={acceptedCards.width}
      height={acceptedCards.height}
      unoptimized
      className="shrink-0"
    />
  );
}

/**
 * Card Number, Expiry date and Security code (Figma: "Credit Card Details" in Add Credits and Add
 * Payment Details). Works in any form whose values include the three card fields.
 */
export function CardDetailsFields<Values extends FieldValues & CardDetailsValues>({
  control,
}: {
  control: Control<Values>;
}) {
  const name = (field: keyof CardDetailsValues) => field as FieldPath<Values>;

  return (
    <div className="flex flex-col gap-2">
      <Controller
        control={control}
        name={name("cardNumber")}
        render={({ field, fieldState }) => (
          <TextField
            label="Card Number"
            fieldSize="sm"
            bordered="input"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
            error={fieldState.error?.message}
            trailing={
              <CardNumberTrailing
                value={field.value as string}
                invalid={Boolean(fieldState.error)}
              />
            }
            value={field.value as string}
            onChange={(event) => field.onChange(formatCardNumber(event.target.value))}
            onBlur={field.onBlur}
            ref={field.ref}
            name={field.name}
          />
        )}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Controller
          control={control}
          name={name("expiry")}
          render={({ field, fieldState }) => (
            <TextField
              label="Expiry date"
              fieldSize="sm"
              bordered="input"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              error={fieldState.error?.message}
              value={field.value as string}
              onChange={(event) => field.onChange(formatExpiry(event.target.value))}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
            />
          )}
        />
        <Controller
          control={control}
          name={name("cvc")}
          render={({ field, fieldState }) => (
            <TextField
              label="Security code"
              fieldSize="sm"
              bordered="input"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="CVC"
              maxLength={4}
              error={fieldState.error?.message}
              trailing={<Icon name="credit-card" size={18} className="shrink-0 text-secondary" />}
              value={field.value as string}
              onChange={(event) => field.onChange(digitsOnly(event.target.value))}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
            />
          )}
        />
      </div>
    </div>
  );
}
