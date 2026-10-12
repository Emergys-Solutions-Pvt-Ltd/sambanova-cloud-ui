import { create } from "zustand";

interface CreateProjectDialogState {
  open: boolean;
  openDialog: () => void;
  close: () => void;
}

/** Open state of the "Create New Project" dialog, so the project menu (or any page) can open it. */
export const useCreateProjectDialogStore = create<CreateProjectDialogState>()((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  close: () => set({ open: false }),
}));
