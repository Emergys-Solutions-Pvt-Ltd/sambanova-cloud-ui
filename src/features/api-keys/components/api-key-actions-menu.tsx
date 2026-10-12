"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { type ApiKeyAction, useApiKeyActionsStore } from "@/stores/api-key-actions-store";
import { type ApiKey } from "@/types/domain";

/** Row Actions menu (Figma: Dropdown Menu on a key row). Picking an item reports it to the actions store. */
export function ApiKeyActionsMenu({ apiKey }: { apiKey: ApiKey }) {
  const requestAction = useApiKeyActionsStore((state) => state.requestAction);

  const items: { action: ApiKeyAction; label: string; destructive?: boolean }[] = [
    { action: "usage", label: "View Usage" },
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
        {items.map(({ action, label, destructive }) => (
          <DropdownMenuItem
            key={action}
            onSelect={() => requestAction(action, apiKey)}
            destructive={destructive}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
