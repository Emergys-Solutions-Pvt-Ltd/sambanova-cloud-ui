import { apiClient } from "@/lib/api";
import { type User } from "@/types/domain";

export async function getCurrentUser(signal?: AbortSignal) {
  const { data } = await apiClient.get<User>("/me", { signal });
  return data;
}
