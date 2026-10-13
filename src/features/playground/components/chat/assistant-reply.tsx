"use client";

import { type AssistantReply as AssistantReplyData } from "@/types/domain";

import { type ChatVariant, MarkdownContent } from "./markdown-content";
import { ReplyError } from "./reply-error";
import { ReplyFooter } from "./reply-footer";
import { ThinkingLoader } from "./thinking-loader";

/**
 * One model's answer to a prompt (Figma: assistant turn `1398:122190`): loader while
 * pending, markdown while streaming, plus a copy / metrics footer once settled, or an
 * error card. Store-free; actions arrive as callbacks.
 */
export function AssistantReply({
  reply,
  variant,
  retryDisabled,
  onRetry,
  onAddCredits,
}: {
  reply: AssistantReplyData;
  variant: ChatVariant;
  /** Disables "Try again" (e.g. while another reply is generating). */
  retryDisabled?: boolean;
  onRetry?: () => void;
  onAddCredits?: (opener: HTMLElement) => void;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-3">
      {reply.status === "pending" && <ThinkingLoader />}
      {(reply.status === "streaming" || reply.status === "done" || reply.status === "stopped") && (
        <MarkdownContent source={reply.content} variant={variant} />
      )}
      {(reply.status === "done" || reply.status === "stopped") && <ReplyFooter reply={reply} />}
      {reply.status === "error" && (
        <ReplyError
          error={reply.error}
          variant={variant}
          retryDisabled={retryDisabled}
          onRetry={onRetry}
          onAddCredits={onAddCredits}
        />
      )}
    </div>
  );
}
