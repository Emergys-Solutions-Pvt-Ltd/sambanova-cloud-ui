import { apiClient, type PaginatedResponse } from "@/lib/api";
import {
  type ApiKey,
  type ApiKeyListParams,
  type CreateApiKeyInput,
  type CreatedApiKey,
  type RotateApiKeyInput,
  type UpdateApiKeyInput,
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

/** Renames a key and/or changes its status (disable, enable). */
export async function updateApiKey(projectId: string, keyId: string, input: UpdateApiKeyInput) {
  const { data } = await apiClient.patch<ApiKey>(
    `/projects/${encodeURIComponent(projectId)}/api-keys/${encodeURIComponent(keyId)}`,
    input,
    { skipRetry: true },
  );
  return data;
}

/** Generates a new secret for the key (returned once). The old secret works until the grace period ends. */
export async function rotateApiKey(projectId: string, keyId: string, input: RotateApiKeyInput) {
  const { data } = await apiClient.post<CreatedApiKey>(
    `/projects/${encodeURIComponent(projectId)}/api-keys/${encodeURIComponent(keyId)}/rotate`,
    input,
    { skipRetry: true },
  );
  return data;
}

export async function deleteApiKey(projectId: string, keyId: string) {
  await apiClient.delete(
    `/projects/${encodeURIComponent(projectId)}/api-keys/${encodeURIComponent(keyId)}`,
    { skipRetry: true },
  );
}
