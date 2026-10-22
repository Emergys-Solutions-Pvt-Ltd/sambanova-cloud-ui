"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { emptyStates } from "@/config/assets";
import { externalLinks } from "@/config/links";
import { useAddCreditsDialogStore } from "@/stores/add-credits-dialog-store";

/**
 * Billing before the first purchase or saved card (Figma `1387:67224`): "Add Credits to Continue",
 * with the enterprise pricing callout 137px below.
 */
export function BillingZeroState() {
  const openAddCredits = useAddCreditsDialogStore((state) => state.openBillingDialog);
  const image = emptyStates.creditCard;

  return (
    <div className="flex flex-col items-center gap-20 pt-6.75 xl:gap-34.25">
      <div className="flex flex-col items-center gap-8 text-center">
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          style={{ height: 137.25, width: "auto" }}
        />
        <div className="flex max-w-130 flex-col gap-3">
          <h2 className="text-heading-md leading-[1.2]">Add Credits to Continue</h2>
          <p className="text-body leading-[1.2] font-semibold text-muted">
            Purchase credits to start using SambaNova APIs and models. Credits are deducted based on
            your project&apos;s API usage and can be added anytime.
          </p>
        </div>
        <Button leftIcon="plus" iconSize={18} onClick={openAddCredits}>
          Add Credits
        </Button>
      </div>

      <Callout
        icon="document"
        title="Looking for enterprise pricing?"
        description="Contact our sales team for custom pricing, dedicated capacity, higher rate limits, and enterprise billing options."
        action={
          <Button
            href={externalLinks.contactSales}
            external
            variant="secondary"
            radius="md"
            rightIcon="external-link"
            iconSize={20}
          >
            Contact Sales
          </Button>
        }
        className="w-full max-w-256"
      />
    </div>
  );
}
