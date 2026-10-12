import { apiClient, type PaginatedResponse } from "@/lib/api";
import {
  type ApiKeyDetail,
  type ApiKeyRequestLog,
  type ApiKeyRequestsParams,
  type ApiKeyUsageStats,
  type UsageRangeParams,
} from "@/types/domain";

const keyPath = (projectId: string, keyId: string) =>
  `/projects/${encodeURIComponent(projectId)}/api-keys/${encodeURIComponent(keyId)}`;

/** One key with its creator, for the header of the usage page. */
export async function getApiKey(projectId: string, keyId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiKeyDetail>(keyPath(projectId, keyId), { signal });
  return data;
}

/** Request, token and spend totals of the key over the day range. */
export async function getApiKeyUsage(
  projectId: string,
  keyId: string,
  range: UsageRangeParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<ApiKeyUsageStats>(`${keyPath(projectId, keyId)}/usage`, {
    params: range,
    signal,
  });
  return data;
}

/** One page of the key's requests in the day range, newest first. */
export async function listApiKeyRequests(
  projectId: string,
  keyId: string,
  params: ApiKeyRequestsParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ApiKeyRequestLog>>(
    `${keyPath(projectId, keyId)}/requests`,
    { params, signal },
  );
  return data;
}
