"use client";

import { type ComponentPropsWithRef } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/stores/toast-store";
import { type ConversationSummary } from "@/types/domain";

import { useDeleteConversation } from "../hooks/use-conversations";

type CloseAutoFocusHandler = ComponentPropsWithRef<typeof DialogContent>["onCloseAutoFocus"];

export interface DeleteConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chat to delete; kept while the dialog animates out. */
  conversation: ConversationSummary | null;
  projectId: string | null;
  /** Called after the server confirmed the delete. */
  onDeleted: (id: string) => void;
  onCloseAutoFocus?: CloseAutoFocusHandler;
}

/**
 * Confirms deleting a saved chat from History (no Figma frame; follows the app's
 * "Delete Project" confirmation `1398:115809`).
 */
export function DeleteConversationDialog({
  open,
  onOpenChange,
  conversation,
  projectId,
  onDeleted,
  onCloseAutoFocus,
}: DeleteConversationDialogProps) {
  const { mutate: remove, isPending } = useDeleteConversation();

  const confirm = () => {
    if (!conversation || !projectId) return;
    const { id } = conversation;
    remove(
      { projectId, id },
      {
        onSuccess: () => {
          onDeleted(id);
          onOpenChange(false);
          toast.success("Chat deleted");
        },
        onError: () => toast.danger("Couldn’t delete this chat."),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <DialogContent
        size="sm"
        title="Delete chat?"
        description={`This permanently deletes “${conversation?.title ?? ""}”.`}
        onCloseAutoFocus={onCloseAutoFocus}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="cancel" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" loading={isPending} onClick={confirm}>
              Delete
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
