"use client";

import { Icon } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUsdPrecise } from "@/lib/format";
import { useAddCreditsDialogStore } from "@/stores/add-credits-dialog-store";
import { selectCreditBalance, useSessionStore } from "@/stores/session-store";

/** Gradient "Credits" banner with the balance and an Add Credits action (Figma: Variation 2 - Wide Banner). */
export function CreditsCard() {
  const balance = useSessionStore(selectCreditBalance);
  const openAddCredits = useAddCreditsDialogStore((state) => state.openBillingDialog);

  return (
    <section
      aria-labelledby="billing-credits-title"
      className="flex flex-col gap-5 rounded-lg p-5 shadow-credits-card bg-credits-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-7 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <h2
            id="billing-credits-title"
            className="text-heading-sm leading-[1.2] font-bold text-content"
          >
            Credits
          </h2>
          <p className="text-body text-credits-description">
            Your total credit balance, including free credits granted to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddCredits}
          className="flex shrink-0 items-center gap-1.5 rounded-xs text-body leading-[1.2] font-semibold text-emphasis transition-opacity duration-(--sn-duration-fast) ease-standard hover:opacity-80"
        >
          <Icon name="plus" size={18} />
          Add Credits
        </button>
      </div>
      {balance === null ? (
        <Skeleton className="h-8.5 w-32" />
      ) : (
        <p className="text-heading-2xl">{formatUsdPrecise(balance)}</p>
      )}
    </section>
  );
}
