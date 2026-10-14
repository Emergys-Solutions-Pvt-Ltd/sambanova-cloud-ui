"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type ApiKeyListParams } from "@/types/domain";

import { listApiKeys } from "../api/api-keys.api";

/**
 * One page of the active project's API keys. Waits until a signed-in user's project is known and
 * keeps the previous page on screen while the next one loads.
 */
export function useApiKeys(params: ApiKeyListParams) {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useQuery({
    queryKey: queryKeys.apiKeys.list(projectId ?? "", params),
    queryFn: ({ signal }) => listApiKeys(projectId!, params, signal),
    enabled: authenticated && Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}
