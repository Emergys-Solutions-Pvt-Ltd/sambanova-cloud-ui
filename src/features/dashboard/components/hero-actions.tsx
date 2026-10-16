"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuthGate } from "@/features/auth";
import { useAddCreditsDialogStore } from "@/stores/add-credits-dialog-store";

/** Hero quick actions. Guests who click one are asked to log in first, then taken to the page. */
export function HeroActions() {
  const { guardLink, guardAction } = useAuthGate();
  const openAddCredits = useAddCreditsDialogStore((state) => state.openDialog);

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button
        href={routes.playground}
        onClick={guardLink(routes.playground)}
        variant="glass"
        rightIcon="arrow-right"
        rightIconMotion="marquee"
      >
        Open Playground
      </Button>
      <Button
        href={routes.apiKeys}
        onClick={guardLink(routes.apiKeys)}
        variant="glass"
        rightIcon="arrow-right"
        rightIconMotion="marquee"
      >
        Create API Key
      </Button>
      <Button
        variant="glass"
        rightIcon="arrow-right"
        rightIconMotion="marquee"
        onClick={guardAction(openAddCredits)}
        aria-haspopup="dialog"
      >
        Add Credits
      </Button>
    </div>
  );
}
