"use client";

import { useEffect, useEffectEvent } from "react";

import { selectPrefsHydrated, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";

import { useChatActions } from "./use-chat-actions";
import { usePlaygroundModels } from "./use-playground-models";

/**
 * Applies a `?model=` deep link (Dashboard "Try in Playground", Figma `1398:118868`) to the active
 * thread once per value, after the prefs have hydrated and the catalog has loaded. Unknown ids
 * are ignored; the thread is kept, and later turns use the linked model.
 */
export function useModelParam(modelParam: string | null) {
  const { byId } = usePlaygroundModels();
  const { selectModel } = useChatActions();
  const hydrated = usePlaygroundPrefsStore(selectPrefsHydrated);
  const ready = hydrated && byId.size > 0;

  const apply = useEffectEvent((id: string) => {
    if (byId.has(id)) selectModel("a", id);
  });

  useEffect(() => {
    if (ready && modelParam) apply(modelParam);
  }, [ready, modelParam]);
}
