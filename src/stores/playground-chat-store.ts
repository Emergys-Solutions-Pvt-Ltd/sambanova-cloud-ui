import { create } from "zustand";

import {
  type AssistantReply,
  type CompareSlot,
  type Conversation,
  type ConversationTurn,
  type PlaygroundMode,
} from "@/types/domain";

import { usePlaygroundPrefsStore } from "./playground-prefs-store";

interface PlaygroundChatState {
  /** Client-generated "cnv_xxxxxxxx", assigned on the first send; null for an unsaved thread. */
  conversationId: string | null;
  title: string;
  mode: PlaygroundMode;
  /** Models of the active thread. Single chat reads `models.a`. */
  models: Record<CompareSlot, string | null>;
  turns: ConversationTurn[];
  createdAt: string | null;
  /** Project the thread is saved under; set on the first send (or on reopen), used by every save. */
  projectId: string | null;
  /** Clears id / title / turns / projectId. */
  startThread: (input: {
    mode: PlaygroundMode;
    models: Record<CompareSlot, string | null>;
  }) => void;
  loadConversation: (conversation: Conversation, projectId: string) => void;
  /** `meta` is applied only when the thread has no `conversationId` yet. */
  addTurn: (
    turn: ConversationTurn,
    meta: { conversationId: string; title: string; createdAt: string; projectId: string | null },
  ) => void;
  setSlotModel: (slot: CompareSlot, modelId: string) => void;
  /** No-op unless `turns[turnId].replies[slot].runId === runId` (a superseded stream cannot touch a newer reply). */
  updateReply: (
    turnId: string,
    slot: CompareSlot,
    runId: string,
    patch: Partial<AssistantReply>,
  ) => void;
  /** Same runId guard; also flips pending → streaming. */
  appendReplyContent: (turnId: string, slot: CompareSlot, runId: string, text: string) => void;
  /** Sets the prompt and fresh replies (new runIds) and drops later turns. */
  editTurn: (
    turnId: string,
    prompt: string,
    replies: Partial<Record<CompareSlot, AssistantReply>>,
  ) => void;
  /** Replaces one slot's reply with a fresh pending one (new runId); other slots and later turns untouched. */
  resetReply: (turnId: string, slot: CompareSlot, reply: AssistantReply) => void;
  setTitle: (title: string) => void;
  /** Back to an empty single-chat thread on the preferred model. Called by session-sync. */
  reset: () => void;
}

function emptyThread() {
  return {
    conversationId: null,
    title: "",
    mode: "single" as PlaygroundMode,
    models: { a: usePlaygroundPrefsStore.getState().modelId, b: null },
    turns: [] as ConversationTurn[],
    createdAt: null,
    projectId: null,
  };
}

/** Applies `update` to one reply when its runId still matches; returns the same turns otherwise. */
function patchReply(
  turns: ConversationTurn[],
  turnId: string,
  slot: CompareSlot,
  runId: string,
  update: (reply: AssistantReply) => AssistantReply,
) {
  const index = turns.findIndex((turn) => turn.id === turnId);
  const turn = turns[index];
  const reply = turn?.replies[slot];
  if (!turn || !reply || reply.runId !== runId) return turns;
  const next = turns.slice();
  next[index] = { ...turn, replies: { ...turn.replies, [slot]: update(reply) } };
  return next;
}

/**
 * The active Playground thread (Figma: Playground chat / Compare Models). Not
 * persisted: survives route hides via `<Activity>` and is reset on user change.
 */
export const usePlaygroundChatStore = create<PlaygroundChatState>()((set) => ({
  ...emptyThread(),
  startThread: ({ mode, models }) =>
    set({
      conversationId: null,
      title: "",
      mode,
      models,
      turns: [],
      createdAt: null,
      projectId: null,
    }),
  loadConversation: (conversation, projectId) =>
    set({
      conversationId: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
      models: { a: conversation.models.a ?? null, b: conversation.models.b ?? null },
      turns: conversation.turns,
      createdAt: conversation.createdAt,
      projectId,
    }),
  addTurn: (turn, meta) =>
    set((state) => ({
      turns: [...state.turns, turn],
      ...(state.conversationId === null && {
        conversationId: meta.conversationId,
        title: meta.title,
        createdAt: meta.createdAt,
        projectId: meta.projectId,
      }),
    })),
  setSlotModel: (slot, modelId) => {
    if (modelId) set((state) => ({ models: { ...state.models, [slot]: modelId } }));
  },
  updateReply: (turnId, slot, runId, patch) =>
    set((state) => {
      const turns = patchReply(state.turns, turnId, slot, runId, (reply) => ({
        ...reply,
        ...patch,
      }));
      return turns === state.turns ? state : { turns };
    }),
  appendReplyContent: (turnId, slot, runId, text) =>
    set((state) => {
      const turns = patchReply(state.turns, turnId, slot, runId, (reply) => ({
        ...reply,
        content: reply.content + text,
        status: reply.status === "pending" ? "streaming" : reply.status,
      }));
      return turns === state.turns ? state : { turns };
    }),
  editTurn: (turnId, prompt, replies) =>
    set((state) => {
      const index = state.turns.findIndex((turn) => turn.id === turnId);
      const turn = state.turns[index];
      if (!turn) return state;
      return { turns: [...state.turns.slice(0, index), { ...turn, prompt, replies }] };
    }),
  resetReply: (turnId, slot, reply) =>
    set((state) => {
      const index = state.turns.findIndex((turn) => turn.id === turnId);
      const turn = state.turns[index];
      if (!turn) return state;
      const turns = state.turns.slice();
      turns[index] = { ...turn, replies: { ...turn.replies, [slot]: reply } };
      return { turns };
    }),
  setTitle: (title) => set({ title }),
  reset: () => set(emptyThread()),
}));

type ChatState = PlaygroundChatState;

export const selectTurns = (state: ChatState) => state.turns;
export const selectMode = (state: ChatState) => state.mode;
export const selectModels = (state: ChatState) => state.models;
export const selectConversationId = (state: ChatState) => state.conversationId;
export const selectTitle = (state: ChatState) => state.title;
export const selectHasTurns = (state: ChatState) => state.turns.length > 0;
export const selectIsGenerating = (state: ChatState) =>
  state.turns.some((turn) =>
    Object.values(turn.replies).some(
      (reply) => reply?.status === "pending" || reply?.status === "streaming",
    ),
  );
