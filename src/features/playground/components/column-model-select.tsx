"use client";

import { Icon } from "@/components/ui/icon/icon";
import { OptionMenu } from "@/components/ui/option-menu";
import { selectModels, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { type CompareSlot } from "@/types/domain";

import { useChatActions } from "../hooks/use-chat-actions";
import { usePlaygroundModels } from "../hooks/use-playground-models";

const SLOT_LABELS: Record<CompareSlot, string> = { a: "Model A", b: "Model B" };

/**
 * Per-column model select of the compare view (Figma: `1398:119746` / `1398:119731`, menus
 * `1398:119809` / `1398:119919`): 262px bordered trigger, grouped menu 5px below at the trigger's
 * width. The other column's model stays selectable (decision C4).
 */
export function ColumnModelSelect({ slot }: { slot: CompareSlot }) {
  const modelId = usePlaygroundChatStore((state) => selectModels(state)[slot]);
  const { groups, resolve } = usePlaygroundModels();
  const { selectModel } = useChatActions();
  const name = resolve(modelId)?.name ?? "Select Model";

  return (
    <OptionMenu
      value={modelId}
      onValueChange={(id) => selectModel(slot, id)}
      groups={groups}
      aria-label={`${SLOT_LABELS[slot]}: ${name}`}
      surface="bordered"
      side="bottom"
      align="start"
      sideOffset={5}
      matchTriggerWidth
      trigger={
        <button
          type="button"
          className="flex h-9.25 w-full max-w-65.5 min-w-0 items-center gap-2.5 rounded-md border border-hairline bg-input px-4 text-left"
        >
          <span className="flex-1 truncate text-body text-primary">{name}</span>
          <Icon name="chevron-down" size={16} strokeWidth={1.5} className="text-primary" />
        </button>
      }
    />
  );
}
