"use client";

import { useState } from "react";

import { useAddCreditsDialogStore } from "@/stores/add-credits-dialog-store";
import {
  selectIsGenerating,
  selectModels,
  selectTurns,
  usePlaygroundChatStore,
} from "@/stores/playground-chat-store";
import { selectEditingTurnId, usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { type CompareSlot, type ConversationTurn } from "@/types/domain";

import { useChatActions } from "../hooks/use-chat-actions";
import { usePlaygroundModels } from "../hooks/use-playground-models";
import { plainText } from "../lib/markdown";
import { AssistantReply } from "./chat/assistant-reply";
import { MessageList } from "./chat/message-list";
import { UserBubble } from "./chat/user-bubble";

/** One entry per turn: `turnId:runId:status` of this slot's reply. */
function replySignature(turns: ConversationTurn[], slot: CompareSlot) {
  return turns.map((turn) => {
    const reply = turn.replies[slot];
    return `${turn.id}:${reply?.runId ?? ""}:${reply?.status ?? ""}`;
  });
}

/**
 * Status-region text for a reply that changed state since the last render. Only live replies
 * (those with a runId) are announced, so reopening a saved chat stays silent. `undefined`
 * keeps the previous announcement (e.g. pending → streaming).
 */
function announcementFor(
  turns: ConversationTurn[],
  slot: CompareSlot,
  previous: readonly string[],
  current: readonly string[],
  modelName: (id: string) => string,
): string | undefined {
  if (turns.length === 0) return "";
  const known = new Set(previous);
  for (let index = turns.length - 1; index >= 0; index--) {
    const reply = turns[index]!.replies[slot];
    if (!reply?.runId || known.has(current[index]!)) continue;
    switch (reply.status) {
      case "pending":
        return "Generating response";
      case "done":
        return `${modelName(reply.modelId)}: response complete. ${plainText(reply.content).slice(0, 200)}`;
      case "stopped":
        return `${modelName(reply.modelId)}: response stopped`;
      case "error":
        // The error card is role="alert".
        return "";
      default:
        return undefined;
    }
  }
  return undefined;
}

/**
 * Conversation for one slot (Figma: Playground chat `1398:122165`, compare column
 * `1398:120084`): wires the chat store, UI store and chat actions into the store-free
 * MessageList / UserBubble / AssistantReply kit.
 */
export function ConversationThread({
  slot,
  variant,
}: {
  slot: CompareSlot;
  variant: "single" | "compare";
}) {
  const turns = usePlaygroundChatStore(selectTurns);
  const models = usePlaygroundChatStore(selectModels);
  const generating = usePlaygroundChatStore(selectIsGenerating);
  const editingTurnId = usePlaygroundUIStore(selectEditingTurnId);
  const setEditingTurnId = usePlaygroundUIStore((state) => state.setEditingTurnId);
  const openAddCredits = useAddCreditsDialogStore((state) => state.openDialog);
  const { editAndResend, retry } = useChatActions();
  const { resolve } = usePlaygroundModels();

  const modelName = (id: string) => resolve(id)?.name ?? id;

  // Announce reply transitions (state derived during render, no effect).
  const signature = replySignature(turns, slot);
  const key = signature.join("|");
  const [tracked, setTracked] = useState(() => ({ key, signature, announcement: "" }));
  if (tracked.key !== key) {
    const next = announcementFor(turns, slot, tracked.signature, signature, modelName);
    setTracked({ key, signature, announcement: next ?? tracked.announcement });
  }

  const slotModel = models[slot];
  const label =
    variant === "single"
      ? "Conversation"
      : `${slotModel ? modelName(slotModel) : "Model"} responses`;

  return (
    <MessageList
      turns={turns}
      variant={variant}
      label={label}
      busy={generating}
      announcement={tracked.announcement}
      renderPrompt={(turn) => (
        <UserBubble
          prompt={turn.prompt}
          variant={variant}
          turnId={turn.id}
          editable={!generating}
          editing={editingTurnId === turn.id}
          onEditStart={() => setEditingTurnId(turn.id)}
          onEditSubmit={(prompt) => editAndResend(turn.id, prompt)}
          onEditCancel={() => setEditingTurnId(null)}
        />
      )}
      renderReply={(turn) => {
        const reply = turn.replies[slot];
        if (!reply) return null;
        return (
          <AssistantReply
            reply={reply}
            variant={variant}
            retryDisabled={generating}
            onRetry={() => retry(turn.id, slot)}
            onAddCredits={() => openAddCredits()}
          />
        );
      }}
    />
  );
}
