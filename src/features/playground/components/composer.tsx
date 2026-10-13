"use client";

import { useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import {
  selectIsGenerating,
  selectMode,
  selectModels,
  usePlaygroundChatStore,
} from "@/stores/playground-chat-store";
import { selectDraft, usePlaygroundUIStore } from "@/stores/playground-ui-store";

import { useChatActions } from "../hooks/use-chat-actions";
import { ChatComposer } from "./chat/chat-composer";
import { CompareSummary } from "./compare-summary";
import { ModelPicker } from "./model-picker";

type UIState = ReturnType<typeof usePlaygroundUIStore.getState>;

export interface ComposerProps {
  /** hero = centred in the empty state (max 860px); dock = inside the parent's dock strip. */
  placement: "hero" | "dock";
}

/**
 * Playground composer container (Figma: composer `620:12796` in Normal Chat `1398:122055`,
 * Prompt Added `1398:122110`, Compare `1398:119699`): wires the draft, model picker or compare
 * label, send / stop and the pending focus request into the store-free `ChatComposer`.
 */
export function Composer({ placement }: ComposerProps) {
  const draft = usePlaygroundUIStore(selectDraft);
  const setDraft = usePlaygroundUIStore((state) => state.setDraft);
  const mode = usePlaygroundChatStore(selectMode);
  const models = usePlaygroundChatStore(selectModels);
  const generating = usePlaygroundChatStore(selectIsGenerating);
  const { send, stop } = useChatActions();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Honour focus requests made before or after this composer mounted (hero → dock swap, etc.).
  // Checked a frame later: the request usually comes with a layout swap, and the composer
  // being replaced is still subscribed when the store changes. Only a mounted one may consume it.
  useEffect(() => {
    let frame = 0;
    const run = (state: UIState) => {
      if (!state.composerFocusPending) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea?.isConnected || !usePlaygroundUIStore.getState().composerFocusPending) return;
        textarea.focus();
        usePlaygroundUIStore.getState().consumeComposerFocus();
      });
    };
    run(usePlaygroundUIStore.getState());
    const unsubscribe = usePlaygroundUIStore.subscribe(run);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  const needsModel = mode === "single" && models.a === null;
  const canSend = draft.trim().length > 0 && !needsModel;

  const submit = () => {
    if (needsModel) {
      setMenuOpen(true);
      setAnnouncement("Select a model first");
      return;
    }
    send(draft);
  };

  const onMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
    if (!open) setAnnouncement("");
  };

  return (
    <div className={cn("w-full", placement === "hero" && "mx-auto max-w-215")}>
      <ChatComposer
        value={draft}
        onValueChange={setDraft}
        onSubmit={submit}
        onStop={stop}
        generating={generating}
        canSend={canSend}
        textareaRef={textareaRef}
        toolbarStart={
          <>
            <Tooltip content="Attachments are coming soon" side="top" variant="surface">
              <IconButton
                icon="plus"
                iconStrokeWidth={1}
                size="composer"
                variant="composer"
                aria-label="Add attachment"
                aria-disabled="true"
              />
            </Tooltip>
            <Tooltip content="Voice input is coming soon" side="top" variant="surface">
              <IconButton
                icon="microphone"
                size="composer"
                variant="composer"
                aria-label="Voice input"
                aria-disabled="true"
              />
            </Tooltip>
          </>
        }
        toolbarEnd={
          mode === "compare" ? (
            <CompareSummary />
          ) : (
            <ModelPicker open={menuOpen} onOpenChange={onMenuOpenChange} />
          )
        }
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
