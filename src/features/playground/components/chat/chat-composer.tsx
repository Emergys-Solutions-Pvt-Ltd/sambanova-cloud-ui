"use client";

import { type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Textarea } from "@/components/ui/textarea";

export interface ChatComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Fires on Enter / send whenever `value.trim()` is non-empty; the container decides what it means. */
  onSubmit: () => void;
  onStop: () => void;
  /** Swaps send for stop; Escape in the textarea stops. */
  generating: boolean;
  /** Enables the send button. */
  canSend: boolean;
  /** Left toolbar slot (Figma: "+" and mic). */
  toolbarStart?: ReactNode;
  /** Right toolbar slot, before the send button (Figma: model change / compare label). */
  toolbarEnd?: ReactNode;
  textareaRef?: Ref<HTMLTextAreaElement>;
  placeholder?: string;
  /** Accessible name of the textarea. */
  label?: string;
}

/**
 * Store-free chat composer: auto-growing textarea, toolbar slots and send / stop
 * (Figma: composer "Sample" `620:12796`, Default / Active variants). Enter sends,
 * Shift+Enter adds a line, IME composition is respected, Escape stops a generation.
 */
export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  generating,
  canSend,
  toolbarStart,
  toolbarEnd,
  textareaRef,
  placeholder = "Ask Anything....",
  label = "Message",
}: ChatComposerProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim()) onSubmit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim()) onSubmit();
      return;
    }
    if (event.key === "Escape" && generating) {
      event.preventDefault();
      onStop();
    }
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="group/composer flex min-h-32.5 w-full flex-col justify-between gap-4 overflow-hidden rounded-composer border border-composer bg-composer p-4 transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-pill has-[textarea:not(:placeholder-shown)]:border-pill motion-reduce:transition-none">
        <Textarea
          ref={textareaRef}
          aria-label={label}
          placeholder={placeholder}
          rows={2}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="max-h-36 min-h-10.5 text-body leading-5 placeholder:leading-[normal]"
        />
        {/* No gap: in Figma only the 12px pr-3 separates the model picker from send. */}
        <div className="flex items-end justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-3">
            <div className="flex items-center gap-1.5">{toolbarStart}</div>
            {toolbarEnd}
          </div>
          {generating ? (
            <IconButton
              icon="stop"
              size="send"
              variant="send"
              aria-label="Stop generating"
              onClick={onStop}
            />
          ) : (
            <IconButton
              type="submit"
              icon="arrow-up"
              size="send"
              variant="send"
              aria-label="Send message"
              disabled={!canSend}
            />
          )}
        </div>
      </div>
    </form>
  );
}
