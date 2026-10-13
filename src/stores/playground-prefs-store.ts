import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { type CompareSlot, type SystemPromptSetting, type TuningParams } from "@/types/domain";

interface PlaygroundPrefsState {
  /** Single-chat model (CatalogModel.id); null until the user picks one ("Select Model"). */
  modelId: string | null;
  /** Last compare pair. Default { a: "deepseek-v3.1", b: "minimax-m2.7" }. */
  compareModelIds: Record<CompareSlot, string>;
  systemPrompt: SystemPromptSetting;
  tuning: TuningParams;
  /** In-flow History panel (≥ lg only). Default false. */
  historyOpen: boolean;
  /** Not persisted. True once rehydrated; gates the History width transition so it never plays on load. */
  hydrated: boolean;
  setModelId: (id: string) => void;
  setCompareModelId: (slot: CompareSlot, id: string) => void;
  setSystemPrompt: (value: SystemPromptSetting) => void;
  setTuning: (value: TuningParams) => void;
  setHistoryOpen: (open: boolean) => void;
}

/** Declared as a function so it can reference the store before the `const` below is assigned. */
function markHydrated(): void {
  usePlaygroundPrefsStore.setState({ hydrated: true });
}

/**
 * Playground preferences (Figma: Playground model picker, System Prompt, Tuning
 * Parameters, View History). Per browser, not per user (like theme): survives logout.
 */
export const usePlaygroundPrefsStore = create<PlaygroundPrefsState>()(
  persist(
    (set) => ({
      modelId: null,
      compareModelIds: { a: "deepseek-v3.1", b: "minimax-m2.7" },
      systemPrompt: { roleId: null, prompt: "" },
      tuning: { sampling: false, maxTokens: 0 },
      historyOpen: false,
      hydrated: false,
      setModelId: (modelId) => set({ modelId: modelId || null }),
      setCompareModelId: (slot, id) => {
        if (id) set((state) => ({ compareModelIds: { ...state.compareModelIds, [slot]: id } }));
      },
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTuning: (tuning) => set({ tuning }),
      setHistoryOpen: (historyOpen) => set({ historyOpen }),
    }),
    {
      name: "sn:playground",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated after mount by <StoreHydration /> to avoid SSR mismatches.
      skipHydration: true,
      partialize: ({ modelId, compareModelIds, systemPrompt, tuning, historyOpen }) => ({
        modelId,
        compareModelIds,
        systemPrompt,
        tuning,
        historyOpen,
      }),
      // An empty stored id means "no model chosen yet", the same as null.
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PlaygroundPrefsState>;
        return { ...current, ...stored, modelId: stored.modelId || null };
      },
      onRehydrateStorage: () => () => markHydrated(),
    },
  ),
);

export const selectModelId = (state: PlaygroundPrefsState) => state.modelId;
export const selectCompareModelIds = (state: PlaygroundPrefsState) => state.compareModelIds;
export const selectSystemPrompt = (state: PlaygroundPrefsState) => state.systemPrompt;
export const selectTuning = (state: PlaygroundPrefsState) => state.tuning;
export const selectHistoryOpen = (state: PlaygroundPrefsState) => state.historyOpen;
export const selectPrefsHydrated = (state: PlaygroundPrefsState) => state.hydrated;
