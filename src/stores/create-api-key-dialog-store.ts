import { create } from "zustand";

interface CreateApiKeyDialogState {
  open: boolean;
  openDialog: () => void;
  close: () => void;
}

/**
 * Open state of the "Create API key" flow. The API Keys screen and its buttons already use
 * it; the dialog itself (Figma: Create API key) is built in a later step and will read `open`.
 */
export const useCreateApiKeyDialogStore = create<CreateApiKeyDialogState>()((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  close: () => set({ open: false }),
}));
