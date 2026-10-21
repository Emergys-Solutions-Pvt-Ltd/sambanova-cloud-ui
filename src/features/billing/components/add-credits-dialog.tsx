"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormField, TextField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { digitsOnly } from "@/lib/card";
import { formatUsd } from "@/lib/format";
import {
  type AddCreditsDialogVariant,
  useAddCreditsDialogStore,
} from "@/stores/add-credits-dialog-store";
import { selectUser, useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/toast-store";
import { type BillingAddress } from "@/types/domain";

import { useBillingAddress, useBuyCredits } from "../hooks/use-billing";
import { countries } from "../lib/countries";
import {
  type AddCreditsValues,
  addCreditsSchema,
  addCreditsWithoutAddressSchema,
} from "../schemas";
import { AmountPicker } from "./amount-picker";
import { CardDetailsFields } from "./card-details-fields";

const FORM_ID = "add-credits-form";
const TITLE = "Add Credits";
const DESCRIPTION = "Select a credit amount or enter a custom value to add funds to your account.";

const countryGroups = [{ options: countries.map(({ value, label }) => ({ value, label })) }];

/** Maps the field names the API reports to this form's fields. */
const apiFields: Record<string, keyof AddCreditsValues> = {
  amount: "amount",
  fullName: "fullName",
  country: "country",
  address: "address",
  cardNumber: "cardNumber",
  expiry: "expiry",
  cvc: "cvc",
};

/**
 * Owns the form so the Buy button can live in the dialog's pinned footer, outside the scrolling body.
 * The Billing variant has no address section (Figma: Billing › Add Credits); the API reuses the saved one.
 */
function AddCreditsDialogContent({
  defaultAddress,
  variant,
}: {
  defaultAddress: BillingAddress | null;
  variant: AddCreditsDialogVariant;
}) {
  const withAddress = variant === "default";
  const countryId = useId();
  const close = useAddCreditsDialogStore((state) => state.close);
  const buyCredits = useBuyCredits();
  const user = useSessionStore(selectUser);

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<AddCreditsValues>({
    resolver: zodResolver(withAddress ? addCreditsSchema : addCreditsWithoutAddressSchema),
    mode: "onTouched",
    defaultValues: {
      amount: null,
      fullName: defaultAddress?.fullName ?? user?.name ?? "",
      country: defaultAddress?.country ?? "",
      address: defaultAddress?.address ?? "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  const amount = useWatch({ control, name: "amount" });
  const amountValid = amount !== null && !errors.amount;

  const onSubmit = handleSubmit((values) => {
    clearErrors("root");
    buyCredits.mutate(
      {
        amount: values.amount!,
        ...(withAddress && {
          billingAddress: {
            fullName: values.fullName.trim(),
            country: values.country,
            address: values.address.trim(),
          },
        }),
        card: { number: digitsOnly(values.cardNumber), expiry: values.expiry, cvc: values.cvc },
      },
      {
        onSuccess: (_result, input) => {
          close();
          toast.success(`${formatUsd(input.amount)} Credits Added Successfully`);
        },
        onError: (error) => {
          const message = isApiError(error)
            ? error.message
            : "Could not complete the purchase. Try again.";
          const details = isApiError(error)
            ? (error.details as { field?: string } | undefined)
            : undefined;
          const field = details?.field ? apiFields[details.field] : undefined;
          if (field) setError(field, { message });
          else setError("root", { message });
        },
      },
    );
  });

  return (
    <DialogContent
      size="xl"
      variant="muted"
      title={TITLE}
      description={DESCRIPTION}
      footer={
        <>
          <DialogClose asChild>
            <Button type="button" variant="cancel" className="w-22.5">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} loading={buyCredits.isPending} disabled={!isValid}>
            {amountValid ? `Buy ${formatUsd(amount)} of credits` : "Buy credits"}
          </Button>
        </>
      }
    >
      {/* 36px under the description, as in Figma (16px header padding + 20px here). */}
      <form
        id={FORM_ID}
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-5 px-0.5 pt-5 pb-0.5"
      >
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <AmountPicker
              value={field.value}
              onChange={(next) => {
                field.onChange(next);
                field.onBlur();
              }}
              error={fieldState.error?.message}
            />
          )}
        />

        <hr className="border-t border-default" />

        {withAddress && (
          <section aria-labelledby="billing-address-title" className="flex flex-col gap-4">
            <h3 id="billing-address-title" className="text-body-lg font-semibold">
              Billing Address
            </h3>
            <div className="flex flex-col gap-2">
              <TextField
                label="Full name"
                fieldSize="sm"
                bordered="input"
                placeholderTone="subtle"
                autoComplete="name"
                placeholder="Enter"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="country"
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Country or region"
                      htmlFor={countryId}
                      error={fieldState.error?.message}
                    >
                      <Select
                        id={countryId}
                        variant="field"
                        aria-label="Country or region"
                        placeholder="Select"
                        placeholderTone="subtle"
                        groups={countryGroups}
                        value={field.value}
                        onValueChange={(next) => {
                          field.onChange(next);
                          field.onBlur();
                        }}
                        onBlur={field.onBlur}
                        invalid={Boolean(fieldState.error)}
                      />
                    </FormField>
                  )}
                />
                <TextField
                  label="Address"
                  fieldSize="sm"
                  bordered="input"
                  placeholderTone="subtle"
                  autoComplete="street-address"
                  placeholder="Enter"
                  error={errors.address?.message}
                  {...register("address")}
                />
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="card-details-title" className="flex flex-col gap-4">
          <h3 id="card-details-title" className="text-body-lg font-semibold">
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

/** Same frame while the saved billing address loads. */
function AddCreditsDialogLoading() {
  return (
    <DialogContent size="xl" variant="muted" title={TITLE} description={DESCRIPTION}>
      <div aria-busy="true" aria-label="Loading billing details" className="flex flex-col gap-5">
        <Skeleton className="h-13.5" />
        <Skeleton className="h-13.5" />
        <Skeleton className="h-40" />
      </div>
    </DialogContent>
  );
}

/**
 * "Add Credits" modal (Figma: Dashboard › Add Credits, Billing › Add Credits). Credits belong to the
 * user, not a project.
 */
export function AddCreditsDialog() {
  const open = useAddCreditsDialogStore((state) => state.open);
  const session = useAddCreditsDialogStore((state) => state.session);
  const close = useAddCreditsDialogStore((state) => state.close);
  const variant = useAddCreditsDialogStore((state) => state.variant);
  const address = useBillingAddress();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      {/* Billing doesn't ask for the address, so it needn't wait for it. */}
      {variant === "default" && address.isPending ? (
        <AddCreditsDialogLoading />
      ) : (
        <AddCreditsDialogContent
          key={session}
          variant={variant}
          defaultAddress={address.data ?? null}
        />
      )}
    </Dialog>
  );
}
