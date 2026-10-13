import { create } from "zustand";

export type PlaygroundDialog = "system-prompt" | "tuning" | "view-code";

interface PlaygroundUIState {
  dialog: PlaygroundDialog | null;
  /** Increments on every open; used as `key` so dialog forms start fresh. */
  dialogSession: number;
  historyDrawerOpen: boolean;
  /** Turn whose prompt is being edited inline (single mode or compare, shared). */
  editingTurnId: string | null;
  /** Composer draft, so suggestion chips and hero/dock swaps keep the text. */
  draft: string;
  /** Pending focus request: a composer that mounts after the request still honours it. */
  composerFocusPending: boolean;
  /** Same pattern for the History search input; set only by the user's View History action. */
  historyFocusPending: boolean;
  /** Element to restore focus to when a Playground dialog or the History panel closes. */
  returnFocusTo: HTMLElement | null;
  /** Stores `opener` in `returnFocusTo`. */
  openDialog: (dialog: PlaygroundDialog, opener?: HTMLElement | null) => void;
  closeDialog: () => void;
  setHistoryDrawerOpen: (open: boolean) => void;
  setEditingTurnId: (id: string | null) => void;
  setDraft: (draft: string) => void;
  requestComposerFocus: () => void;
  consumeComposerFocus: () => void;
  requestHistoryFocus: (opener?: HTMLElement | null) => void;
  consumeHistoryFocus: () => void;
  setReturnFocusTo: (el: HTMLElement | null) => void;
  /** Dialog null, drawer closed, editingTurnId null, draft "", flags false, returnFocusTo null. */
  reset: () => void;
}

/** Transient Playground UI state (Figma: Playground dialogs, History drawer, composer). Not persisted. */
export const usePlaygroundUIStore = create<PlaygroundUIState>()((set) => ({
  dialog: null,
  dialogSession: 0,
  historyDrawerOpen: false,
  editingTurnId: null,
  draft: "",
  composerFocusPending: false,
  historyFocusPending: false,
  returnFocusTo: null,
  openDialog: (dialog, opener) =>
    set((state) => ({
      dialog,
      dialogSession: state.dialogSession + 1,
      returnFocusTo: opener ?? null,
    })),
  closeDialog: () => set({ dialog: null }),
  setHistoryDrawerOpen: (historyDrawerOpen) => set({ historyDrawerOpen }),
  setEditingTurnId: (editingTurnId) => set({ editingTurnId }),
  setDraft: (draft) => set({ draft }),
  requestComposerFocus: () => set({ composerFocusPending: true }),
  consumeComposerFocus: () => set({ composerFocusPending: false }),
  requestHistoryFocus: (opener) =>
    set({ historyFocusPending: true, returnFocusTo: opener ?? null }),
  consumeHistoryFocus: () => set({ historyFocusPending: false }),
  setReturnFocusTo: (returnFocusTo) => set({ returnFocusTo }),
  reset: () =>
    set({
      dialog: null,
      historyDrawerOpen: false,
      editingTurnId: null,
      draft: "",
      composerFocusPending: false,
      historyFocusPending: false,
      returnFocusTo: null,
    }),
}));

export const selectDialog = (state: PlaygroundUIState) => state.dialog;
export const selectDialogSession = (state: PlaygroundUIState) => state.dialogSession;
export const selectHistoryDrawerOpen = (state: PlaygroundUIState) => state.historyDrawerOpen;
export const selectEditingTurnId = (state: PlaygroundUIState) => state.editingTurnId;
export const selectDraft = (state: PlaygroundUIState) => state.draft;
