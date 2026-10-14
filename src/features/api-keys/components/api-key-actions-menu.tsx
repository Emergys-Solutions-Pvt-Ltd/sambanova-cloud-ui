"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { routes } from "@/config/routes";
import { isApiError } from "@/lib/api";
import { type ApiKeyAction, useApiKeyActionsStore } from "@/stores/api-key-actions-store";
import { toast } from "@/stores/toast-store";
import { type ApiKey } from "@/types/domain";

import { useUpdateApiKey } from "../hooks/use-update-api-key";

/**
 * Row Actions menu (Figma: Dropdown Menu on a key row). View Usage opens the key's usage page; the
 * other items report to the actions store, which opens their dialog.
 */
export function ApiKeyActionsMenu({ apiKey }: { apiKey: ApiKey }) {
  const requestAction = useApiKeyActionsStore((state) => state.requestAction);
  const updateKey = useUpdateApiKey();

  /** Enabling is harmless and reversible, so it happens right away; everything else goes through a dialog. */
  const choose = (action: ApiKeyAction) => {
    if (action !== "toggle-status" || apiKey.status === "active") {
      requestAction(action, apiKey);
      return;
    }
    updateKey.mutate(
      { keyId: apiKey.id, input: { status: "active" } },
      {
        onSuccess: () => toast.success(`${apiKey.name} Enabled Successfully`, 2500),
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Could not enable the key.", 2500),
      },
    );
  };

  const items: { action: ApiKeyAction; label: string; destructive?: boolean }[] = [
    { action: "edit", label: "Edit Key" },
    {
      action: "toggle-status",
      label: apiKey.status === "active" ? "Disable Key" : "Enable Key",
    },
    { action: "rotate", label: "Rotate Key" },
    { action: "delete", label: "Delete Key", destructive: true },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon="dots-vertical" size="xs" aria-label={`Actions for ${apiKey.name}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-43">
        <DropdownMenuItem asChild>
          <Link href={`${routes.apiKeys}/${encodeURIComponent(apiKey.id)}/usage`}>View Usage</Link>
        </DropdownMenuItem>
        {items.map(({ action, label, destructive }) => (
          <DropdownMenuItem key={action} onSelect={() => choose(action)} destructive={destructive}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
