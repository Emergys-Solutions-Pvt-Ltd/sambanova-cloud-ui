"use client";

import { useMemo } from "react";

import { NameDialog } from "@/components/ui/name-dialog";
import { useCreateApiKeyDialogStore } from "@/stores/create-api-key-dialog-store";
import { toast } from "@/stores/toast-store";

import { useApiKeys } from "../hooks/use-api-keys";
import { useCreateApiKey } from "../hooks/use-create-api-key";
import { API_KEY_NAME_MAX, apiKeyNameSchema } from "../schemas";

/** "Create API key" modal (Figma: Create API key). Opened by the API Keys page buttons. */
export function CreateApiKeyDialog() {
  const open = useCreateApiKeyDialogStore((state) => state.open);
  const close = useCreateApiKeyDialogStore((state) => state.close);
  const keys = useApiKeys();
  const createKey = useCreateApiKey();
  const schema = useMemo(
    () => apiKeyNameSchema((keys.data ?? []).map((key) => key.name)),
    [keys.data],
  );

  return (
    <NameDialog
      open={open}
      onOpenChange={(next) => !next && close()}
      title="Create API key"
      label="Name"
      placeholder="eg. Deployment key"
      maxLength={API_KEY_NAME_MAX}
      submitLabel="Create API Key"
      schema={schema}
      onSubmit={async (name) => {
        const key = await createKey.mutateAsync({ name });
        close();
        toast.success(`${key.name} API Key Created Successfully`, 2500);
      }}
    />
  );
}
