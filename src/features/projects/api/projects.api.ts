import { apiClient } from "@/lib/api";
import { type Project } from "@/types/domain";

export async function listProjects(signal?: AbortSignal) {
  const { data } = await apiClient.get<Project[]>("/projects", { signal });
  return data;
}

export async function getProject(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<Project>(`/projects/${encodeURIComponent(projectId)}`, {
    signal,
  });
  return data;
}
