import { apiClient } from "@/lib/api";
import { type ApiKey } from "@/types/domain";

export async function listApiKeys(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ApiKey[]>(
    `/projects/${encodeURIComponent(projectId)}/api-keys`,
    { signal },
  );
  return data;
}
