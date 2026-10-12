import { apiClient } from "@/lib/api";
import { type ApiKey, type CreateApiKeyInput, type CreatedApiKey } from "@/types/domain";

export async function listApiKeys(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiKey[]>(
    `/projects/${encodeURIComponent(projectId)}/api-keys`,
    { signal },
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
