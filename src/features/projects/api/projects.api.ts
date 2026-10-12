import { apiClient } from "@/lib/api";
import { type CreateProjectInput, type Project } from "@/types/domain";

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

export async function createProject(input: CreateProjectInput) {
  const { data } = await apiClient.post<Project>("/projects", input, { skipRetry: true });
  return data;
}
