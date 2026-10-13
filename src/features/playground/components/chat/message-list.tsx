import { type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { type ConversationTurn } from "@/types/domain";

import { type ChatVariant } from "./markdown-content";

const scrollerClasses: Record<ChatVariant, string> = {
  single: "overflow-x-clip pt-(--thread-pt) [--thread-pt:19px] @max-[60.5rem]:[--thread-pt:60px]",
  compare: "-mr-3.25 pr-3.25 [--thread-pt:0px]",
};

const logClasses: Record<ChatVariant, string> = {
  single: "mx-auto w-full max-w-215 px-4 @min-[57.5rem]:px-0",
  compare: "",
};

/**
 * Scrolling conversation (Figma: "chat sec" / "Scroll" `1398:122240`, compare columns
 * `1398:120029`). The log is silent (`aria-live="off"`, `aria-busy` while generating); the
 * single sr-only status region announces `announcement` instead. The last turn is tall
 * enough that a new prompt can be pinned 92px below the top (`1398:122455`).
 */
export function MessageList({
  turns,
  variant,
  label,
  busy,
  announcement,
  renderPrompt,
  renderReply,
}: {
  turns: ConversationTurn[];
  variant: ChatVariant;
  label: string;
  busy: boolean;
  announcement: string;
  renderPrompt: (turn: ConversationTurn) => ReactNode;
  renderReply: (turn: ConversationTurn) => ReactNode;
}) {
  return (
    <div
      data-thread-scroller=""
      className={cn(
        "[container-type:size] relative min-h-0 flex-1 scrollbar-thin overflow-y-auto",
        scrollerClasses[variant],
      )}
    >
      <div
        role="log"
        aria-live="off"
        aria-busy={busy}
        aria-label={label}
        className={cn("flex flex-col items-end gap-6 pb-3", logClasses[variant])}
      >
        {turns.map((turn, index) => (
          <div
            key={turn.id}
            data-turn={turn.id}
            className={cn(
              "flex w-full flex-col items-end gap-6",
              turns.length > 1 &&
                index === turns.length - 1 &&
                "min-h-[calc(100cqh-104px+var(--thread-pt))]",
            )}
          >
            {renderPrompt(turn)}
            {renderReply(turn)}
          </div>
        ))}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
