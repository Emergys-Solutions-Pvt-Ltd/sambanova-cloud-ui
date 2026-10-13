"use client";

import { selectModels, usePlaygroundChatStore } from "@/stores/playground-chat-store";

import { usePlaygroundModels } from "../hooks/use-playground-models";

/**
 * Static "Comparing: A • B" label in the compare composer (Figma: composer `620:12797`,
 * compare `1398:119699`). Phones show "Comparing 2 models"; screen readers always get the names.
 */
export function CompareSummary() {
  const models = usePlaygroundChatStore(selectModels);
  const { resolve } = usePlaygroundModels();
  const nameA = resolve(models.a)?.name ?? "Model A";
  const nameB = resolve(models.b)?.name ?? "Model B";

  return (
    <p className="flex min-w-0 items-center py-1.5 pr-2 pl-3 text-body-lg leading-[normal] whitespace-nowrap text-primary">
      <span className="flex min-w-0 items-center gap-2 max-sm:sr-only">
        <span className="min-w-0 truncate">
          <span className="text-muted">Comparing:</span> {nameA}
        </span>
        <span aria-hidden className="size-1.25 shrink-0 rounded-full bg-current" />
        <span className="sr-only">and</span>
        <span className="min-w-0 truncate">{nameB}</span>
      </span>
      <span aria-hidden className="text-muted sm:hidden">
        Comparing 2 models
      </span>
    </p>
  );
}
