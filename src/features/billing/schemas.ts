import { z } from "zod";

import { checkExpiry, isValidCardNumber, isValidSecurityCode } from "@/lib/card";
import { formatUsd } from "@/lib/format";

export const MIN_CREDIT_AMOUNT = 5;
export const MAX_CREDIT_AMOUNT = 1000;
export const CREDIT_PRESETS = [5, 20, 100] as const;

const range = `${formatUsd(MIN_CREDIT_AMOUNT)} and ${formatUsd(MAX_CREDIT_AMOUNT)}`;

/** Add Credits form. Card messages follow the Figma copy ("Your Card number is invalid"). */
export const addCreditsSchema = z.object({
  amount: z
    .number()
    .nullable()
    .superRefine((value, context) => {
      if (value === null) {
        context.addIssue({ code: "custom", message: "Choose or enter an amount." });
      } else if (
        !Number.isInteger(value) ||
        value < MIN_CREDIT_AMOUNT ||
        value > MAX_CREDIT_AMOUNT
      ) {
        context.addIssue({ code: "custom", message: `Enter an amount between ${range}.` });
      }
    }),
  fullName: z.string().trim().min(2, "Enter your full name."),
  country: z.string().min(1, "Select your country or region."),
  address: z.string().trim().min(5, "Enter your address."),
  cardNumber: z.string().refine(isValidCardNumber, "Your Card number is invalid"),
  expiry: z.string().superRefine((value, context) => {
    const result = checkExpiry(value);
    if (result === "invalid") {
      context.addIssue({ code: "custom", message: "Your card's expiry date is invalid" });
    } else if (result === "expired") {
      context.addIssue({ code: "custom", message: "Your card's expiry date is in the past" });
    }
  }),
  cvc: z.string().refine(isValidSecurityCode, "Your card's security code is incomplete"),
});

export type AddCreditsValues = z.infer<typeof addCreditsSchema>;
