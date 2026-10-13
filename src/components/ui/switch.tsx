"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

/**
 * 44 × 24 on/off switch (Figma: Tuning Parameters "Sampling", thumb at 3px / 21px).
 * Radix supplies `role="switch"`, `aria-checked` and Space / Enter toggling; label it with
 * `aria-label` or `aria-labelledby`.
 */
export function Switch({ className, ...rest }: ComponentPropsWithRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5",
        "bg-switch-off data-[state=checked]:bg-switch-on",
        "transition-colors duration-(--sn-duration-fast) ease-standard motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-px rounded-full bg-switch-thumb data-[state=checked]:translate-x-[19px]",
          "transition-transform duration-(--sn-duration-fast) ease-standard motion-reduce:transition-none",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
