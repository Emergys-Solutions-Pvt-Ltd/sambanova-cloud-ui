"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type SwitchTone = "brand" | "success";

/** brand = purple (Playground "Sampling"); success = green with a dimmed thumb when off (Billing Auto Recharge). */
const tones: Record<SwitchTone, { track: string; thumb: string }> = {
  brand: { track: "data-[state=checked]:bg-switch-on", thumb: "" },
  success: {
    track: "data-[state=checked]:bg-switch-success",
    thumb: "data-[state=unchecked]:opacity-40",
  },
};

/**
 * 44 × 24 on/off switch (Figma: Tuning Parameters "Sampling", thumb at 3px / 21px).
 * Radix supplies `role="switch"`, `aria-checked` and Space / Enter toggling; label it with
 * `aria-label` or `aria-labelledby`.
 */
export function Switch({
  tone = "brand",
  className,
  ...rest
}: ComponentPropsWithRef<typeof SwitchPrimitive.Root> & { tone?: SwitchTone }) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5",
        "bg-switch-off",
        tones[tone].track,
        "transition-colors duration-(--sn-duration-fast) ease-standard motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-px rounded-full bg-switch-thumb data-[state=checked]:translate-x-[19px]",
          "transition-[translate,opacity] duration-(--sn-duration-fast) ease-standard motion-reduce:transition-none",
          tones[tone].thumb,
        )}
      />
    </SwitchPrimitive.Root>
  );
}
