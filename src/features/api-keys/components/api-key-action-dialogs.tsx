"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NameDialog } from "@/components/ui/name-dialog";
import { useApiKeyActionsStore } from "@/stores/api-key-actions-store";
import { toast } from "@/stores/toast-store";

import { useRotateApiKey, useDeleteApiKey } from "../hooks/use-rotate-and-delete-api-key";
import { useUpdateApiKey } from "../hooks/use-update-api-key";
import { API_KEY_NAME_MAX, apiKeyNameSchema } from "../schemas";
import { RotateApiKeyDialog } from "./rotate-api-key-dialog";

const TOAST_MS = 2500;

// The list is paginated, so duplicate names are caught by the API (409), not by the form.
const nameSchema = apiKeyNameSchema([]);

/**
 * Dialogs opened from a key's Actions menu: Edit API key (rename), Disable Key, Rotate Key and
 * Delete Key. They follow `useApiKeyActionsStore`; View Usage is built later.
 */
export function ApiKeyActionDialogs() {
  const request = useApiKeyActionsStore((state) => state.request);
  const clear = useApiKeyActionsStore((state) => state.clear);
  const updateKey = useUpdateApiKey();
  const rotateKey = useRotateApiKey();
  const deleteKey = useDeleteApiKey();

  // Keep showing the last request while the dialog fades out after `clear()`.
  const [shown, setShown] = useState(request);
  if (request && request !== shown) setShown(request);

  const key = shown?.key;
  const editOpen = request?.action === "edit";
  const disableOpen = request?.action === "toggle-status" && request.key.status === "active";
  const rotateOpen = request?.action === "rotate";
  const deleteOpen = request?.action === "delete";

  return (
    <>
      <NameDialog
        open={editOpen}
        onOpenChange={(next) => !next && clear()}
        title="Edit API key"
        label="Key Name"
        maxLength={API_KEY_NAME_MAX}
        submitLabel="Save"
        initialName={key?.name ?? ""}
        requireChange
        schema={nameSchema}
        onSubmit={async (name) => {
          await updateKey.mutateAsync({ keyId: key!.id, input: { name } });
          clear();
          toast.success("Key Name Changed Successfully", TOAST_MS);
        }}
      />

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={(next) => !next && clear()}
        title="Disable Key"
        description={`The API key '${key?.name ?? ""}' will be disabled and can no longer authenticate API requests. You can re-enable it anytime.`}
        onConfirm={async () => {
          await updateKey.mutateAsync({ keyId: key!.id, input: { status: "disabled" } });
          clear();
          toast.success(`${key!.name} Disabled Successfully`, TOAST_MS);
        }}
      />

      <RotateApiKeyDialog
        apiKey={key}
        open={rotateOpen}
        onOpenChange={(next) => !next && clear()}
        onRotate={async (gracePeriod) => {
          await rotateKey.mutateAsync({ keyId: key!.id, input: { gracePeriod } });
          clear();
          toast.success(`${key!.name} Rotated Successfully`, TOAST_MS);
        }}
      />

      {/* No Delete Key design exists in Figma: same layout as Disable Key with the danger tone. */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(next) => !next && clear()}
        tone="danger"
        title="Delete Key"
        confirmLabel="Delete"
        description={`The API key '${key?.name ?? ""}' will be permanently deleted. Applications using it will stop working immediately, and this can’t be undone.`}
        onConfirm={async () => {
          await deleteKey.mutateAsync(key!.id);
          clear();
          toast.success(`${key!.name} Deleted Successfully`, TOAST_MS);
        }}
      />
    </>
  );
}
