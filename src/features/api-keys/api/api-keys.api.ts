import { apiClient, type PaginatedResponse } from "@/lib/api";
import {
  type ApiKey,
  type ApiKeyListParams,
  type CreateApiKeyInput,
  type CreatedApiKey,
} from "@/types/domain";

/** One page of the project's keys; search and status filtering happen on the server. */
export async function listApiKeys(
  projectId: string,
  { page, pageSize, search, status }: ApiKeyListParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ApiKey>>(
    `/projects/${encodeURIComponent(projectId)}/api-keys`,
    {
      params: { page, pageSize, ...(search && { search }), ...(status !== "all" && { status }) },
      signal,
    },
  );
  return data;
}

/** The response carries the secret exactly once; the list endpoint never returns it. */
export async function createApiKey(projectId: string, input: CreateApiKeyInput) {
  const { data } = await apiClient.post<CreatedApiKey>(
    `/projects/${encodeURIComponent(projectId)}/api-keys`,
    input,
    { skipRetry: true },
  );
  return data;
}
