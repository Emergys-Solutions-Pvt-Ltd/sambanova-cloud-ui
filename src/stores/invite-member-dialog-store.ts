import { create } from "zustand";

interface InviteMemberDialogState {
  open: boolean;
  openDialog: () => void;
  close: () => void;
}

/** Open state of the "Invite Member" dialog (Project Settings › Members header button). */
export const useInviteMemberDialogStore = create<InviteMemberDialogState>()((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  close: () => set({ open: false }),
}));
