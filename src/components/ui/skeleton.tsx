import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

const radii = { sm: "rounded-sm", md: "rounded-md", full: "rounded-full" } as const;

export interface SkeletonProps extends ComponentPropsWithRef<"div"> {
  /** Corner radius. Default `sm`. */
  radius?: keyof typeof radii;
}

/** Loading placeholder block. Decorative; give the loading region an aria-busy label. */
export function Skeleton({ radius = "sm", className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-hover motion-reduce:animate-none", radii[radius], className)}
      {...rest}
    />
  );
}
