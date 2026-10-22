import { apiClient, type PaginatedResponse } from "@/lib/api";
import {
  type ApiKeyUsageRow,
  type ApiKeyUsageRowsParams,
  type ApiKeyUsageSeries,
  type ApiKeyUsageStats,
  type UsageRangeParams,
} from "@/types/domain";

const usagePath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/usage`;

/** Request, token and spend totals of all the project's keys over the day range. */
export async function getProjectUsage(
  projectId: string,
  range: UsageRangeParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<ApiKeyUsageStats>(usagePath(projectId), {
    params: range,
    signal,
  });
  return data;
}

/** Daily token usage of all the project's keys over the day range, for the chart. */
export async function getProjectUsageSeries(
  projectId: string,
  range: UsageRangeParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<ApiKeyUsageSeries>(`${usagePath(projectId)}/series`, {
    params: range,
    signal,
  });
  return data;
}

/** One page of the project's keys, each with its requests and spend in the day range. */
export async function listProjectKeyUsage(
  projectId: string,
  params: ApiKeyUsageRowsParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ApiKeyUsageRow>>(
    `${usagePath(projectId)}/api-keys`,
    { params, signal },
  );
  return data;
}
