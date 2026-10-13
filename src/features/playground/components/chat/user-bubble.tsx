"use client";

import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

import { type ChatVariant } from "./markdown-content";

const bubbleWidth = {
  single: "max-w-[min(calc(var(--spacing)*153),85%)]",
  compare: "max-w-[93.3%]",
} as const;

const formWidth = {
  single: "w-[min(calc(var(--spacing)*153),85%)]",
  compare: "w-[93.3%]",
} as const;

function EditPromptForm({
  prompt,
  variant,
  autoFocus,
  onSubmit,
  onCancel,
}: {
  prompt: string;
  variant: ChatVariant;
  autoFocus: boolean;
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(prompt);
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && trimmed !== prompt.trim();

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (canSend) onSubmit(trimmed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-2", formWidth[variant])}>
      <div className="rounded-lg rounded-br-none border border-pill bg-prompt-bubble p-4">
        <Textarea
          aria-label="Edit prompt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          ref={(element) => {
            if (!element || !autoFocus || element === document.activeElement) return;
            element.focus();
            element.setSelectionRange(element.value.length, element.value.length);
          }}
          rows={1}
          className="max-h-60 text-left text-body"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="cancel" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!canSend}>
          Send
        </Button>
      </div>
    </form>
  );
}

/**
 * The user's prompt (Figma: prompt bubble `1398:122244`, compare `1398:120084`):
 * right-aligned, tail at the bottom right. Editable inline: Enter resends, Escape cancels.
 * `data-turn-bubble` is the pin target for scrolling a new prompt into place.
 */
export function UserBubble({
  prompt,
  variant,
  turnId,
  editable,
  editing,
  onEditStart,
  onEditSubmit,
  onEditCancel,
}: {
  prompt: string;
  variant: ChatVariant;
  turnId: string;
  editable: boolean;
  editing: boolean;
  onEditStart: () => void;
  onEditSubmit: (prompt: string) => void;
  onEditCancel: () => void;
}) {
  // Several columns may show the same turn: only the one whose pencil was used takes focus,
  // and focus returns to that pencil when the edit is cancelled.
  const [ownsEdit, setOwnsEdit] = useState(false);
  const refocusPencil = useRef(false);
  // The edit ended elsewhere (other column, new thread): forget that it started here.
  if (!editing && ownsEdit) setOwnsEdit(false);

  const cancel = () => {
    refocusPencil.current = ownsEdit;
    setOwnsEdit(false);
    onEditCancel();
  };

  return (
    <div
      data-turn-bubble={turnId}
      className="group/bubble relative flex w-full items-start justify-end gap-2"
    >
      {editing ? (
        <EditPromptForm
          prompt={prompt}
          variant={variant}
          autoFocus={ownsEdit}
          onSubmit={(value) => {
            setOwnsEdit(false);
            onEditSubmit(value);
          }}
          onCancel={cancel}
        />
      ) : (
        <>
          {editable && (
            <IconButton
              ref={(element) => {
                if (element && refocusPencil.current) {
                  refocusPencil.current = false;
                  element.focus();
                }
              }}
              icon="pencil"
              size="sm"
              variant="subtle"
              aria-label="Edit prompt"
              onClick={() => {
                setOwnsEdit(true);
                onEditStart();
              }}
              className="opacity-0 group-focus-within/bubble:opacity-100 group-hover/bubble:opacity-100 pointer-coarse:opacity-100"
            />
          )}
          <div
            className={cn(
              "inline-flex min-w-0 rounded-lg rounded-br-none bg-prompt-bubble p-4",
              bubbleWidth[variant],
            )}
          >
            <p className="min-w-0 text-right text-body break-words whitespace-pre-wrap text-prompt-bubble">
              {prompt}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
