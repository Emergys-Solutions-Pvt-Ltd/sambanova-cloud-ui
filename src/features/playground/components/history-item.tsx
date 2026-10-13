"use client";

import { type KeyboardEvent, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon/icon";
import { useActiveProject } from "@/features/projects";
import { usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { type ConversationSummary } from "@/types/domain";

import { useRenameConversation } from "../hooks/use-conversations";

/** Longest name the rename endpoint accepts. */
const MAX_TITLE_LENGTH = 80;

type MenuAction = "rename" | "delete";

export interface HistoryItemProps {
  item: ConversationSummary;
  /** The conversation open in the chat area. */
  active: boolean;
  /** Reopens the conversation (called for inactive items only). */
  onOpen: (id: string) => void;
  /** Asks for delete confirmation; called after the ⋮ menu has closed and focus is back on its trigger. */
  onRequestDelete: (item: ConversationSummary) => void;
}

/**
 * One saved chat in the History panel (Figma: History item `601:12289`, "Compared" `1398:119077`,
 * item menu `1004:58463`). Title opens the chat; ⋮ offers Rename (inline) and Delete.
 */
export function HistoryItem({ item, active, onOpen, onRequestDelete }: HistoryItemProps) {
  const projectId = useActiveProject().project?.id;
  const { mutate: rename } = useRenameConversation();
  const [renaming, setRenaming] = useState(false);
  // Menu choice, acted on once the menu has closed (so focus handling never fights Radix).
  const pendingAction = useRef<MenuAction | null>(null);
  // Set when rename ends; guards the blur that follows Enter / Escape.
  const renameSettled = useRef(false);
  // Moves focus back to the title once the inline input is gone.
  const restoreTitleFocus = useRef(false);

  const startRename = () => {
    renameSettled.current = false;
    setRenaming(true);
  };

  const finishRename = (value: string | null) => {
    if (renameSettled.current) return;
    renameSettled.current = true;
    setRenaming(false);
    const title = value?.trim() ?? "";
    if (!title || title === item.title || !projectId) return;
    rename({ projectId, id: item.id, input: { title } });
    const chat = usePlaygroundChatStore.getState();
    if (chat.conversationId === item.id) chat.setTitle(title);
  };

  const onRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      restoreTitleFocus.current = true;
      finishRename(event.currentTarget.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      restoreTitleFocus.current = true;
      finishRename(null);
    }
  };

  const compared = item.mode === "compare";

  return (
    <li
      aria-current={active || undefined}
      className="group relative flex flex-col items-start gap-2.5 rounded-md border border-subtle p-3 transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-history-item-hover has-[[data-state=open]]:bg-history-item-hover aria-[current=true]:bg-history-item-hover motion-reduce:transition-none"
    >
      <div className="flex w-full items-center gap-3">
        {renaming ? (
          <input
            ref={(el) => {
              if (!el) return;
              el.focus();
              el.select();
            }}
            type="text"
            aria-label="Chat name"
            defaultValue={item.title}
            maxLength={MAX_TITLE_LENGTH}
            onKeyDown={onRenameKeyDown}
            onBlur={(event) => finishRename(event.currentTarget.value)}
            className="min-w-0 flex-1 border-b border-focus bg-transparent text-caption font-normal text-primary outline-none"
          />
        ) : (
          <button
            ref={(el) => {
              if (el && restoreTitleFocus.current) {
                restoreTitleFocus.current = false;
                el.focus();
              }
            }}
            type="button"
            title={item.title}
            onClick={() => {
              if (!active) onOpen(item.id);
            }}
            className="line-clamp-2 min-w-0 flex-1 text-left text-caption font-normal break-words text-secondary after:absolute after:inset-0 after:rounded-md"
          >
            {item.title}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${item.title}`}
            className="relative z-raised inline-flex size-4 shrink-0 items-center justify-center rounded-xs text-muted"
          >
            <Icon name="more-vertical" size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            surface="compact"
            align="end"
            sideOffset={4}
            onCloseAutoFocus={(event) => {
              const action = pendingAction.current;
              pendingAction.current = null;
              if (action === "rename") {
                // The inline input takes focus itself.
                event.preventDefault();
                startRename();
              } else if (action === "delete") {
                // Focus returns to ⋮ first, so the dialog restores it on Cancel.
                onRequestDelete(item);
              }
            }}
          >
            <DropdownMenuItem variant="compact" onSelect={() => (pendingAction.current = "rename")}>
              <Icon name="pencil" size={18} />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="compact" onSelect={() => (pendingAction.current = "delete")}>
              <Icon name="trash" size={18} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {compared && <span className="text-micro font-medium text-compared italic">Compared</span>}
    </li>
  );
}
