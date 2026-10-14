"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { type UpdateApiKeyInput } from "@/types/domain";

import { updateApiKey } from "../api/api-keys.api";

/** Renames, disables or enables a key of the active project, then reloads the cached pages of its list. */
export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useMutation({
    mutationFn: ({ keyId, input }: { keyId: string; input: UpdateApiKeyInput }) =>
      updateApiKey(projectId!, keyId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId!) }),
  });
}
