import { create } from "zustand";

export type AuthMode = "login" | "signup";

interface OpenOptions {
  mode?: AuthMode;
  /** In-app path to go to once signed in (e.g. the page a guest tried to open). */
  returnTo?: string;
  /** Runs once, right after sign-in (e.g. open the Compare Models dialog). */
  onSuccess?: () => void;
}

interface AuthDialogState {
  open: boolean;
  mode: AuthMode;
  returnTo: string | null;
  onSuccess: (() => void) | null;
  openDialog: (options?: OpenOptions) => void;
  setMode: (mode: AuthMode) => void;
  close: () => void;
}

/**
 * The login / sign-up modal. Anything can open it (sidebar, locked actions); the
 * host in the app shell renders it. Not persisted: it always starts closed.
 */
export const useAuthDialogStore = create<AuthDialogState>()((set) => ({
  open: false,
  mode: "login",
  returnTo: null,
  onSuccess: null,
  openDialog: ({ mode = "login", returnTo, onSuccess } = {}) =>
    set({ open: true, mode, returnTo: returnTo ?? null, onSuccess: onSuccess ?? null }),
  setMode: (mode) => set({ mode }),
  close: () => set({ open: false, returnTo: null, onSuccess: null }),
}));
