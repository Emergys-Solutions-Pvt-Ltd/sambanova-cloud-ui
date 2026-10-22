"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type ApiKeyUsageRowsParams, type UsageRangeParams } from "@/types/domain";

import { getProjectUsage, getProjectUsageSeries, listProjectKeyUsage } from "../api/usage.api";

/** Shared by the three queries: wait until a signed-in user's project is known. */
function useUsageScope() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const { project } = useActiveProject();
  return { projectId: project?.id, enabled: authenticated && Boolean(project) };
}

/** Totals for the four stat cards; keeps the previous numbers on screen while a new range loads. */
export function useProjectUsage(range: UsageRangeParams) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.projectUsage(projectId ?? "", range),
    queryFn: ({ signal }) => getProjectUsage(projectId!, range, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** Daily tokens for the chart; keeps the previous lines on screen while a new range loads. */
export function useProjectUsageSeries(range: UsageRangeParams) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.projectUsageSeries(projectId ?? "", range),
    queryFn: ({ signal }) => getProjectUsageSeries(projectId!, range, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** One page of keys with their usage; keeps the previous page on screen while the next one loads. */
export function useProjectKeyUsage(params: ApiKeyUsageRowsParams) {
  const { projectId, enabled } = useUsageScope();

  return useQuery({
    queryKey: queryKeys.apiKeys.projectKeyUsage(projectId ?? "", params),
    queryFn: ({ signal }) => listProjectKeyUsage(projectId!, params, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}
