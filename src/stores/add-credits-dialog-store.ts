import { create } from "zustand";

/**
 * default = Dashboard / Usage Overview / Playground (asks for the billing address);
 * billing = Project Settings › Billing (no address: the saved one is reused).
 */
export type AddCreditsDialogVariant = "default" | "billing";

interface AddCreditsDialogState {
  open: boolean;
  /** Changes every time the dialog opens, so the form can start fresh. */
  session: number;
  variant: AddCreditsDialogVariant;
  /** Takes no arguments so it can be passed straight to `onClick`. */
  openDialog: () => void;
  openBillingDialog: () => void;
  close: () => void;
}

/** Open state of the Add Credits dialog, so the hero, Usage Overview, Playground and Billing can open it. */
export const useAddCreditsDialogStore = create<AddCreditsDialogState>()((set) => ({
  open: false,
  session: 0,
  variant: "default",
  openDialog: () =>
    set((state) => ({ open: true, session: state.session + 1, variant: "default" })),
  openBillingDialog: () =>
    set((state) => ({ open: true, session: state.session + 1, variant: "billing" })),
  close: () => set({ open: false }),
}));
