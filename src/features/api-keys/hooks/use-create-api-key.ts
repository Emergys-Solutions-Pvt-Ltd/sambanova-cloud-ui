"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { type CreateApiKeyInput } from "@/types/domain";

import { createApiKey } from "../api/api-keys.api";

/** Creates a key in the active project, then reloads every cached page of its list. */
export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => createApiKey(projectId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId!) }),
  });
}
