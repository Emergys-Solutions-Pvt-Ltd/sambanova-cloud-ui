import { apiClient } from "@/lib/api";
import {
  type CreateProjectInput,
  type Project,
  type ProjectDetails,
  type UpdateProjectInput,
} from "@/types/domain";

const projectPath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;

export async function listProjects(signal?: AbortSignal) {
  const { data } = await apiClient.get<Project[]>("/projects", { signal });
  return data;
}

/** One project with its settings fields (description, creator, member count, your role). */
export async function getProject(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ProjectDetails>(projectPath(projectId), { signal });
  return data;
}

export async function createProject(input: CreateProjectInput) {
  const { data } = await apiClient.post<Project>("/projects", input, { skipRetry: true });
  return data;
}

/** Renames and/or re-describes a project. */
export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const { data } = await apiClient.patch<ProjectDetails>(projectPath(projectId), input, {
    skipRetry: true,
  });
  return data;
}

/** Deletes a project (204). The API refuses the default project. */
export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(projectPath(projectId), { skipRetry: true });
}
