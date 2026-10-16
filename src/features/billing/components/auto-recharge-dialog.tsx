"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { cardBrandLogos } from "@/config/assets";
import { isApiError } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { type AutoRechargeSettings, type PaymentMethod } from "@/types/domain";

import { useUpdateAutoRecharge } from "../hooks/use-billing";
import { cardLabel } from "../lib/cards";
import {
  type AutoRechargeFormValues,
  type AutoRechargeValues,
  autoRechargeSchema,
  MAX_CREDIT_AMOUNT,
  MAX_RECHARGE_THRESHOLD,
  MIN_CREDIT_AMOUNT,
  MIN_RECHARGE_THRESHOLD,
} from "../schemas";

export type AutoRechargeDialogMode = "enable" | "manage";

const copy: Record<AutoRechargeDialogMode, { title: string; submit: string; toast: string }> = {
  enable: {
    title: "Enable Auto Recharge",
    submit: "Enable Auto Recharge",
    toast: "Auto Recharge enabled",
  },
  manage: { title: "Manage Auto Recharge", submit: "Save Changes", toast: "Auto Recharge updated" },
};

const DESCRIPTION =
  "Automatically add credits to your account when your balance falls below a set amount.";

const apiFields: Record<string, keyof AutoRechargeFormValues> = {
  paymentMethodId: "paymentMethodId",
  threshold: "threshold",
  amount: "amount",
};

interface AutoRechargeFormProps {
  mode: AutoRechargeDialogMode;
  cards: PaymentMethod[];
  settings: AutoRechargeSettings | undefined;
  /** Preselected card (e.g. "Use for Auto Recharge" from a card's menu). */
  cardId?: string;
  onDone: () => void;
}

function AutoRechargeForm({ mode, cards, settings, cardId, onDone }: AutoRechargeFormProps) {
  const ids = { card: useId(), threshold: useId(), amount: useId() };
  const update = useUpdateAutoRecharge();
  const savedCard = cards.some((card) => card.id === settings?.paymentMethodId)
    ? settings?.paymentMethodId
    : undefined;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<AutoRechargeFormValues, unknown, AutoRechargeValues>({
    resolver: zodResolver(autoRechargeSchema),
    mode: "onChange",
    // The last values stay saved when Auto Recharge is off, so turning it on again is prefilled.
    defaultValues: {
      paymentMethodId: cardId ?? savedCard ?? "",
      threshold: settings?.threshold ?? null,
      amount: settings?.amount ?? null,
    },
  });

  const onSubmit = handleSubmit((values) => {
    update.mutate(
      {
        enabled: true,
        paymentMethodId: values.paymentMethodId,
        threshold: values.threshold,
        amount: values.amount,
      },
      {
        onSuccess: () => {
          onDone();
          toast.success(copy[mode].toast);
        },
        onError: (error) => {
          const message = isApiError(error) ? error.message : "Could not save. Try again.";
          const details = isApiError(error)
            ? (error.details as { field?: string } | undefined)
            : undefined;
          setError((details?.field && apiFields[details.field]) || "root", { message });
        },
      },
    );
  });

  const cardGroups = [
    {
      options: cards.map((card) => {
        const logo = cardBrandLogos[card.brand];
        return {
          value: card.id,
          label: cardLabel(card),
          leading: (
            <Image
              src={logo.src}
              alt=""
              width={24}
              height={18}
              unoptimized
              className="h-4.5 w-6 shrink-0 object-contain"
            />
          ),
        };
      }),
    },
  ];

  return (
    // 36px under the description and 30px between rows, as in Figma (16px header padding + 20px here).
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7.5 pt-5">
      <Controller
        control={control}
        name="paymentMethodId"
        render={({ field, fieldState }) => (
          <FormField label="Payment Method" htmlFor={ids.card} error={fieldState.error?.message}>
            <Select
              id={ids.card}
              variant="form"
              aria-label="Payment Method"
              placeholder="Select"
              groups={cardGroups}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(fieldState.error)}
            />
          </FormField>
        )}
      />

      <div className="grid gap-x-4 gap-y-7.5 sm:grid-cols-2">
        <Controller
          control={control}
          name="threshold"
          render={({ field, fieldState }) => (
            <FormField
              label="Recharge when balance falls below"
              htmlFor={ids.threshold}
              error={fieldState.error?.message}
            >
              <NumberInput
                id={ids.threshold}
                variant="form"
                allowEmpty
                prefix="$"
                placeholder="Enter"
                min={MIN_RECHARGE_THRESHOLD}
                max={MAX_RECHARGE_THRESHOLD}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(fieldState.error)}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormField
              label="Automatically Add"
              htmlFor={ids.amount}
              error={fieldState.error?.message}
            >
              <NumberInput
                id={ids.amount}
                variant="form"
                allowEmpty
                prefix="$"
                placeholder="Enter"
                min={MIN_CREDIT_AMOUNT}
                max={MAX_CREDIT_AMOUNT}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(fieldState.error)}
              />
            </FormField>
          )}
        />
      </div>

      {errors.root?.message && (
        <p
          role="alert"
          className="-mt-3 rounded-md border border-error-border bg-error-bg px-3 py-2 text-label text-error"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel" className="w-22.5" disabled={update.isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={update.isPending} disabled={!isValid}>
          {copy[mode].submit}
        </Button>
      </div>
    </form>
  );
}

interface AutoRechargeDialogProps extends Omit<AutoRechargeFormProps, "onDone"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Enable Auto Recharge (Figma `1795:104223`): card, threshold and top-up amount. "manage" reopens it
 * prefilled from the Manage Card button. The switch only turns on once this saves.
 */
export function AutoRechargeDialog({ open, onOpenChange, ...form }: AutoRechargeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" title={copy[form.mode].title} description={DESCRIPTION}>
        <AutoRechargeForm {...form} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
