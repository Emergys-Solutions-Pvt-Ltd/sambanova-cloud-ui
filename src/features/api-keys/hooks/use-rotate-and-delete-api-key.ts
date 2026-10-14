"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { type RotateApiKeyInput } from "@/types/domain";

import { deleteApiKey, rotateApiKey } from "../api/api-keys.api";

/** Generates a new secret for a key of the active project, then reloads its cached list pages. */
export function useRotateApiKey() {
  const queryClient = useQueryClient();
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useMutation({
    mutationFn: ({ keyId, input }: { keyId: string; input: RotateApiKeyInput }) =>
      rotateApiKey(projectId!, keyId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId!) }),
  });
}

/** Permanently deletes a key of the active project, then reloads its cached list pages. */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useMutation({
    mutationFn: (keyId: string) => deleteApiKey(projectId!, keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId!) }),
  });
}
