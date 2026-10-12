"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NameDialog } from "@/components/ui/name-dialog";
import { useApiKeyActionsStore } from "@/stores/api-key-actions-store";
import { toast } from "@/stores/toast-store";

import { useUpdateApiKey } from "../hooks/use-update-api-key";
import { API_KEY_NAME_MAX, apiKeyNameSchema } from "../schemas";

const TOAST_MS = 2500;

// The list is paginated, so duplicate names are caught by the API (409), not by the form.
const nameSchema = apiKeyNameSchema([]);

/**
 * Dialogs opened from a key's Actions menu: Edit API key (rename) and Disable Key. They follow
 * `useApiKeyActionsStore`; the other actions (usage, rotate, delete) are built later.
 */
export function ApiKeyActionDialogs() {
  const request = useApiKeyActionsStore((state) => state.request);
  const clear = useApiKeyActionsStore((state) => state.clear);
  const updateKey = useUpdateApiKey();

  // Keep showing the last request while the dialog fades out after `clear()`.
  const [shown, setShown] = useState(request);
  if (request && request !== shown) setShown(request);

  const key = shown?.key;
  const editOpen = request?.action === "edit";
  const disableOpen = request?.action === "toggle-status" && request.key.status === "active";

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
    </>
  );
}
