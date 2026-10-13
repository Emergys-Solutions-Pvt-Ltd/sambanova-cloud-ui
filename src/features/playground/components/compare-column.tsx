"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { type CompareSlot } from "@/types/domain";

import { useChatActions } from "../hooks/use-chat-actions";
import { ColumnModelSelect } from "./column-model-select";
import { ConversationThread } from "./conversation-thread";

const SLOT_LABELS: Record<CompareSlot, string> = { a: "Model A", b: "Model B" };

/**
 * One compare column (Figma: Compare `1398:119699`, header detail `1398:120073`): label, model
 * select, new-thread and close buttons, then the column's own scrolling thread. Close exits to a
 * single chat with the other column's model (decision C2).
 */
export function CompareColumn({ slot }: { slot: CompareSlot }) {
  const { newThread, exitCompare } = useChatActions();
  const label = SLOT_LABELS[slot];
  const other: CompareSlot = slot === "a" ? "b" : "a";

  return (
    <section aria-label={label} className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9.25 shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-body text-primary">{label}</span>
          <ColumnModelSelect slot={slot} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip
            content="Start a new thread"
            side="bottom"
            align="center"
            sideOffset={6}
            variant="surface"
          >
            <IconButton
              icon="edit"
              size="chat"
              variant="subtle"
              aria-label="Start a new thread"
              onClick={newThread}
            />
          </Tooltip>
          <Tooltip
            content="Close compare view"
            side="bottom"
            align="center"
            sideOffset={6}
            variant="surface"
          >
            <IconButton
              icon="close"
              size="chat"
              variant="subtle"
              iconStrokeWidth={1.25}
              aria-label={`Close compare view and keep ${SLOT_LABELS[other]}`}
              onClick={() => exitCompare(other)}
            />
          </Tooltip>
        </div>
      </div>
      <div className="mt-8.5 flex min-h-0 flex-1 flex-col">
        <ConversationThread slot={slot} variant="compare" />
      </div>
    </section>
  );
}
