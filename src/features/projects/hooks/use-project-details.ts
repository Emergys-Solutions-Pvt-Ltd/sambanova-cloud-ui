"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useProjectStore } from "@/stores/project-store";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type Project, type ProjectDetails, type UpdateProjectInput } from "@/types/domain";

import { deleteProject, getProject, updateProject } from "../api/projects.api";
import { useSwitchProject } from "./use-projects";

/** Settings fields of one project (Project Settings › General). Signed-in users only. */
export function useProjectDetails(projectId: string | undefined) {
  const authenticated = useSessionStore(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ""),
    queryFn: ({ signal }) => getProject(projectId!, signal),
    enabled: authenticated && Boolean(projectId),
  });
}

interface UpdateProjectVariables {
  projectId: string;
  input: UpdateProjectInput;
}

/** Renames or re-describes a project; the project list (selector) picks up a new name at once. */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation<ProjectDetails, ApiError, UpdateProjectVariables>({
    mutationFn: ({ projectId, input }) => updateProject(projectId, input),
    onSuccess: (details) => {
      queryClient.setQueryData(queryKeys.projects.detail(details.id), details);
      queryClient.setQueryData<Project[]>(queryKeys.projects.list(), (current) =>
        current?.map((project) =>
          project.id === details.id ? { ...project, name: details.name } : project,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
}

/**
 * Deletes a project. When it was the active one, the default project becomes active; the deleted
 * project's cached data is dropped either way.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const switchProject = useSwitchProject();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteProject,
    onSuccess: (_data, projectId) => {
      const projects = queryClient.getQueryData<Project[]>(queryKeys.projects.list()) ?? [];
      const remaining = projects.filter((project) => project.id !== projectId);
      queryClient.setQueryData(queryKeys.projects.list(), remaining);

      const fallback = remaining.find((project) => project.isDefault) ?? remaining[0];
      if (fallback && useProjectStore.getState().activeProjectId === projectId) {
        switchProject(fallback.id);
      }

      queryClient.removeQueries({ queryKey: queryKeys.project(projectId) });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
}
