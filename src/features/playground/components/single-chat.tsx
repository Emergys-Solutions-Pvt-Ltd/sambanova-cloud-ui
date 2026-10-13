"use client";

import { Composer } from "./composer";
import { ConversationThread } from "./conversation-thread";
import { NewThreadButton } from "./new-thread-button";

/**
 * Single-model conversation (Figma: Answer received `1398:122165`, Prompt Added B `1398:122455`):
 * the new-thread pencil, the scrolling thread and the docked composer.
 */
export function SingleChat() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <NewThreadButton />
      <ConversationThread slot="a" variant="single" />
      <div className="mx-auto w-full max-w-215 shrink-0 px-4 pt-3 pb-5 @min-[57.5rem]:px-0">
        <Composer placement="dock" />
      </div>
    </div>
  );
}
