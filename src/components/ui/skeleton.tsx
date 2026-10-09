import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

/** Loading placeholder block. Decorative; give the loading region an aria-busy label. */
export function Skeleton({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-sm bg-hover motion-reduce:animate-none", className)}
      {...rest}
    />
  );
}
