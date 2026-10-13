"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";

import { useChatActions } from "../hooks/use-chat-actions";

/**
 * "Start a new thread" pencil at the Chat Area's top-right (Figma: Component 55 `601:11859`,
 * tooltip `1441:101020`). Rendered by SingleChat only once the thread has turns.
 */
export function NewThreadButton() {
  const { newThread } = useChatActions();

  return (
    <Tooltip
      content="Start a new thread"
      side="bottom"
      align="end"
      sideOffset={12}
      variant="surface"
    >
      <IconButton
        icon="edit"
        size="chat"
        variant="subtle"
        aria-label="Start a new thread"
        onClick={newThread}
        className="absolute top-4 right-4 z-raised"
      />
    </Tooltip>
  );
}
