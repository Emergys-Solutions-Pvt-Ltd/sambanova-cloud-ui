"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea";
import { selectSystemPrompt, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { toast } from "@/stores/toast-store";
import { type QuickRoleId } from "@/types/domain";

import { getRole, matchRole, roleAutofill } from "../lib/roles";
import { QuickSelectCards } from "./quick-select-cards";

export interface PlaygroundDialogBodyProps {
  /** Restores focus to the opener stored in the UI store (passed by `PlaygroundDialogs`). */
  onCloseAutoFocus: (event: Event) => void;
}

/**
 * System Prompt dialog (Figma: `1398:119437` empty, `1398:119544` Developer selected).
 * A card overwrites the prompt with its auto-fill; typing keeps a card checked only while the
 * text still equals its auto-fill. Saving an empty prompt clears it.
 */
export function SystemPromptDialog({ onCloseAutoFocus }: PlaygroundDialogBodyProps) {
  const saved = usePlaygroundPrefsStore(selectSystemPrompt);
  const setSystemPrompt = usePlaygroundPrefsStore((state) => state.setSystemPrompt);
  const closeDialog = usePlaygroundUIStore((state) => state.closeDialog);

  const [text, setText] = useState(saved.prompt);
  const [roleId, setRoleId] = useState<QuickRoleId | null>(
    () => matchRole(saved.prompt)?.id ?? null,
  );
  const cardsRef = useRef<HTMLDivElement>(null);
  const fieldId = useId();

  const trimmed = text.trim();
  const dirty = trimmed !== saved.prompt;

  const chooseRole = (id: QuickRoleId) => {
    const role = getRole(id);
    if (!role) return;
    setRoleId(id);
    setText(roleAutofill(role));
  };

  const save = () => {
    setSystemPrompt({ roleId: matchRole(trimmed)?.id ?? null, prompt: trimmed });
    closeDialog();
    toast.success("System prompt saved");
  };

  return (
    <DialogContent
      size="lg"
      variant="subtle"
      title="System Prompt"
      description="Define how the assistant should behave and respond this session."
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        const radios = cardsRef.current?.querySelectorAll<HTMLInputElement>("input[type=radio]");
        const target = Array.from(radios ?? []).find((radio) => radio.checked) ?? radios?.[0];
        target?.focus();
      }}
      onCloseAutoFocus={onCloseAutoFocus}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="cancel" className="h-9.25 min-w-22.5">
              Cancel
            </Button>
          </DialogClose>
          <Button className="min-w-23" disabled={!dirty} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      {/* The subtle header already ends 24px below the description; pb-1 + the footer gap = 24. */}
      <div className="flex flex-col gap-3 pb-1">
        <p className="text-body-lg font-semibold text-primary">Quick Select</p>
        <div ref={cardsRef}>
          <QuickSelectCards value={roleId} onValueChange={chooseRole} />
        </div>
        <FormField label="System Prompt" htmlFor={fieldId}>
          <TextareaField
            id={fieldId}
            bordered="input"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setRoleId(matchRole(event.target.value)?.id ?? null);
            }}
            placeholder="Enter the system prompt or select a quick option to auto-fill"
            // placeholder:text-subtle sorts after the field's placeholder:text-muted, so it wins.
            className="h-26 px-4 py-2 placeholder:text-subtle"
          />
          <p className="text-body text-subtle">
            <strong className="font-semibold text-primary">Note:</strong>{" "}
            <em className="italic">System Prompt changes will be applied for all the sessions.</em>
          </p>
        </FormField>
      </div>
    </DialogContent>
  );
}
