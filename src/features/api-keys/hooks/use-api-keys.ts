"use client";

import { useQuery } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";

import { listApiKeys } from "../api/api-keys.api";

/** API keys of the active project. Waits until a signed-in user's project is known. */
export function useApiKeys() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const { project } = useActiveProject();
  const projectId = project?.id;

  return useQuery({
    queryKey: queryKeys.apiKeys(projectId ?? ""),
    queryFn: ({ signal }) => listApiKeys(projectId!, signal),
    enabled: authenticated && Boolean(projectId),
  });
}
