"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

/** Segmented control (Figma: Curl / Python / Gradio, Cost / Feature). */
export function TabsList({ className, ...rest }: ComponentPropsWithRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex gap-1 rounded-md bg-surface-raised p-0.75", className)}
      {...rest}
    />
  );
}

export function TabsTrigger({
  className,
  ...rest
}: ComponentPropsWithRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-7.75 min-w-20 items-center justify-center rounded-sm px-3 text-body-sm font-medium",
        "text-tab-inactive transition-colors duration-(--sn-duration-fast) ease-standard hover:text-primary",
        "data-[state=active]:bg-selected data-[state=active]:text-on-brand",
        className,
      )}
      {...rest}
    />
  );
}

export function TabsContent({
  className,
  ...rest
}: ComponentPropsWithRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none", className)} {...rest} />;
}
