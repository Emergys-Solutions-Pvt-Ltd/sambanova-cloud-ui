import { create } from "zustand";

import { type ApiKey } from "@/types/domain";

export type ApiKeyAction = "usage" | "edit" | "toggle-status" | "rotate" | "delete";

interface ApiKeyActionRequest {
  action: ApiKeyAction;
  key: ApiKey;
}

interface ApiKeyActionsState {
  request: ApiKeyActionRequest | null;
  /** Called by the row actions menu. */
  requestAction: (action: ApiKeyAction, key: ApiKey) => void;
  clear: () => void;
}

/**
 * What the user picked in a key's Actions menu. The menu already reports it; the screens behind
 * each action (View Usage, Edit Key, Disable Key, Rotate Key, Delete Key in Figma) are built later
 * and will read `request` to open their dialog or page.
 */
export const useApiKeyActionsStore = create<ApiKeyActionsState>()((set) => ({
  request: null,
  requestAction: (action, key) => set({ request: { action, key } }),
  clear: () => set({ request: null }),
}));
