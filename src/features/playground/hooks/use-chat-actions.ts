"use client";

import { type QueryClient, useQueryClient } from "@tanstack/react-query";

import { useAuthGate } from "@/features/auth";
import { useActiveProject } from "@/features/projects";
import { toApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { selectIsGenerating, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { useProjectStore } from "@/stores/project-store";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/toast-store";
import {
  type AssistantReply,
  type CatalogModel,
  type ChatCompletionRequest,
  type ChatCompletionUsage,
  type ChatFinishReason,
  type CompareSlot,
  type ConversationTurn,
  type Project,
  type SaveConversationInput,
} from "@/types/domain";

import { streamChatCompletion } from "../api/chat.api";
import { buildRequestMessages, makeTitle, newId } from "../lib/conversation";
import { computeReplyMetrics } from "../lib/metrics";
import { installPlaygroundSessionSync } from "../lib/session-sync";
import { abortAllStreams, registerRun, releaseRun } from "../lib/stream-registry";
import { toRequestParams } from "../lib/tuning";
import { conversationQuery, useSaveConversation } from "./use-conversations";

installPlaygroundSessionSync();

/** Distance of a newly sent prompt from the scroller top (Figma: Prompt Added B `1398:122455`). */
const PIN_OFFSET = 92;

const MODEL_FALLBACK = "deepseek-v3.1";

export interface ChatActions {
  /** Gated by useAuthGate: guests get the login dialog and the prompt is sent after sign-in. */
  send: (prompt: string) => void;
  stop: () => void;
  editAndResend: (turnId: string, prompt: string) => void;
  /** Regenerates one slot of one turn ("Try again"); non-destructive. */
  retry: (turnId: string, slot: CompareSlot) => void;
  newThread: () => void;
  enterCompare: () => void;
  exitCompare: (keep: CompareSlot) => void;
  selectModel: (slot: CompareSlot, modelId: string) => void;
  openConversation: (id: string) => Promise<void>;
}

type SaveFn = (variables: {
  projectId: string;
  id: string;
  input: SaveConversationInput;
}) => Promise<unknown>;

/** Everything a stream needs that comes from React (captured when the action runs). */
interface StreamContext {
  queryClient: QueryClient;
  save: SaveFn;
  fallbackProjectId: string | null;
}

const chatState = () => usePlaygroundChatStore.getState();
const uiState = () => usePlaygroundUIStore.getState();
const prefsState = () => usePlaygroundPrefsStore.getState();

const isSettled = (reply: AssistantReply | undefined) =>
  reply !== undefined && reply.status !== "pending" && reply.status !== "streaming";

/** Slots that take part in a turn for the current mode. */
const activeSlots = (): CompareSlot[] => (chatState().mode === "compare" ? ["a", "b"] : ["a"]);

/** Fresh pending reply with its own runId. Handlers only. */
function pendingReply(modelId: string): AssistantReply {
  return { modelId, status: "pending", content: "", runId: newId("run") };
}

/** Active project, resolved like `useActiveProject` but from the live stores (no stale closure). */
function resolveProjectId(context: StreamContext) {
  const projects = context.queryClient.getQueryData<Project[]>(queryKeys.projects.list()) ?? [];
  const activeId = useProjectStore.getState().activeProjectId;
  const project =
    projects.find((item) => item.id === activeId) ??
    projects.find((item) => item.isDefault) ??
    projects[0];
  return project?.id ?? context.fallbackProjectId;
}

function catalogModel(context: StreamContext, modelId: string): CatalogModel | undefined {
  return context.queryClient
    .getQueryData<CatalogModel[]>(queryKeys.models.catalog())
    ?.find((model) => model.id === modelId);
}

/** Scrolls every thread scroller so the turn's bubble sits PIN_OFFSET px from its top. */
function pinTurn(turnId: string) {
  requestAnimationFrame(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll<HTMLElement>("[data-thread-scroller]").forEach((scroller) => {
      const bubble = scroller.querySelector<HTMLElement>(
        `[data-turn-bubble="${CSS.escape(turnId)}"]`,
      );
      if (!bubble) return;
      scroller.scrollTo({
        top: bubble.offsetTop - PIN_OFFSET,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  });
}

/** PUT the thread once every reply of `turnId` is settled and this run is still the current one. */
function maybeSave(context: StreamContext, turnId: string, slot: CompareSlot, runId: string) {
  const thread = chatState();
  const turn = thread.turns.find((item) => item.id === turnId);
  if (!turn || turn.replies[slot]?.runId !== runId) return;
  if (!Object.values(turn.replies).every(isSettled)) return;
  if (!selectIsAuthenticated(useSessionStore.getState())) return;
  if (!thread.conversationId || !thread.createdAt) return;

  let projectId = thread.projectId;
  if (!projectId) {
    // A guest's first send runs right after sign-in, possibly before projects loaded.
    projectId = resolveProjectId({ ...context, fallbackProjectId: null });
    if (!projectId) return;
    usePlaygroundChatStore.setState({ projectId });
  }

  const turns: ConversationTurn[] = thread.turns.map((item) => ({
    ...item,
    replies: Object.fromEntries(
      Object.entries(item.replies).flatMap(([key, reply]) => {
        if (!reply || !isSettled(reply)) return [];
        const { runId: _runId, ...saved } = reply;
        return [[key, saved]];
      }),
    ),
  }));
  const models = Object.fromEntries(
    Object.entries(thread.models).filter(([, id]) => id !== null),
  ) as SaveConversationInput["models"];

  context
    .save({
      projectId,
      id: thread.conversationId,
      input: {
        title: thread.title,
        mode: thread.mode,
        models,
        systemPrompt: prefsState().systemPrompt.prompt,
        turns,
        createdAt: thread.createdAt,
      },
    })
    .catch((error: unknown) => console.warn("Couldn’t save the Playground chat.", error));
}

/** Streams one reply into the store; every write is guarded by `runId`. */
async function streamReply(
  context: StreamContext,
  turnId: string,
  slot: CompareSlot,
  runId: string,
) {
  const thread = chatState();
  const reply = thread.turns.find((item) => item.id === turnId)?.replies[slot];
  if (!reply || reply.runId !== runId) return;

  const prefs = prefsState();
  const model = catalogModel(context, reply.modelId);
  const request: ChatCompletionRequest = {
    model: model?.apiId ?? reply.modelId,
    messages: buildRequestMessages(thread.turns, turnId, slot, prefs.systemPrompt.prompt),
    ...toRequestParams(prefs.tuning, model),
  };

  const controller = new AbortController();
  registerRun(runId, { controller, turnId, slot });

  const t0 = performance.now();
  let tFirst: number | null = null;
  let chunkCount = 0;
  let usage: ChatCompletionUsage | null = null;
  let finishReason: ChatFinishReason | undefined;

  // Deltas are buffered and written once per animation frame.
  let buffer = "";
  let frame: number | null = null;
  const flush = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (!buffer) return;
    const text = buffer;
    buffer = "";
    chatState().appendReplyContent(turnId, slot, runId, text);
  };
  const metrics = () =>
    computeReplyMetrics({ t0, tFirst, tEnd: performance.now(), chunkCount }, usage);

  try {
    for await (const chunk of streamChatCompletion(request, controller.signal)) {
      const choice = chunk.choices[0];
      const delta = choice?.delta?.content;
      if (delta) {
        tFirst ??= performance.now();
        chunkCount++;
        buffer += delta;
        frame ??= requestAnimationFrame(() => {
          frame = null;
          flush();
        });
      }
      if (choice?.finish_reason) finishReason = choice.finish_reason;
      if (chunk.usage) usage = chunk.usage;
    }
    flush();
    chatState().updateReply(turnId, slot, runId, {
      status: "done",
      finishReason,
      metrics: metrics(),
    });
  } catch (error) {
    // A superseded run's buffer is dropped by the runId guard; a stopped run keeps its last frame.
    flush();
    const apiError = toApiError(error);
    if (controller.signal.aborted || apiError.code === "CANCELLED") {
      chatState().updateReply(turnId, slot, runId, { status: "stopped", metrics: metrics() });
    } else {
      chatState().updateReply(turnId, slot, runId, {
        status: "error",
        error: { status: apiError.status, code: apiError.code, message: apiError.message },
      });
    }
  } finally {
    releaseRun(runId, controller);
    void context.queryClient.invalidateQueries({ queryKey: queryKeys.session.me() });
    // The charge can trigger Auto Recharge, which adds an invoice.
    void context.queryClient.invalidateQueries({ queryKey: queryKeys.billing.invoices() });
    maybeSave(context, turnId, slot, runId);
  }
}

function streamTurn(context: StreamContext, turnId: string) {
  const turn = chatState().turns.find((item) => item.id === turnId);
  if (!turn) return;
  for (const [slot, reply] of Object.entries(turn.replies) as [CompareSlot, AssistantReply][]) {
    if (reply?.runId) void streamReply(context, turnId, slot, reply.runId);
  }
}

/**
 * Playground chat orchestration (Figma: Playground chat, Compare Models, History).
 * All work happens in event handlers; stores are read with `getState()` inside them.
 */
export function useChatActions(): ChatActions {
  const queryClient = useQueryClient();
  const { guardAction } = useAuthGate();
  const { project } = useActiveProject();
  const { mutateAsync: save } = useSaveConversation();

  const context = (): StreamContext => ({
    queryClient,
    save,
    fallbackProjectId: project?.id ?? null,
  });

  const run = (prompt: string) => {
    const thread = chatState();
    if (selectIsGenerating(thread)) return;
    const slots = activeSlots();
    if (slots.some((slot) => !thread.models[slot])) return;

    const ctx = context();
    const turnId = newId("trn");
    const createdAt = new Date().toISOString();
    const replies: Partial<Record<CompareSlot, AssistantReply>> = {};
    for (const slot of slots) replies[slot] = pendingReply(thread.models[slot]!);

    thread.addTurn(
      { id: turnId, prompt, createdAt, replies },
      {
        conversationId: newId("cnv"),
        title: makeTitle(prompt),
        createdAt,
        projectId: resolveProjectId(ctx),
      },
    );
    uiState().setDraft("");
    uiState().requestComposerFocus();
    streamTurn(ctx, turnId);
    pinTurn(turnId);
  };

  const send = (prompt: string) => {
    const text = prompt.trim();
    if (!text) return;
    const thread = chatState();
    if (selectIsGenerating(thread)) return;
    if (activeSlots().some((slot) => !thread.models[slot])) return;
    guardAction(() => run(text))();
  };

  const stop = () => abortAllStreams();

  const editAndResend = (turnId: string, prompt: string) => {
    const text = prompt.trim();
    const thread = chatState();
    const turn = thread.turns.find((item) => item.id === turnId);
    if (!text || !turn) return;

    abortAllStreams();
    const replies: Partial<Record<CompareSlot, AssistantReply>> = {};
    for (const slot of activeSlots()) {
      const modelId = thread.models[slot] ?? turn.replies[slot]?.modelId;
      if (modelId) replies[slot] = pendingReply(modelId);
    }
    thread.editTurn(turnId, text, replies);
    uiState().setEditingTurnId(null);
    streamTurn(context(), turnId);
    pinTurn(turnId);
    uiState().requestComposerFocus();
  };

  const retry = (turnId: string, slot: CompareSlot) => {
    const thread = chatState();
    if (selectIsGenerating(thread)) return;
    const reply = thread.turns.find((item) => item.id === turnId)?.replies[slot];
    if (!reply) return;
    const fresh = pendingReply(reply.modelId);
    thread.resetReply(turnId, slot, fresh);
    void streamReply(context(), turnId, slot, fresh.runId!);
  };

  const newThread = () => {
    abortAllStreams();
    const { mode, models } = chatState();
    chatState().startThread({ mode, models });
    uiState().setEditingTurnId(null);
    uiState().requestComposerFocus();
  };

  const enterCompare = () => {
    abortAllStreams();
    const prefs = prefsState();
    const a = chatState().models.a ?? prefs.compareModelIds.a;
    let b = prefs.compareModelIds.b;
    if (b === a) b = a === "minimax-m2.7" ? "deepseek-v3.1" : "minimax-m2.7";
    chatState().startThread({ mode: "compare", models: { a, b } });
    prefs.setCompareModelId("a", a);
    prefs.setCompareModelId("b", b);
    uiState().setEditingTurnId(null);
    uiState().requestComposerFocus();
  };

  const exitCompare = (keep: CompareSlot) => {
    abortAllStreams();
    const prefs = prefsState();
    const id = chatState().models[keep] ?? prefs.modelId ?? MODEL_FALLBACK;
    prefs.setModelId(id);
    chatState().startThread({ mode: "single", models: { a: id, b: null } });
    uiState().setEditingTurnId(null);
    uiState().requestComposerFocus();
  };

  const selectModel = (slot: CompareSlot, modelId: string) => {
    const thread = chatState();
    thread.setSlotModel(slot, modelId);
    if (thread.mode === "single") prefsState().setModelId(modelId);
    else prefsState().setCompareModelId(slot, modelId);
  };

  const openConversation = async (id: string) => {
    const ctx = context();
    const projectId = resolveProjectId(ctx);
    if (!projectId) {
      toast.danger("Couldn’t open this chat.");
      return;
    }
    abortAllStreams();
    try {
      const conversation = await queryClient.fetchQuery(conversationQuery(projectId, id));
      chatState().loadConversation(conversation, projectId);
      const prefs = prefsState();
      const { a, b } = conversation.models;
      if (conversation.mode === "single") {
        if (a) prefs.setModelId(a);
      } else {
        if (a) prefs.setCompareModelId("a", a);
        if (b) prefs.setCompareModelId("b", b);
      }
      uiState().setEditingTurnId(null);
      uiState().setHistoryDrawerOpen(false);
      uiState().requestComposerFocus();
    } catch {
      toast.danger("Couldn’t open this chat.");
    }
  };

  return {
    send,
    stop,
    editAndResend,
    retry,
    newThread,
    enterCompare,
    exitCompare,
    selectModel,
    openConversation,
  };
}
