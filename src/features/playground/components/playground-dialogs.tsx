"use client";

import { type ReactNode } from "react";

import { Dialog } from "@/components/ui/dialog";
import {
  type PlaygroundDialog,
  selectDialog,
  selectDialogSession,
  usePlaygroundUIStore,
} from "@/stores/playground-ui-store";

import { SystemPromptDialog } from "./system-prompt-dialog";
import { TuningDialog } from "./tuning-dialog";
import { ViewCodeDialog } from "./view-code-dialog";

/** Returns focus to the opener (⋮ trigger, Code button, “ROLE” button) when it is still on the page. */
function restoreFocus(event: Event) {
  const opener = usePlaygroundUIStore.getState().returnFocusTo;
  if (opener?.isConnected) {
    event.preventDefault();
    opener.focus();
  }
}

const DIALOGS: Record<
  PlaygroundDialog,
  (props: { onCloseAutoFocus: (event: Event) => void }) => ReactNode
> = {
  "system-prompt": SystemPromptDialog,
  tuning: TuningDialog,
  "view-code": ViewCodeDialog,
};

/**
 * The three Playground dialogs (Figma: System Prompt `1398:119437`, Tuning Parameters
 * `1398:119100`, View Code `1398:119330`), opened through the UI store's `openDialog`. Each body
 * is keyed by `dialogSession`, so every open starts from the saved settings.
 */
export function PlaygroundDialogs() {
  const dialog = usePlaygroundUIStore(selectDialog);
  const session = usePlaygroundUIStore(selectDialogSession);
  const closeDialog = usePlaygroundUIStore((state) => state.closeDialog);

  // Bodies stay mounted (Radix renders their content only while open) so the overlay can fade
  // out; the new key on each open resets their form state.
  return (
    <>
      {(Object.keys(DIALOGS) as PlaygroundDialog[]).map((name) => {
        const Body = DIALOGS[name];
        return (
          <Dialog
            key={name}
            open={dialog === name}
            onOpenChange={(open) => {
              if (!open) closeDialog();
            }}
          >
            <Body key={session} onCloseAutoFocus={restoreFocus} />
          </Dialog>
        );
      })}
    </>
  );
}
