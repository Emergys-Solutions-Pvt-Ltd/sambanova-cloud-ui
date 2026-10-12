"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { type ApiKey, type CreateApiKeyInput } from "@/types/domain";

import { createApiKey } from "../api/api-keys.api";

/** Creates a key in the active project and adds it to the cached list. */
export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => createApiKey(projectId!, input),
    onSuccess: ({ secret: _secret, ...key }) => {
      queryClient.setQueryData<ApiKey[]>(queryKeys.apiKeys(projectId!), (current) => [
        key,
        ...(current ?? []),
      ]);
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys(projectId!) });
    },
  });
}
