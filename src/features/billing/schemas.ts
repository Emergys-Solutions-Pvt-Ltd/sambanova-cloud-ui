import { z } from "zod";

import { checkExpiry, detectCardBrand, isValidCardNumber, isValidSecurityCode } from "@/lib/card";
import { formatUsd } from "@/lib/format";

export const MIN_CREDIT_AMOUNT = 5;
export const MAX_CREDIT_AMOUNT = 1000;
export const CREDIT_PRESETS = [5, 20, 100] as const;

/** Auto Recharge "Recharge when balance falls below" limits (whole dollars). */
export const MIN_RECHARGE_THRESHOLD = 1;
export const MAX_RECHARGE_THRESHOLD = 1000;

const range = `${formatUsd(MIN_CREDIT_AMOUNT)} and ${formatUsd(MAX_CREDIT_AMOUNT)}`;

/** Card fields shared by Add Credits and Add Payment Details. Messages follow the Figma copy. */
const cardFields = {
  cardNumber: z.string().superRefine((value, context) => {
    if (!isValidCardNumber(value)) {
      context.addIssue({ code: "custom", message: "Your Card number is invalid" });
    } else if (!detectCardBrand(value)) {
      context.addIssue({
        code: "custom",
        message: "We accept Visa, Mastercard, American Express and Discover",
      });
    }
  }),
  expiry: z.string().superRefine((value, context) => {
    const result = checkExpiry(value);
    if (result === "invalid") {
      context.addIssue({ code: "custom", message: "Your card's expiry date is invalid" });
    } else if (result === "expired") {
      context.addIssue({ code: "custom", message: "Your card's expiry date is in the past" });
    }
  }),
  cvc: z.string().refine(isValidSecurityCode, "Your card's security code is incomplete"),
};

export const cardDetailsSchema = z.object(cardFields);
export type CardDetailsValues = z.infer<typeof cardDetailsSchema>;

/** Add Credits form (Dashboard): amount, billing address and card. */
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
  ...cardFields,
});

export type AddCreditsValues = z.infer<typeof addCreditsSchema>;

/** Billing's Add Credits has no address fields (the API reuses the saved address), so they aren't checked. */
export const addCreditsWithoutAddressSchema = addCreditsSchema.extend({
  fullName: z.string(),
  country: z.string(),
  address: z.string(),
});

/** Enable / Manage Auto Recharge. Empty until chosen; the stepper keeps typed values in range. */
export const autoRechargeSchema = z.object({
  paymentMethodId: z.string().min(1, "Select a payment method."),
  threshold: z
    .number()
    .int()
    .min(MIN_RECHARGE_THRESHOLD)
    .max(MAX_RECHARGE_THRESHOLD)
    .nullable()
    .refine((value) => value !== null, "Enter a balance."),
  amount: z
    .number()
    .int()
    .min(MIN_CREDIT_AMOUNT)
    .max(MAX_CREDIT_AMOUNT)
    .nullable()
    .refine((value) => value !== null, "Enter an amount."),
});

/** Form state (amounts start empty) and the validated values (amounts set). */
export type AutoRechargeFormValues = z.input<typeof autoRechargeSchema>;
export type AutoRechargeValues = z.output<typeof autoRechargeSchema>;
