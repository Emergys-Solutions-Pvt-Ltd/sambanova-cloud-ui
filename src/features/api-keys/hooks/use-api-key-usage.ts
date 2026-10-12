"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type ApiKeyRequestsParams, type UsageRangeParams } from "@/types/domain";

import { getApiKey, getApiKeyUsage, listApiKeyRequests } from "../api/api-key-usage.api";

/** Shared by the three queries: wait until a signed-in user's project is known. */
function useUsageScope() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const { project } = useActiveProject();
  return { projectId: project?.id, enabled: authenticated && Boolean(project) };
}

/** The key shown on the usage page (name, status, creator, dates). */
export function useApiKey(keyId: string) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.detail(projectId ?? "", keyId),
    queryFn: ({ signal }) => getApiKey(projectId!, keyId, signal),
    enabled,
  });
}

/** Totals for the four stat cards; keeps the previous numbers on screen while a new range loads. */
export function useApiKeyUsage(keyId: string, range: UsageRangeParams) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.usage(projectId ?? "", keyId, range),
    queryFn: ({ signal }) => getApiKeyUsage(projectId!, keyId, range, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** One page of the request log; keeps the previous page on screen while the next one loads. */
export function useApiKeyRequests(keyId: string, params: ApiKeyRequestsParams) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.requests(projectId ?? "", keyId, params),
    queryFn: ({ signal }) => listApiKeyRequests(projectId!, keyId, params, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}
