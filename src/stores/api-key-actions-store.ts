import { create } from "zustand";

import { type ApiKey } from "@/types/domain";

export type ApiKeyAction = "edit" | "toggle-status" | "rotate" | "delete";

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
 * What the user picked in a key's Actions menu that opens a dialog (Edit Key, Disable Key, Rotate
 * Key, Delete Key); `ApiKeyActionDialogs` reads `request` to show it. View Usage is a link to the
 * key's usage page and does not go through here.
 */
export const useApiKeyActionsStore = create<ApiKeyActionsState>()((set) => ({
  request: null,
  requestAction: (action, key) => set({ request: { action, key } }),
  clear: () => set({ request: null }),
}));
