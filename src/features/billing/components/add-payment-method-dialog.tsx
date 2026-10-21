"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { isApiError } from "@/lib/api";
import { digitsOnly } from "@/lib/card";
import { toast } from "@/stores/toast-store";

import { useAddPaymentMethod } from "../hooks/use-billing";
import { cardLabel } from "../lib/cards";
import { type CardDetailsValues, cardDetailsSchema } from "../schemas";
import { CardDetailsFields } from "./card-details-fields";

const FORM_ID = "add-payment-method-form";

const apiFields: Record<string, keyof CardDetailsValues> = {
  cardNumber: "cardNumber",
  expiry: "expiry",
  cvc: "cvc",
};

/** Owns the form so Add Details can sit in the dialog's pinned footer, like Add Credits. */
function AddPaymentMethodContent({ onDone }: { onDone: () => void }) {
  const addCard = useAddPaymentMethod();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<CardDetailsValues>({
    resolver: zodResolver(cardDetailsSchema),
    mode: "onTouched",
    defaultValues: { cardNumber: "", expiry: "", cvc: "" },
  });

  const onSubmit = handleSubmit((values) => {
    clearErrors("root");
    addCard.mutate(
      { card: { number: digitsOnly(values.cardNumber), expiry: values.expiry, cvc: values.cvc } },
      {
        onSuccess: (card) => {
          onDone();
          toast.success(`${cardLabel(card)} added`);
        },
        onError: (error) => {
          const message = isApiError(error) ? error.message : "Could not add the card. Try again.";
          const details = isApiError(error)
            ? (error.details as { field?: string } | undefined)
            : undefined;
          setError((details?.field && apiFields[details.field]) || "root", { message });
        },
      },
    );
  });

  return (
    <DialogContent
      size="xl"
      variant="muted"
      title="Add Payment Details"
      description="This card will be saved to your account and can be removed at any time."
      footer={
        <>
          <DialogClose asChild>
            <Button type="button" variant="cancel" className="w-22.5" disabled={addCard.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} loading={addCard.isPending} disabled={!isValid}>
            Add Details
          </Button>
        </>
      }
    >
      {/* 36px under the description, then the Figma divider and "Credit Card Details". */}
      <form
        id={FORM_ID}
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-5 px-0.5 pt-5 pb-0.5"
      >
        <hr className="border-t border-default" />
        <section aria-labelledby="new-card-title" className="flex flex-col gap-4">
          <h3 id="new-card-title" className="text-body-lg font-semibold text-emphasis">
            Credit Card Details
          </h3>
          <CardDetailsFields control={control} />
        </section>
        {errors.root?.message && (
          <p
            role="alert"
            className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-label text-error"
          >
            {errors.root.message}
          </p>
        )}
      </form>
    </DialogContent>
  );
}

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Add Payment Details (Figma `1387:67446`): saves a card to the account from the My Cards "+". */
export function AddPaymentMethodDialog({ open, onOpenChange }: AddPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AddPaymentMethodContent onDone={() => onOpenChange(false)} />
    </Dialog>
  );
}
