import { create } from "zustand";

interface AddCreditsDialogState {
  open: boolean;
  /** Changes every time the dialog opens, so the form can start fresh. */
  session: number;
  openDialog: () => void;
  close: () => void;
}

/** Open state of the Add Credits dialog, so the hero, Usage Overview (and later Billing) can open it. */
export const useAddCreditsDialogStore = create<AddCreditsDialogState>()((set) => ({
  open: false,
  session: 0,
  openDialog: () => set((state) => ({ open: true, session: state.session + 1 })),
  close: () => set({ open: false }),
}));
